'use server'

import { databases } from '@/lib/appwrite'
import { Query } from 'appwrite'
import { getAccount } from '../getAccount'
import type { Segment, SegmentWithContacts, Contact } from '@/types/schema'
import { 
  MAILING_DATABASE_ID, 
  SEGMENTS_COLLECTION_ID, 
  CONTACT_SEGMENTS_COLLECTION_ID, 
  CONTACTS_COLLECTION_ID 
} from './constants'

/**
 * Récupérer tous les segments d'un utilisateur
 */
export async function getSegments(limit: number = 100): Promise<{
  success: boolean
  data?: Segment[]
  error?: string
}> {
  try {
    const account = await getAccount()
    if (!account) {
      return {
        success: false,
        error: "User not authenticated"
      }
    }

    const response = await databases.listDocuments(
      MAILING_DATABASE_ID,
      SEGMENTS_COLLECTION_ID,
      [
        Query.equal("user_id", account.$id),
        Query.orderDesc("created_at"),
        Query.limit(limit)
      ]
    )

    return {
      success: true,
      data: response.documents as unknown as Segment[]
    }
  } catch (error: any) {
    console.error("Error fetching segments:", error)
    return {
      success: false,
      error: error.message || "An error occurred while fetching segments"
    }
  }
}

/**
 * Récupérer un segment par son ID
 */
export async function getSegmentById(segmentId: string): Promise<{
  success: boolean
  data?: Segment
  error?: string
}> {
  try {
    const account = await getAccount()
    if (!account) {
      return {
        success: false,
        error: "User not authenticated"
      }
    }

    if (!segmentId) {
      return {
        success: false,
        error: "Segment ID is required"
      }
    }

    const segment = await databases.getDocument(
      MAILING_DATABASE_ID,
      SEGMENTS_COLLECTION_ID,
      segmentId
    )

    // Vérifier que le segment appartient à l'utilisateur
    if (segment.user_id !== account.$id) {
      return {
        success: false,
        error: "You don't have permission to access this segment"
      }
    }

    return {
      success: true,
      data: segment as unknown as Segment
    }
  } catch (error: any) {
    console.error("Error fetching segment:", error)
    return {
      success: false,
      error: error.message || "Segment not found"
    }
  }
}

/**
 * Récupérer un segment avec ses contacts
 */
export async function getSegmentWithContacts(segmentId: string): Promise<{
  success: boolean
  data?: SegmentWithContacts
  error?: string
}> {
  try {
    const account = await getAccount()
    if (!account) {
      return {
        success: false,
        error: "User not authenticated"
      }
    }

    // Récupérer le segment
    const segmentResult = await getSegmentById(segmentId)
    if (!segmentResult.success || !segmentResult.data) {
      return segmentResult as any
    }

    const segment = segmentResult.data

    // Récupérer les relations segment-contact
    const relations = await databases.listDocuments(
      MAILING_DATABASE_ID,
      CONTACT_SEGMENTS_COLLECTION_ID,
      [
        Query.equal("segment_id", segmentId),
        Query.limit(1000)
      ]
    )

    // Récupérer les contacts associés
    const contacts = []
    for (const relation of relations.documents) {
      try {
        const contact = await databases.getDocument(
          MAILING_DATABASE_ID,
          CONTACTS_COLLECTION_ID,
          relation.contact_id
        )
        contacts.push(contact)
      } catch (error) {
        // Contact supprimé, ignorer
        console.warn(`Contact ${relation.contact_id} not found`)
      }
    }

    return {
      success: true,
      data: {
        ...segment,
        contacts: contacts as unknown as Contact[],
        contact_count: contacts.length
      } as SegmentWithContacts
    }
  } catch (error: any) {
    console.error("Error fetching segment with contacts:", error)
    return {
      success: false,
      error: error.message || "An error occurred while fetching segment data"
    }
  }
}

/**
 * Rechercher des segments par nom
 */
export async function searchSegments(searchTerm: string): Promise<{
  success: boolean
  data?: Segment[]
  error?: string
}> {
  try {
    const account = await getAccount()
    if (!account) {
      return {
        success: false,
        error: "User not authenticated"
      }
    }

    if (!searchTerm?.trim()) {
      return await getSegments()
    }

    const response = await databases.listDocuments(
      MAILING_DATABASE_ID,
      SEGMENTS_COLLECTION_ID,
      [
        Query.equal("user_id", account.$id),
        Query.search("name", searchTerm.trim()),
        Query.orderDesc("created_at"),
        Query.limit(50)
      ]
    )

    return {
      success: true,
      data: response.documents as unknown as Segment[]
    }
  } catch (error: any) {
    console.error("Error searching segments:", error)
    return {
      success: false,
      error: error.message || "An error occurred while searching segments"
    }
  }
}
