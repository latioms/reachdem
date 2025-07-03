'use server'

import { databases } from '@/lib/appwrite'
import { ID, Query } from 'appwrite'
import { getAccount } from '../getAccount'
import { revalidatePath } from 'next/cache'
import { getSegmentById } from './getSegments'
import type { Segment } from '@/types/schema'

const MAILING_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_MAILING_DATABASE_ID as string
const SEGMENTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_SEGMENTS_COLLECTION_ID as string
const CONTACT_SEGMENTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_CONTACT_SEGMENTS_COLLECTION_ID as string
const CONTACTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_CONTACTS_COLLECTION_ID as string

/**
 * Dupliquer un segment
 */
export async function duplicateSegment(segmentId: string, newName?: string) {
  try {
    const account = await getAccount()
    if (!account) {
      return {
        success: false,
        error: "User not authenticated"
      }
    }

    // Récupérer le segment source
    const segmentResult = await getSegmentById(segmentId)
    if (!segmentResult.success || !segmentResult.data) {
      return {
        success: false,
        error: "Source segment not found"
      }
    }

    const sourceSegment = segmentResult.data

    // Générer un nom unique si non fourni
    const duplicateName = newName || `${sourceSegment.name} (Copy)`
    
    // Vérifier l'unicité du nom
    const existingSegments = await databases.listDocuments(
      MAILING_DATABASE_ID,
      SEGMENTS_COLLECTION_ID,
      [
        Query.equal("user_id", account.$id),
        Query.equal("name", duplicateName)
      ]
    )

    if (existingSegments.documents.length > 0) {
      return {
        success: false,
        error: "A segment with this name already exists"
      }
    }

    // Créer le nouveau segment
    const newSegment = await databases.createDocument(
      MAILING_DATABASE_ID,
      SEGMENTS_COLLECTION_ID,
      ID.unique(),
      {
        name: duplicateName,
        color: sourceSegment.color,
        description: sourceSegment.description || "",
        user_id: account.$id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    )

    // Copier toutes les relations contact-segment
    const sourceRelations = await databases.listDocuments(
      MAILING_DATABASE_ID,
      CONTACT_SEGMENTS_COLLECTION_ID,
      [
        Query.equal("segment_id", segmentId),
        Query.limit(1000)
      ]
    )

    let copiedRelations = 0
    for (const relation of sourceRelations.documents) {
      try {
        await databases.createDocument(
          MAILING_DATABASE_ID,
          CONTACT_SEGMENTS_COLLECTION_ID,
          ID.unique(),
          {
            contact_id: relation.contact_id,
            segment_id: newSegment.$id,
            created_at: new Date().toISOString()
          }
        )
        copiedRelations++
      } catch (error) {
        console.warn("Error copying relation:", error)
      }
    }

    revalidatePath("/dashboard/segments")

    return { 
      success: true, 
      data: newSegment as unknown as Segment,
      copied_contacts: copiedRelations
    }
  } catch (error: any) {
    console.error("Error duplicating segment:", error)
    return {
      success: false,
      error: error.message || "An error occurred while duplicating the segment"
    }
  }
}

/**
 * Fusionner plusieurs segments
 */
export async function mergeSegments(
  targetSegmentId: string, 
  sourceSegmentIds: string[], 
  deleteSourceSegments: boolean = true
) {
  try {
    const account = await getAccount()
    if (!account) {
      return {
        success: false,
        error: "User not authenticated"
      }
    }

    // Vérifier que le segment cible existe et appartient à l'utilisateur
    const targetSegmentResult = await getSegmentById(targetSegmentId)
    if (!targetSegmentResult.success || !targetSegmentResult.data) {
      return {
        success: false,
        error: "Target segment not found"
      }
    }

    let totalContactsMerged = 0
    const mergeResults = []

    for (const sourceSegmentId of sourceSegmentIds) {
      try {
        // Vérifier que le segment source existe
        const sourceSegmentResult = await getSegmentById(sourceSegmentId)
        if (!sourceSegmentResult.success || !sourceSegmentResult.data) {
          mergeResults.push({ 
            segmentId: sourceSegmentId, 
            success: false, 
            error: "Source segment not found" 
          })
          continue
        }

        // Récupérer tous les contacts du segment source
        const sourceContacts = await databases.listDocuments(
          MAILING_DATABASE_ID,
          CONTACT_SEGMENTS_COLLECTION_ID,
          [
            Query.equal("segment_id", sourceSegmentId),
            Query.limit(1000)
          ]
        )

        let movedContacts = 0

        // Déplacer les contacts vers le segment cible
        for (const relation of sourceContacts.documents) {
          try {
            // Vérifier si le contact n'est pas déjà dans le segment cible
            const existingRelation = await databases.listDocuments(
              MAILING_DATABASE_ID,
              CONTACT_SEGMENTS_COLLECTION_ID,
              [
                Query.equal("contact_id", relation.contact_id),
                Query.equal("segment_id", targetSegmentId)
              ]
            )

            if (existingRelation.documents.length === 0) {
              // Créer la nouvelle relation
              await databases.createDocument(
                MAILING_DATABASE_ID,
                CONTACT_SEGMENTS_COLLECTION_ID,
                ID.unique(),
                {
                  contact_id: relation.contact_id,
                  segment_id: targetSegmentId,
                  created_at: new Date().toISOString(),
                }
              )
              movedContacts++
              totalContactsMerged++
            }

            // Supprimer l'ancienne relation
            await databases.deleteDocument(
              MAILING_DATABASE_ID,
              CONTACT_SEGMENTS_COLLECTION_ID,
              relation.$id
            )
          } catch (relationError) {
            console.warn(`Error moving contact ${relation.contact_id}:`, relationError)
          }
        }

        // Supprimer le segment source si demandé
        if (deleteSourceSegments) {
          await databases.deleteDocument(
            MAILING_DATABASE_ID,
            SEGMENTS_COLLECTION_ID,
            sourceSegmentId
          )
        }

        mergeResults.push({ 
          segmentId: sourceSegmentId, 
          success: true, 
          contactsMoved: movedContacts
        })

      } catch (error: any) {
        mergeResults.push({ 
          segmentId: sourceSegmentId, 
          success: false, 
          error: error.message 
        })
      }
    }

    // Mettre à jour le timestamp du segment cible
    await databases.updateDocument(
      MAILING_DATABASE_ID,
      SEGMENTS_COLLECTION_ID,
      targetSegmentId,
      { updated_at: new Date().toISOString() }
    )

    revalidatePath("/dashboard/segments")
    revalidatePath("/dashboard/contacts")

    return { 
      success: true, 
      total_contacts_merged: totalContactsMerged,
      merge_results: mergeResults
    }
  } catch (error: any) {
    console.error("Error merging segments:", error)
    return {
      success: false,
      error: error.message || "An error occurred while merging segments"
    }
  }
}

/**
 * Opération de nettoyage - supprimer les segments vides
 */
export async function cleanupEmptySegments() {
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

    const emptySegments = []

    // Identifier les segments vides
    for (const segment of segments.documents) {
      const relations = await databases.listDocuments(
        MAILING_DATABASE_ID,
        CONTACT_SEGMENTS_COLLECTION_ID,
        [
          Query.equal("segment_id", segment.$id),
          Query.limit(1)
        ]
      )

      if (relations.documents.length === 0) {
        emptySegments.push(segment)
      }
    }

    // Supprimer les segments vides
    let deletedCount = 0
    const deletionResults = []

    for (const segment of emptySegments) {
      try {
        await databases.deleteDocument(
          MAILING_DATABASE_ID,
          SEGMENTS_COLLECTION_ID,
          segment.$id
        )
        deletedCount++
        deletionResults.push({
          segmentId: segment.$id,
          segmentName: segment.name,
          success: true
        })
      } catch (error: any) {
        deletionResults.push({
          segmentId: segment.$id,
          segmentName: segment.name,
          success: false,
          error: error.message
        })
      }
    }

    revalidatePath("/dashboard/segments")

    return {
      success: true,
      deleted_segments: deletedCount,
      total_empty_segments: emptySegments.length,
      deletion_results: deletionResults
    }
  } catch (error: any) {
    console.error("Error cleaning up empty segments:", error)
    return {
      success: false,
      error: error.message || "An error occurred while cleaning up empty segments"
    }
  }
}

