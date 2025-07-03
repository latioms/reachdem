'use server'

import { databases } from '@/lib/appwrite'
import { Query } from 'appwrite'
import { getAccount } from '../getAccount'
import { revalidatePath } from 'next/cache'
import { getSegmentById } from './getSegments'
import { 
  MAILING_DATABASE_ID, 
  SEGMENTS_COLLECTION_ID, 
  CONTACT_SEGMENTS_COLLECTION_ID 
} from './constants'

/**
 * Supprimer un segment
 */
export async function deleteSegment(segmentId: string) {
  try {
    const account = await getAccount()
    if (!account) {
      return {
        success: false,
        error: "User not authenticated, cannot delete segment"
      }
    }

    // Validation de l'ID du segment
    if (!segmentId) {
      return {
        success: false,
        error: "Segment ID is required"
      }
    }

    // Vérifier que le segment existe et appartient à l'utilisateur
    const segmentResult = await getSegmentById(segmentId)
    if (!segmentResult.success || !segmentResult.data) {
      return {
        success: false,
        error: segmentResult.error || "Segment not found"
      }
    }

    // Récupérer toutes les relations contact-segment pour ce segment
    const relations = await databases.listDocuments(
      MAILING_DATABASE_ID,
      CONTACT_SEGMENTS_COLLECTION_ID,
      [
        Query.equal("segment_id", segmentId),
        Query.limit(1000)
      ]
    )

    // Supprimer toutes les relations contact-segment
    let deletedRelations = 0
    for (const relation of relations.documents) {
      try {
        await databases.deleteDocument(
          MAILING_DATABASE_ID,
          CONTACT_SEGMENTS_COLLECTION_ID,
          relation.$id
        )
        deletedRelations++
      } catch (error) {
        console.warn(`Failed to delete relation ${relation.$id}:`, error)
      }
    }

    // Supprimer le segment
    await databases.deleteDocument(
      MAILING_DATABASE_ID,
      SEGMENTS_COLLECTION_ID,
      segmentId
    )

    // Revalider les chemins pour mettre à jour l'interface
    revalidatePath("/dashboard/segments")
    revalidatePath("/dashboard/contacts")

    return {
      success: true,
      deleted_relations: deletedRelations,
      message: `Segment deleted successfully. ${deletedRelations} contact relations were also removed.`
    }
  } catch (error: any) {
    console.error("Error deleting segment:", error)
    return {
      success: false,
      error: error.message || "An error occurred while deleting the segment"
    }
  }
}

/**
 * Supprimer plusieurs segments
 */
export async function deleteMultipleSegments(segmentIds: string[]) {
  try {
    const account = await getAccount()
    if (!account) {
      return {
        success: false,
        error: "User not authenticated, cannot delete segments"
      }
    }

    if (!segmentIds || segmentIds.length === 0) {
      return {
        success: false,
        error: "No segment IDs provided"
      }
    }

    const results = []
    let totalDeletedRelations = 0

    for (const segmentId of segmentIds) {
      const result = await deleteSegment(segmentId)
      results.push({
        segmentId,
        success: result.success,
        error: result.error,
        deleted_relations: result.deleted_relations || 0
      })
      
      if (result.success) {
        totalDeletedRelations += result.deleted_relations || 0
      }
    }

    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    return {
      success: successCount > 0,
      results,
      summary: {
        total_segments: segmentIds.length,
        successful_deletions: successCount,
        failed_deletions: failureCount,
        total_deleted_relations: totalDeletedRelations
      }
    }
  } catch (error: any) {
    console.error("Error deleting multiple segments:", error)
    return {
      success: false,
      error: error.message || "An error occurred while deleting segments"
    }
  }
}
