'use server'

import { databases } from '@/lib/appwrite'
import { ID, Query } from 'appwrite'
import { getAccount } from '../getAccount'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { Segment } from '@/types/schema'
import { MAILING_DATABASE_ID, SEGMENTS_COLLECTION_ID } from './constants'

interface CreateSegmentParams {
  name: string
  color: "red" | "blue" | "green" | "yellow" | "purple" | "orange" | "pink" | "gray"
  description?: string
}

/**
 * Créer un nouveau segment
 */
export async function createSegment({
  name,
  color,
  description
}: CreateSegmentParams) {
  try {
    const account = await getAccount()
    if (!account) {
      return {
        success: false,
        error: "User not authenticated, cannot create segment"
      }
    }

    // Validation des données
    if (!name?.trim()) {
      return {
        success: false,
        error: "Segment name is required"
      }
    }

    if (!color) {
      return {
        success: false,
        error: "Segment color is required"
      }
    }

    // Vérifier si un segment avec ce nom existe déjà pour cet utilisateur
    const existingSegments = await databases.listDocuments(
      MAILING_DATABASE_ID,
      SEGMENTS_COLLECTION_ID,
      [
        Query.equal("user_id", account.$id),
        Query.equal("name", name.trim())
      ]
    )

    if (existingSegments.documents.length > 0) {
      return {
        success: false,
        error: "A segment with this name already exists"
      }
    }

    // Créer le segment
    const segment = await databases.createDocument(
      MAILING_DATABASE_ID,
      SEGMENTS_COLLECTION_ID,
      ID.unique(),
      {
        name: name.trim(),
        color,
        description: description?.trim() || "",
        user_id: account.$id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    )

    // Revalider les chemins pour mettre à jour l'interface
    revalidatePath("/dashboard/segments")
    revalidatePath("/dashboard/contacts")

    return {
      success: true,
      data: segment as unknown as Segment
    }
  } catch (error: any) {
    console.error("Error creating segment:", error)
    return {
      success: false,
      error: error.message || "An error occurred while creating the segment"
    }
  }
}
