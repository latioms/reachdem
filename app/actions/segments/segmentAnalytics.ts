'use server'

import { databases } from '@/lib/appwrite'
import { Query } from 'appwrite'
import { getAccount } from '../getAccount'
import type { Segment } from '@/types/schema'

const MAILING_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_MAILING_DATABASE_ID as string
const SEGMENTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_SEGMENTS_COLLECTION_ID as string
const CONTACT_SEGMENTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_CONTACT_SEGMENTS_COLLECTION_ID as string
const CONTACTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_CONTACTS_COLLECTION_ID as string

/**
 * Analyser l'utilisation des segments
 */
export async function analyzeSegmentUsage() {
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

    // Récupérer toutes les relations
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

    // Analyser l'utilisation par segment
    const segmentUsage = segments.documents.map(segment => {
      const segmentRelations = userRelations.filter(rel => rel.segment_id === segment.$id)
      
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
    const totalContacts = new Set(userRelations.map(rel => rel.contact_id)).size
    const totalSegments = segments.documents.length
    const totalRelations = userRelations.length
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

    // Analyser les tendances temporelles
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const thisMonthSegments = segmentUsage.filter(s => {
      if (!s.created_at) return false
      const createdDate = new Date(s.created_at)
      return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear
    })

    return {
      success: true,
      data: {
        overview: {
          total_segments: totalSegments,
          total_unique_contacts: totalContacts,
          total_relations: totalRelations,
          average_contacts_per_segment: Math.round(averageContactsPerSegment * 100) / 100,
          segments_created_this_month: thisMonthSegments.length
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
            type: 'cleanup' as const,
            priority: 'low' as const,
            message: `You have ${emptySegments.length} empty segment(s) that could be deleted`,
            action: 'delete_empty_segments'
          }] : []),
          ...(staleSegments.length > 0 ? [{
            type: 'update' as const,
            priority: 'medium' as const,
            message: `${staleSegments.length} segment(s) haven't been updated in over 30 days`,
            action: 'review_stale_segments'
          }] : []),
          ...(totalSegments > 20 ? [{
            type: 'organization' as const,
            priority: 'medium' as const,
            message: `You have ${totalSegments} segments. Consider merging or reorganizing for better efficiency`,
            action: 'optimize_segments'
          }] : []),
          ...(totalSegments > 0 && totalContacts === 0 ? [{
            type: 'data' as const,
            priority: 'high' as const,
            message: 'You have segments but no contacts. Start adding contacts to make use of your segments',
            action: 'add_contacts'
          }] : [])
        ]
      }
    }
  } catch (error: any) {
    console.error("Error analyzing segment usage:", error)
    return {
      success: false,
      error: error.message || "An error occurred while analyzing segment usage"
    }
  }
}

/**
 * Obtenir les statistiques de base des segments
 */
export async function getSegmentStats() {
  try {
    const account = await getAccount()
    if (!account) {
      return {
        success: false,
        error: "User not authenticated"
      }
    }

    // Compter les segments
    const segments = await databases.listDocuments(
      MAILING_DATABASE_ID,
      SEGMENTS_COLLECTION_ID,
      [
        Query.equal("user_id", account.$id),
        Query.limit(1000)
      ]
    )

    // Compter les relations pour les segments de l'utilisateur
    const userSegmentIds = segments.documents.map(s => s.$id)
    const allRelations = await databases.listDocuments(
      MAILING_DATABASE_ID,
      CONTACT_SEGMENTS_COLLECTION_ID,
      [Query.limit(5000)]
    )

    const userRelations = allRelations.documents.filter(rel => 
      userSegmentIds.includes(rel.segment_id)
    )

    // Calculer les statistiques par segment
    const segmentStats = segments.documents.map(segment => {
      const segmentRelations = userRelations.filter(rel => rel.segment_id === segment.$id)
      return {
        segment_id: segment.$id,
        segment_name: segment.name,
        segment_color: segment.color,
        contact_count: segmentRelations.length,
        last_updated: segment.updated_at || segment.created_at
      }
    })

    // Statistiques globales
    const totalContacts = new Set(userRelations.map(rel => rel.contact_id)).size
    const totalSegments = segments.documents.length
    const segmentsWithContacts = segmentStats.filter(s => s.contact_count > 0).length
    const emptySegments = totalSegments - segmentsWithContacts

    return {
      success: true,
      data: {
        total_segments: totalSegments,
        segments_with_contacts: segmentsWithContacts,
        empty_segments: emptySegments,
        total_unique_contacts: totalContacts,
        total_segment_relations: userRelations.length,
        segment_stats: segmentStats,
        most_popular_segment: segmentStats.reduce((max, current) => 
          current.contact_count > max.contact_count ? current : max,
          segmentStats[0] || null
        )
      }
    }
  } catch (error: any) {
    console.error("Error getting segment stats:", error)
    return {
      success: false,
      error: error.message || "An error occurred while getting segment statistics"
    }
  }
}

/**
 * Obtenir le rapport de distribution des couleurs
 */
export async function getColorDistributionReport() {
  try {
    const account = await getAccount()
    if (!account) {
      return {
        success: false,
        error: "User not authenticated"
      }
    }

    const segments = await databases.listDocuments(
      MAILING_DATABASE_ID,
      SEGMENTS_COLLECTION_ID,
      [
        Query.equal("user_id", account.$id),
        Query.limit(1000)
      ]
    )

    const colorDistribution = segments.documents.reduce((acc, segment) => {
      const color = segment.color
      if (!acc[color]) {
        acc[color] = {
          count: 0,
          segments: []
        }
      }
      acc[color].count++
      acc[color].segments.push({
        id: segment.$id,
        name: segment.name
      })
      return acc
    }, {} as Record<string, { count: number, segments: Array<{ id: string, name: string }> }>)

    const totalSegments = segments.documents.length
    const colorStats = Object.entries(colorDistribution).map(([color, data]) => ({
      color,
      count: data.count,
      percentage: totalSegments > 0 ? Math.round((data.count / totalSegments) * 100) : 0,
      segments: data.segments
    })).sort((a, b) => b.count - a.count)

    return {
      success: true,
      data: {
        total_segments: totalSegments,
        color_distribution: colorStats,
        most_used_color: colorStats[0]?.color || null,
        least_used_colors: colorStats.filter(c => c.count === 1).map(c => c.color)
      }
    }
  } catch (error: any) {
    console.error("Error getting color distribution report:", error)
    return {
      success: false,
      error: error.message || "An error occurred while getting color distribution report"
    }
  }
}
