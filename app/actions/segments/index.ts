// Export all segment actions from a central location
export { createSegment } from './createSegment'
export { 
  getSegments, 
  getSegmentById, 
  getSegmentWithContacts, 
  searchSegments 
} from './getSegments'

export { updateSegment } from './updateSegment'
export { deleteSegment, deleteMultipleSegments } from './deleteSegment'
export {
  addContactToSegment,
  removeContactFromSegment,
  addMultipleContactsToSegment,
  removeMultipleContactsFromSegment,
  moveContactsBetweenSegments
} from './segmentRelations'

export {
  analyzeSegmentUsage,
  getSegmentStats,
  getColorDistributionReport
} from './segmentAnalytics'

export {
  duplicateSegment,
  mergeSegments,
  cleanupEmptySegments,
  cleanupOrphanedRelations,
  removeDuplicateRelations
} from './segmentBulkOperations'

export {
  validateSegmentIntegrity,
  checkSegmentConsistency,
  autoRepairSegmentIssues
} from './segmentValidation'

// Re-export utilities that are still relevant
export { 
  getSegmentsCached, 
  invalidateSegmentCache,
  optimizeSegmentPerformance
} from '../segmentUtils'
