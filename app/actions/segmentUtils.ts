'use server'

import { databases } from '@/lib/appwrite'
import { Query } from 'appwrite'
import { getAccount } from './getAccount'
import type { Segment, Contact } from '@/types/schema'

const USERS_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_DATABASE_ID as string
const SEGMENTS_COLLECTION_ID =process.env.NEXT_PUBLIC_APPWRITE_SEGMENTS_DATABASE_ID as string, 
const CONTACT_SEGMENTS_COLLECTION_ID =process.env.NEXT_PUBLIC_APPWRITE_SEGMENTS_DATABASE_ID as string, 
const CONTACTS_COLLECTION_ID =process.env.NEXT_PUBLIC_APPWRITE_SEGMENTS_DATABASE_ID as string

/**
 * Utilitaires pour les opérations de segments
 */

// Cache en mémoire pour optimiser les requêtes répétées
const segmentCache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Fonction pour mettre en cache les segments
function cacheSegments(userId: string, segments: Segment[]) {
  segmentCache.set(userId, {
    data: segments,
    timestamp: Date.now()
  })
}

// Fonction pour récupérer les segments depuis le cache
function getCachedSegments(userId: string): Segment[] | null {
  const cached = segmentCache.get(userId)
  if (!cached) return null
  
  const isExpired = Date.now() - cached.timestamp > CACHE_TTL
  if (isExpired) {
    segmentCache.delete(userId)
    return null
  }
  
  return cached.data
}

/**
 * Récupérer les segments avec mise en cache
 */
export async function getSegmentsCached(): Promise<Segment[]> {
  try {
    const account = await getAccount()
    if (!account) {
      return []
    }

    // Vérifier le cache d'abord
    const cached = getCachedSegments(account.$id)
    if (cached) {
      return cached
    }

    // Si pas en cache, récupérer depuis la DB
    const response = await databases.listDocuments(
      USERS_DATABASE_ID,
      SEGMENTS_COLLECTION_ID,
      [
        Query.equal("user_id", account.$id),
        Query.orderDesc("created_at"),
        Query.limit(100)
      ]
    )

    const segments = response.documents as unknown as Segment[]
    
    // Mettre en cache
    cacheSegments(account.$id, segments)
    
    return segments
  } catch (error) {
    console.error("Erreur lors de la récupération des segments avec cache:", error)
    return []
  }
}

/**
 * Invalider le cache des segments pour un utilisateur
 */
export function invalidateSegmentCache(userId?: string) {
  if (userId) {
    segmentCache.delete(userId)
  } else {
    segmentCache.clear()
  }
}

/**
 * Valider l'intégrité des données de segments
 */
export async function validateSegmentIntegrity() {
  try {
    const account = await getAccount()
    if (!account) {
      return { success: false, error: "Non autorisé" }
    }

    const issues = []
    let fixedIssues = 0

    // 1. Vérifier les segments sans utilisateur valide
    const segments = await databases.listDocuments(
      USERS_DATABASE_ID,
      SEGMENTS_COLLECTION_ID,
      [Query.limit(1000)]
    )

    for (const segment of segments.documents) {
      if (!segment.user_id) {
        issues.push({
          type: 'missing_user_id',
          segment_id: segment.$id,
          segment_name: segment.name
        })
      }
    }

    // 2. Vérifier les relations orphelines
    const relations = await databases.listDocuments(
      USERS_DATABASE_ID,
      CONTACT_SEGMENTS_COLLECTION_ID,
      [Query.limit(5000)]
    )

    for (const relation of relations.documents) {
      try {
        // Vérifier si le segment existe
        await databases.getDocument(
          USERS_DATABASE_ID,
          SEGMENTS_COLLECTION_ID,
          relation.segment_id
        )
        
        // Vérifier si le contact existe
        await databases.getDocument(
          USERS_DATABASE_ID,
          CONTACTS_COLLECTION_ID,
          relation.contact_id
        )
      } catch (error) {
        issues.push({
          type: 'orphaned_relation',
          relation_id: relation.$id,
          segment_id: relation.segment_id,
          contact_id: relation.contact_id
        })
      }
    }

    // 3. Vérifier les doublons de relations
    const relationMap = new Map()
    for (const relation of relations.documents) {
      const key = `${relation.contact_id}_${relation.segment_id}`
      if (relationMap.has(key)) {
        issues.push({
          type: 'duplicate_relation',
          relation_id: relation.$id,
          duplicate_of: relationMap.get(key),
          segment_id: relation.segment_id,
          contact_id: relation.contact_id
        })
      } else {
        relationMap.set(key, relation.$id)
      }
    }

    return {
      success: true,
      issues,
      total_issues: issues.length,
      issues_by_type: {
        missing_user_id: issues.filter(i => i.type === 'missing_user_id').length,
        orphaned_relation: issues.filter(i => i.type === 'orphaned_relation').length,
        duplicate_relation: issues.filter(i => i.type === 'duplicate_relation').length
      }
    }
  } catch (error: any) {
    console.error("Erreur lors de la validation de l'intégrité:", error)
    return { success: false, error: error.message || "Erreur lors de la validation" }
  }
}