/**
 * Nettoyer les relations orphelines
 */
export async function cleanupOrphanedRelations() {
  try {
    const account = await getAccount()
    if (!account) {
      return {
        success: false,
        error: "User not authenticated"
      }
    }

    // Récupérer toutes les relations
    const relations = await databases.listDocuments(
      MAILING_DATABASE_ID,
      CONTACT_SEGMENTS_COLLECTION_ID,
      [Query.limit(5000)]
    )

    let cleanedCount = 0
    const cleanupResults = []

    for (const relation of relations.documents) {
      try {
        // Vérifier si le contact existe
        await databases.getDocument(
          MAILING_DATABASE_ID, 
          CONTACTS_COLLECTION_ID, 
          relation.contact_id
        )
        
        // Vérifier si le segment existe
        await databases.getDocument(
          MAILING_DATABASE_ID, 
          SEGMENTS_COLLECTION_ID, 
          relation.segment_id
        )
      } catch (error) {
        // Si l'un n'existe pas, supprimer la relation
        try {
          await databases.deleteDocument(
            MAILING_DATABASE_ID,
            CONTACT_SEGMENTS_COLLECTION_ID,
            relation.$id
          )
          cleanedCount++
          cleanupResults.push({
            relationId: relation.$id,
            contactId: relation.contact_id,
            segmentId: relation.segment_id,
            success: true
          })
        } catch (deleteError: any) {
          cleanupResults.push({
            relationId: relation.$id,
            contactId: relation.contact_id,
            segmentId: relation.segment_id,
            success: false,
            error: deleteError.message
          })
        }
      }
    }

    return { 
      success: true, 
      cleaned_relations: cleanedCount,
      cleanup_results: cleanupResults
    }
  } catch (error: any) {
    console.error("Error cleaning up orphaned relations:", error)
    return {
      success: false,
      error: error.message || "An error occurred while cleaning up orphaned relations"
    }
  }
}

