'use server'

import { databases } from '@/lib/appwrite'
import { ID, Query } from 'appwrite'
import { getAccount } from '../getAccount'
import { revalidatePath } from 'next/cache'
import { getSegmentById } from './getSegments'
import type { Contact, ContactSegment } from '@/types/schema'
import { 
  MAILING_DATABASE_ID, 
  SEGMENTS_COLLECTION_ID, 
  CONTACT_SEGMENTS_COLLECTION_ID, 
  CONTACTS_COLLECTION_ID 
} from './constants'

/**
 * Ajouter un contact à un segment
 */
export async function addContactToSegment(contactId: string, segmentId: string) {
  try {
    const account = await getAccount()
    if (!account) {
      return {
        success: false,
        error: "User not authenticated"
      }
    }

    // Validation des paramètres
    if (!contactId || !segmentId) {
      return {
        success: false,
        error: "Contact ID and Segment ID are required"
      }
    }

    // Vérifier que le segment existe et appartient à l'utilisateur
    const segmentResult = await getSegmentById(segmentId)
    if (!segmentResult.success || !segmentResult.data) {
      return {
        success: false,
        error: "Segment not found or access denied"
      }
    }

    // Vérifier que le contact existe et appartient à l'utilisateur
    try {
      const contact = await databases.getDocument(
        MAILING_DATABASE_ID,
        CONTACTS_COLLECTION_ID,
        contactId
      )

      if (contact.user_id !== account.$id) {
        return {
          success: false,
          error: "Contact not found or access denied"
        }
      }
    } catch (error) {
      return {
        success: false,
        error: "Contact not found"
      }
    }

    // Vérifier si la relation existe déjà
    const existingRelation = await databases.listDocuments(
      MAILING_DATABASE_ID,
      CONTACT_SEGMENTS_COLLECTION_ID,
      [
        Query.equal("contact_id", contactId),
        Query.equal("segment_id", segmentId)
      ]
    )

    if (existingRelation.documents.length > 0) {
      return {
        success: false,
        error: "Contact is already in this segment"
      }
    }

    // Créer la relation
    const relation = await databases.createDocument(
      MAILING_DATABASE_ID,
      CONTACT_SEGMENTS_COLLECTION_ID,
      ID.unique(),
      {
        contact_id: contactId,
        segment_id: segmentId,
        created_at: new Date().toISOString()
      }
    )

    // Mettre à jour le timestamp du segment
    await databases.updateDocument(
      MAILING_DATABASE_ID,
      SEGMENTS_COLLECTION_ID,
      segmentId,
      { updated_at: new Date().toISOString() }
    )

    revalidatePath("/dashboard/segments")
    revalidatePath("/dashboard/contacts")

    return {
      success: true,
      data: relation as unknown as ContactSegment
    }
  } catch (error: any) {
    console.error("Error adding contact to segment:", error)
    return {
      success: false,
      error: error.message || "An error occurred while adding contact to segment"
    }
  }
}

/**
 * Retirer un contact d'un segment
 */
export async function removeContactFromSegment(contactId: string, segmentId: string) {
  try {
    const account = await getAccount()
    if (!account) {
      return {
        success: false,
        error: "User not authenticated"
      }
    }

    // Validation des paramètres
    if (!contactId || !segmentId) {
      return {
        success: false,
        error: "Contact ID and Segment ID are required"
      }
    }

    // Vérifier que le segment appartient à l'utilisateur
    const segmentResult = await getSegmentById(segmentId)
    if (!segmentResult.success || !segmentResult.data) {
      return {
        success: false,
        error: "Segment not found or access denied"
      }
    }

    // Trouver la relation
    const relations = await databases.listDocuments(
      MAILING_DATABASE_ID,
      CONTACT_SEGMENTS_COLLECTION_ID,
      [
        Query.equal("contact_id", contactId),
        Query.equal("segment_id", segmentId)
      ]
    )

    if (relations.documents.length === 0) {
      return {
        success: false,
        error: "Contact is not in this segment"
      }
    }

    // Supprimer la relation
    await databases.deleteDocument(
      MAILING_DATABASE_ID,
      CONTACT_SEGMENTS_COLLECTION_ID,
      relations.documents[0].$id
    )

    // Mettre à jour le timestamp du segment
    await databases.updateDocument(
      MAILING_DATABASE_ID,
      SEGMENTS_COLLECTION_ID,
      segmentId,
      { updated_at: new Date().toISOString() }
    )

    revalidatePath("/dashboard/segments")
    revalidatePath("/dashboard/contacts")

    return {
      success: true,
      message: "Contact removed from segment successfully"
    }
  } catch (error: any) {
    console.error("Error removing contact from segment:", error)
    return {
      success: false,
      error: error.message || "An error occurred while removing contact from segment"
    }
  }
}

