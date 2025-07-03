'use server'

import { databases } from '@/lib/appwrite'
import { Query } from 'appwrite'
import { getAccount } from './getAccount'
import type { Segment, Contact } from '@/types/schema'
import { 
  MAILING_DATABASE_ID, 
  SEGMENTS_COLLECTION_ID, 
  CONTACT_SEGMENTS_COLLECTION_ID, 
  CONTACTS_COLLECTION_ID 
} from './segments/constants'

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
      MAILING_DATABASE_ID,
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
    const relations = await databases.listDocuments(
      MAILING_DATABASE_ID,
      CONTACT_SEGMENTS_COLLECTION_ID,
      [Query.limit(1000)]
    )

    let cleanedCount = 0
    for (const relation of relations.documents) {
      try {
        // Vérifier si le contact et le segment existent
        await databases.getDocument(MAILING_DATABASE_ID, CONTACTS_COLLECTION_ID, relation.contact_id)
        await databases.getDocument(MAILING_DATABASE_ID, SEGMENTS_COLLECTION_ID, relation.segment_id)
      } catch (error) {
        // Si l'un n'existe pas, supprimer la relation
        try {
          await databases.deleteDocument(
            MAILING_DATABASE_ID,
            CONTACT_SEGMENTS_COLLECTION_ID,
            relation.$id
          )
          cleanedCount++
        } catch (deleteError) {
          console.error("Erreur lors de la suppression:", deleteError)
        }
      }
    }

    if (cleanedCount > 0) {
      optimizations.push({
        type: 'cleanup_orphaned',
        cleaned_count: cleanedCount
      })
    }

    // 2. Supprimer les doublons de relations
    const allRelations = await databases.listDocuments(
      MAILING_DATABASE_ID,
      CONTACT_SEGMENTS_COLLECTION_ID,
      [Query.limit(5000)]
    )

    const seen = new Set()
    let duplicatesRemoved = 0

    for (const relation of allRelations.documents) {
      const key = `${relation.contact_id}_${relation.segment_id}`
      if (seen.has(key)) {
        try {
          await databases.deleteDocument(
            MAILING_DATABASE_ID,
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