/**
 * Supprimer les doublons de relations
 */
export async function removeDuplicateRelations() {
  try {
    const account = await getAccount()
    if (!account) {
      return {
        success: false,
        error: "User not authenticated"
      }
    }

    // Récupérer toutes les relations
    const relations = await databases.listDocuments(
      MAILING_DATABASE_ID,
      CONTACT_SEGMENTS_COLLECTION_ID,
      [Query.limit(5000)]
    )

    const seen = new Set()
    let duplicatesRemoved = 0
    const removalResults = []

    for (const relation of relations.documents) {
      const key = `${relation.contact_id}_${relation.segment_id}`
      
      if (seen.has(key)) {
        try {
          await databases.deleteDocument(
            MAILING_DATABASE_ID,
            CONTACT_SEGMENTS_COLLECTION_ID,
            relation.$id
          )
          duplicatesRemoved++
          removalResults.push({
            relationId: relation.$id,
            contactId: relation.contact_id,
            segmentId: relation.segment_id,
            success: true
          })
        } catch (error: any) {
          removalResults.push({
            relationId: relation.$id,
            contactId: relation.contact_id,
            segmentId: relation.segment_id,
            success: false,
            error: error.message
          })
        }
      } else {
        seen.add(key)
      }
    }

    return {
      success: true,
      removed_duplicates: duplicatesRemoved,
      removal_results: removalResults
    }
  } catch (error: any) {
    console.error("Error removing duplicate relations:", error)
    return {
      success: false,
      error: error.message || "An error occurred while removing duplicate relations"
    }
  }
}