/**
 * Ajouter plusieurs contacts à un segment
 */
export async function addMultipleContactsToSegment(contactIds: string[], segmentId: string) {
  try {
    const account = await getAccount()
    if (!account) {
      return {
        success: false,
        error: "User not authenticated"
      }
    }

    if (!contactIds || contactIds.length === 0) {
      return {
        success: false,
        error: "No contact IDs provided"
      }
    }

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
        error: "Segment not found or access denied"
      }
    }

    const results = []
    let successCount = 0

    for (const contactId of contactIds) {
      const result = await addContactToSegment(contactId, segmentId)
      results.push({
        contactId,
        success: result.success,
        error: result.error
      })
      
      if (result.success) {
        successCount++
      }
    }

    // Mettre à jour le timestamp du segment
    if (successCount > 0) {
      await databases.updateDocument(
        MAILING_DATABASE_ID,
        SEGMENTS_COLLECTION_ID,
        segmentId,
        { updated_at: new Date().toISOString() }
      )
    }

    return {
      success: successCount > 0,
      results,
      summary: {
        total_contacts: contactIds.length,
        successful_additions: successCount,
        failed_additions: contactIds.length - successCount
      }
    }
  } catch (error: any) {
    console.error("Error adding multiple contacts to segment:", error)
    return {
      success: false,
      error: error.message || "An error occurred while adding contacts to segment"
    }
  }
}

/**
 * Retirer plusieurs contacts d'un segment
 */
export async function removeMultipleContactsFromSegment(contactIds: string[], segmentId: string) {
  try {
    const account = await getAccount()
    if (!account) {
      return {
        success: false,
        error: "User not authenticated"
      }
    }

    if (!contactIds || contactIds.length === 0) {
      return {
        success: false,
        error: "No contact IDs provided"
      }
    }

    if (!segmentId) {
      return {
        success: false,
        error: "Segment ID is required"
      }
    }

    const results = []
    let successCount = 0

    for (const contactId of contactIds) {
      const result = await removeContactFromSegment(contactId, segmentId)
      results.push({
        contactId,
        success: result.success,
        error: result.error
      })
      
      if (result.success) {
        successCount++
      }
    }

    return {
      success: successCount > 0,
      results,
      summary: {
        total_contacts: contactIds.length,
        successful_removals: successCount,
        failed_removals: contactIds.length - successCount
      }
    }
  } catch (error: any) {
    console.error("Error removing multiple contacts from segment:", error)
    return {
      success: false,
      error: error.message || "An error occurred while removing contacts from segment"
    }
  }
}

/**
 * Déplacer des contacts d'un segment à un autre
 */
export async function moveContactsBetweenSegments(
  contactIds: string[],
  fromSegmentId: string,
  toSegmentId: string
) {
  try {
    const account = await getAccount()
    if (!account) {
      return {
        success: false,
        error: "User not authenticated"
      }
    }

    // Validation des paramètres
    if (!contactIds || contactIds.length === 0) {
      return {
        success: false,
        error: "No contact IDs provided"
      }
    }

    if (!fromSegmentId || !toSegmentId) {
      return {
        success: false,
        error: "Source and destination segment IDs are required"
      }
    }

    if (fromSegmentId === toSegmentId) {
      return {
        success: false,
        error: "Source and destination segments cannot be the same"
      }
    }

    // Vérifier que les deux segments existent et appartiennent à l'utilisateur
    const [fromSegmentResult, toSegmentResult] = await Promise.all([
      getSegmentById(fromSegmentId),
      getSegmentById(toSegmentId)
    ])

    if (!fromSegmentResult.success || !toSegmentResult.success) {
      return {
        success: false,
        error: "One or both segments not found or access denied"
      }
    }

    const results = []
    let successCount = 0

    for (const contactId of contactIds) {
      try {
        // Retirer du segment source
        const removeResult = await removeContactFromSegment(contactId, fromSegmentId)
        
        if (removeResult.success) {
          // Ajouter au segment de destination
          const addResult = await addContactToSegment(contactId, toSegmentId)
          
          results.push({
            contactId,
            success: addResult.success,
            error: addResult.error
          })
          
          if (addResult.success) {
            successCount++
          }
        } else {
          results.push({
            contactId,
            success: false,
            error: removeResult.error
          })
        }
      } catch (error: any) {
        results.push({
          contactId,
          success: false,
          error: error.message
        })
      }
    }

    return {
      success: successCount > 0,
      results,
      summary: {
        total_contacts: contactIds.length,
        successful_moves: successCount,
        failed_moves: contactIds.length - successCount
      }
    }
  } catch (error: any) {
    console.error("Error moving contacts between segments:", error)
    return {
      success: false,
      error: error.message || "An error occurred while moving contacts between segments"
    }
  }
}