/**
 * Optimiser les performances des segments
 */
export async function optimizeSegmentPerformance() {
  try {
    const account = await getAccount()
    if (!account) {
      return { success: false, error: "Non autorisé" }
    }

    const optimizations = []

    // 1. Nettoyer les relations orphelines
    const cleanupResult = await cleanupOrphanedRelations()
    if (cleanupResult.success) {
      optimizations.push({
        type: 'cleanup_orphaned',
        cleaned_count: cleanupResult.cleaned_count
      })
    }

    // 2. Supprimer les doublons de relations
    const relations = await databases.listDocuments(
      USERS_DATABASE_ID,
      CONTACT_SEGMENTS_COLLECTION_ID,
      [Query.limit(5000)]
    )

    const seen = new Set()
    let duplicatesRemoved = 0

    for (const relation of relations.documents) {
      const key = `${relation.contact_id}_${relation.segment_id}`
      if (seen.has(key)) {
        try {
          await databases.deleteDocument(
            USERS_DATABASE_ID,
            CONTACT_SEGMENTS_COLLECTION_ID,
            relation.$id
          )
          duplicatesRemoved++
        } catch (error) {
          console.error("Erreur lors de la suppression du doublon:", error)
        }
      } else {
        seen.add(key)
      }
    }

    if (duplicatesRemoved > 0) {
      optimizations.push({
        type: 'remove_duplicates',
        removed_count: duplicatesRemoved
      })
    }

    // 3. Invalider le cache pour forcer le refresh
    invalidateSegmentCache(account.$id)
    optimizations.push({
      type: 'cache_invalidated'
    })

    return {
      success: true,
      optimizations,
      total_optimizations: optimizations.length
    }
  } catch (error: any) {
    console.error("Erreur lors de l'optimisation:", error)
    return { success: false, error: error.message || "Erreur lors de l'optimisation" }
  }
}

