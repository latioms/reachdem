'use server'

import { databases } from "@/lib/appwrite"
import { ID, Query } from "appwrite"
import { getAccount } from "../getAccount"
import { getSegmentById } from "./getSegments"

// Database and collection IDs
const MAILING_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_MAILING_DATABASE_ID!
const SEGMENTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_SEGMENTS_COLLECTION_ID!
const CONTACT_SEGMENTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_CONTACT_SEGMENTS_COLLECTION_ID!
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

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
      redirect("/login")
    }

    // Vérifier que le segment cible existe et appartient à l'utilisateur
    const targetSegment = await getSegmentById(targetSegmentId)
    if (!targetSegment) {
      return { success: false, error: "Segment cible non trouvé" }
    }

    let totalContactsMerged = 0
    const mergeResults = []

    for (const sourceSegmentId of sourceSegmentIds) {
      try {
        // Vérifier que le segment source existe
        const sourceSegment = await getSegmentById(sourceSegmentId)
        if (!sourceSegment) {
          mergeResults.push({ segmentId: sourceSegmentId, success: false, error: "Segment non trouvé" })
          continue
        }

        // Récupérer tous les contacts du segment source
        const sourceContacts = await databases.listDocuments(
          MAILING_DATABASE_ID,
          CONTACT_SEGMENTS_COLLECTION_ID,
          [Query.equal("segment_id", sourceSegmentId)]
        )

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
              totalContactsMerged++
            }

            // Supprimer l'ancienne relation
            await databases.deleteDocument(
              MAILING_DATABASE_ID,
              CONTACT_SEGMENTS_COLLECTION_ID,
              relation.$id
            )
          } catch (relationError) {
            console.error(`Erreur lors du déplacement du contact ${relation.contact_id}:`, relationError)
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
          contactsMoved: sourceContacts.documents.length 
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
    console.error("Erreur lors de la fusion des segments:", error)
    return { success: false, error: error.message || "Erreur lors de la fusion" }
  }
}
