'use server'

import { databases } from '@/lib/appwrite'
import { Query } from 'appwrite'
import { getAccount } from '../getAccount'

const MAILING_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_MAILING_DATABASE_ID as string
const SEGMENTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_SEGMENTS_COLLECTION_ID as string
const CONTACT_SEGMENTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_CONTACT_SEGMENTS_COLLECTION_ID as string
const CONTACTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_CONTACTS_COLLECTION_ID as string

/**
 * Valider l'intégrité des données de segments
 */
export async function validateSegmentIntegrity() {
  try {
    const account = await getAccount()
    if (!account) {
      return { 
        success: false, 
        error: "User not authenticated" 
      }
    }

    const issues = []

    // 1. Vérifier les segments sans utilisateur valide
    const segments = await databases.listDocuments(
      MAILING_DATABASE_ID,
      SEGMENTS_COLLECTION_ID,
      [
        Query.equal("user_id", account.$id),
        Query.limit(1000)
      ]
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
      MAILING_DATABASE_ID,
      CONTACT_SEGMENTS_COLLECTION_ID,
      [Query.limit(5000)]
    )

    // Filtrer les relations pour les segments de l'utilisateur
    const userSegmentIds = segments.documents.map(s => s.$id)
    const userRelations = relations.documents.filter(rel => 
      userSegmentIds.includes(rel.segment_id)
    )

    for (const relation of userRelations) {
      try {
        // Vérifier si le segment existe
        await databases.getDocument(
          MAILING_DATABASE_ID,
          SEGMENTS_COLLECTION_ID,
          relation.segment_id
        )
        
        // Vérifier si le contact existe
        await databases.getDocument(
          MAILING_DATABASE_ID,
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
    for (const relation of userRelations) {
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

    // 4. Vérifier les segments avec des noms en double
    const segmentNames = new Map()
    for (const segment of segments.documents) {
      const name = segment.name.toLowerCase()
      if (segmentNames.has(name)) {
        issues.push({
          type: 'duplicate_name',
          segment_id: segment.$id,
          segment_name: segment.name,
          duplicate_of: segmentNames.get(name)
        })
      } else {
        segmentNames.set(name, segment.$id)
      }
    }

    return {
      success: true,
      data: {
        issues,
        total_issues: issues.length,
        issues_by_type: {
          missing_user_id: issues.filter(i => i.type === 'missing_user_id').length,
          orphaned_relation: issues.filter(i => i.type === 'orphaned_relation').length,
          duplicate_relation: issues.filter(i => i.type === 'duplicate_relation').length,
          duplicate_name: issues.filter(i => i.type === 'duplicate_name').length
        },
        health_score: Math.max(0, 100 - (issues.length * 5)) // Score de santé sur 100
      }
    }
  } catch (error: any) {
    console.error("Error validating segment integrity:", error)
    return { 
      success: false, 
      error: error.message || "An error occurred during validation" 
    }
  }
}

/**
 * Vérifier la cohérence des données de segments
 */
export async function checkSegmentConsistency() {
  try {
    const account = await getAccount()
    if (!account) {
      return { 
        success: false, 
        error: "User not authenticated" 
      }
    }

    // Récupérer tous les segments de l'utilisateur
    const segments = await databases.listDocuments(
      MAILING_DATABASE_ID,
      SEGMENTS_COLLECTION_ID,
      [
        Query.equal("user_id", account.$id),
        Query.limit(1000)
      ]
    )

    // Récupérer toutes les relations pour les segments de l'utilisateur
    const allRelations = await databases.listDocuments(
      MAILING_DATABASE_ID,
      CONTACT_SEGMENTS_COLLECTION_ID,
      [Query.limit(5000)]
    )

    const userSegmentIds = segments.documents.map(s => s.$id)
    const userRelations = allRelations.documents.filter(rel => 
      userSegmentIds.includes(rel.segment_id)
    )

    const consistencyReport: {
      segments_count: number
      relations_count: number
      unique_contacts: number
      segments_analysis: Array<{
        segment_id: string
        segment_name: string
        total_relations: number
        unique_contacts: number
        duplicate_relations: number
        has_description: boolean
        created_at: string
        updated_at: string
      }>
      potential_issues: Array<{
        type: string
        segment_id: string
        segment_name: string
        count?: number
      }>
    } = {
      segments_count: segments.documents.length,
      relations_count: userRelations.length,
      unique_contacts: new Set(userRelations.map(r => r.contact_id)).size,
      segments_analysis: [],
      potential_issues: []
    }

    // Analyser chaque segment
    for (const segment of segments.documents) {
      const segmentRelations = userRelations.filter(r => r.segment_id === segment.$id)
      const uniqueContacts = new Set(segmentRelations.map(r => r.contact_id))
      
      const analysis = {
        segment_id: segment.$id,
        segment_name: segment.name,
        total_relations: segmentRelations.length,
        unique_contacts: uniqueContacts.size,
        duplicate_relations: segmentRelations.length - uniqueContacts.size,
        has_description: !!segment.description,
        created_at: segment.created_at,
        updated_at: segment.updated_at
      }

      consistencyReport.segments_analysis.push(analysis)

      // Identifier les problèmes potentiels
      if (analysis.duplicate_relations > 0) {
        consistencyReport.potential_issues.push({
          type: 'duplicate_relations',
          segment_id: segment.$id,
          segment_name: segment.name,
          count: analysis.duplicate_relations
        })
      }

      if (analysis.total_relations === 0) {
        consistencyReport.potential_issues.push({
          type: 'empty_segment',
          segment_id: segment.$id,
          segment_name: segment.name
        })
      }

      if (!analysis.has_description) {
        consistencyReport.potential_issues.push({
          type: 'missing_description',
          segment_id: segment.$id,
          segment_name: segment.name
        })
      }
    }

    return {
      success: true,
      data: consistencyReport
    }
  } catch (error: any) {
    console.error("Error checking segment consistency:", error)
    return { 
      success: false, 
      error: error.message || "An error occurred during consistency check" 
    }
  }
}

/**
 * Réparer automatiquement les problèmes détectés
 */
export async function autoRepairSegmentIssues() {
  try {
    const account = await getAccount()
    if (!account) {
      return { 
        success: false, 
        error: "User not authenticated" 
      }
    }

    const repairResults = {
      orphaned_relations_cleaned: 0,
      duplicate_relations_removed: 0,
      empty_segments_removed: 0,
      total_issues_fixed: 0
    }

    // 1. Nettoyer les relations orphelines
    const relations = await databases.listDocuments(
      MAILING_DATABASE_ID,
      CONTACT_SEGMENTS_COLLECTION_ID,
      [Query.limit(5000)]
    )

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
          repairResults.orphaned_relations_cleaned++
        } catch (deleteError) {
          console.warn("Error deleting orphaned relation:", deleteError)
        }
      }
    }

    // 2. Supprimer les doublons de relations (pour les segments de l'utilisateur)
    const userSegments = await databases.listDocuments(
      MAILING_DATABASE_ID,
      SEGMENTS_COLLECTION_ID,
      [Query.equal("user_id", account.$id)]
    )

    const userSegmentIds = userSegments.documents.map(s => s.$id)
    const updatedRelations = await databases.listDocuments(
      MAILING_DATABASE_ID,
      CONTACT_SEGMENTS_COLLECTION_ID,
      [Query.limit(5000)]
    )

    const seen = new Set()
    for (const relation of updatedRelations.documents) {
      // Ne traiter que les relations des segments de l'utilisateur
      if (!userSegmentIds.includes(relation.segment_id)) continue

      const key = `${relation.contact_id}_${relation.segment_id}`
      if (seen.has(key)) {
        try {
          await databases.deleteDocument(
            MAILING_DATABASE_ID,
            CONTACT_SEGMENTS_COLLECTION_ID,
            relation.$id
          )
          repairResults.duplicate_relations_removed++
        } catch (error) {
          console.warn("Error removing duplicate relation:", error)
        }
      } else {
        seen.add(key)
      }
    }

    repairResults.total_issues_fixed = 
      repairResults.orphaned_relations_cleaned + 
      repairResults.duplicate_relations_removed + 
      repairResults.empty_segments_removed

    return {
      success: true,
      data: repairResults
    }
  } catch (error: any) {
    console.error("Error auto-repairing segment issues:", error)
    return { 
      success: false, 
      error: error.message || "An error occurred during auto-repair" 
    }
  }
}