// Import de la fonction cleanupOrphanedRelations depuis segments.ts
async function cleanupOrphanedRelations() {
  // Cette fonction est déjà définie dans segments.ts
  // On pourrait l'importer mais pour éviter les dépendances circulaires,
  // on la redéfinit ici de manière simplifiée
  try {
    const account = await getAccount()
    if (!account) {
      return { success: false, error: "Non autorisé" }
    }

    const relations = await databases.listDocuments(
      USERS_DATABASE_ID,
      CONTACT_SEGMENTS_COLLECTION_ID,
      [Query.limit(1000)]
    )

    let cleanedCount = 0

    for (const relation of relations.documents) {
      try {
        // Vérifier si le contact et le segment existent
        await databases.getDocument(USERS_DATABASE_ID, CONTACTS_COLLECTION_ID, relation.contact_id)
        await databases.getDocument(USERS_DATABASE_ID, SEGMENTS_COLLECTION_ID, relation.segment_id)
      } catch (error) {
        // Si l'un n'existe pas, supprimer la relation
        try {
          await databases.deleteDocument(
            USERS_DATABASE_ID,
            CONTACT_SEGMENTS_COLLECTION_ID,
            relation.$id
          )
          cleanedCount++
        } catch (deleteError) {
          console.error("Erreur lors de la suppression:", deleteError)
        }
      }
    }

    return { success: true, cleaned_count: cleanedCount }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Analyser les tendances d'utilisation des segments
 */
export async function analyzeSegmentUsage() {
  try {
    const account = await getAccount()
    if (!account) {
      return { success: false, error: "Non autorisé" }
    }

    // Récupérer tous les segments de l'utilisateur
    const segments = await databases.listDocuments(
      USERS_DATABASE_ID,
      SEGMENTS_COLLECTION_ID,
      [
        Query.equal("user_id", account.$id),
        Query.limit(1000)
      ]
    )

    // Récupérer toutes les relations
    const relations = await databases.listDocuments(
      USERS_DATABASE_ID,
      CONTACT_SEGMENTS_COLLECTION_ID,
      [Query.limit(5000)]
    )

    // Analyser l'utilisation par segment
    const segmentUsage = segments.documents.map(segment => {
      const segmentRelations = relations.documents.filter(rel => rel.segment_id === segment.$id)
      
      return {
        segment_id: segment.$id,
        segment_name: segment.name,
        segment_color: segment.color,
        contact_count: segmentRelations.length,
        created_at: segment.created_at,
        updated_at: segment.updated_at,
        days_since_creation: segment.created_at 
          ? Math.floor((Date.now() - new Date(segment.created_at).getTime()) / (1000 * 60 * 60 * 24))
          : 0,
        days_since_update: segment.updated_at 
          ? Math.floor((Date.now() - new Date(segment.updated_at).getTime()) / (1000 * 60 * 60 * 24))
          : 0
      }
    })

    // Calculer les statistiques globales
    const totalContacts = new Set(relations.documents.map(rel => rel.contact_id)).size
    const totalSegments = segments.documents.length
    const totalRelations = relations.documents.length
    const averageContactsPerSegment = totalSegments > 0 ? totalRelations / totalSegments : 0

    // Identifier les segments les plus/moins utilisés
    const sortedByUsage = [...segmentUsage].sort((a, b) => b.contact_count - a.contact_count)
    const mostUsedSegments = sortedByUsage.slice(0, 5)
    const leastUsedSegments = sortedByUsage.slice(-5).reverse()
    const emptySegments = segmentUsage.filter(s => s.contact_count === 0)
    const staleSegments = segmentUsage.filter(s => s.days_since_update > 30 && s.contact_count > 0)

    // Analyser la distribution des couleurs
    const colorDistribution = segmentUsage.reduce((acc, segment) => {
      acc[segment.segment_color] = (acc[segment.segment_color] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      success: true,
      analysis: {
        overview: {
          total_segments: totalSegments,
          total_unique_contacts: totalContacts,
          total_relations: totalRelations,
          average_contacts_per_segment: Math.round(averageContactsPerSegment * 100) / 100
        },
        segment_usage: segmentUsage,
        insights: {
          most_used_segments: mostUsedSegments,
          least_used_segments: leastUsedSegments,
          empty_segments: emptySegments,
          stale_segments: staleSegments
        },
        color_distribution: colorDistribution,
        recommendations: [
          ...(emptySegments.length > 0 ? [{
            type: 'cleanup',
            message: `Vous avez ${emptySegments.length} segment(s) vide(s) qui pourrait(ent) être supprimé(s)`
          }] : []),
          ...(staleSegments.length > 0 ? [{
            type: 'update',
            message: `${staleSegments.length} segment(s) n'ont pas été mis à jour depuis plus de 30 jours`
          }] : []),
          ...(totalSegments > 20 ? [{
            type: 'organization',
            message: `Vous avez ${totalSegments} segments. Considérez fusionner ou réorganiser pour une meilleure efficacité`
          }] : [])
        ]
      }
    }
  } catch (error: any) {
    console.error("Erreur lors de l'analyse des tendances:", error)
    return { success: false, error: error.message || "Erreur lors de l'analyse" }
  }
}
