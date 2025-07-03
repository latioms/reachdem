'use server'

import { databases } from '@/lib/appwrite'
import { Query } from 'appwrite'
import { getAccount } from '../getAccount'
import { revalidatePath } from 'next/cache'
import { getSegmentById } from './getSegments'
import type { Segment } from '@/types/schema'
import { MAILING_DATABASE_ID, SEGMENTS_COLLECTION_ID } from './constants'

interface UpdateSegmentParams {
  segmentId: string
  name?: string
  color?: "red" | "blue" | "green" | "yellow" | "purple" | "orange" | "pink" | "gray"
  description?: string
}

/**
 * Mettre à jour un segment
 */
export async function updateSegment({
  segmentId,
  name,
  color,
  description
}: UpdateSegmentParams) {
  try {
    const account = await getAccount()
    if (!account) {
      return {
        success: false,
        error: "User not authenticated, cannot update segment"
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

    // Préparer les données de mise à jour
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    // Validation et mise à jour du nom
    if (name !== undefined) {
      if (!name.trim()) {
        return {
          success: false,
          error: "Segment name cannot be empty"
        }
      }

      // Vérifier l'unicité du nom (seulement si le nom change)
      if (name.trim() !== segmentResult.data.name) {
        const existingSegments = await databases.listDocuments(
          MAILING_DATABASE_ID,
          SEGMENTS_COLLECTION_ID,
          [
            Query.equal("user_id", account.$id),
            Query.equal("name", name.trim()),
            Query.notEqual("$id", segmentId)
          ]
        )

        if (existingSegments.documents.length > 0) {
          return {
            success: false,
            error: "A segment with this name already exists"
          }
        }
      }

      updateData.name = name.trim()
    }

    // Mise à jour de la couleur
    if (color !== undefined) {
      updateData.color = color
    }

    // Mise à jour de la description
    if (description !== undefined) {
      updateData.description = description.trim()
    }

    // Effectuer la mise à jour
    const updatedSegment = await databases.updateDocument(
      MAILING_DATABASE_ID,
      SEGMENTS_COLLECTION_ID,
      segmentId,
      updateData
    )

    // Revalider les chemins pour mettre à jour l'interface
    revalidatePath("/dashboard/segments")
    revalidatePath("/dashboard/contacts")

    return {
      success: true,
      data: updatedSegment as unknown as Segment
    }
  } catch (error: any) {
    console.error("Error updating segment:", error)
    return {
      success: false,
      error: error.message || "An error occurred while updating the segment"
    }
  }
}
