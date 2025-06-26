import { useMemo } from 'react'
import type { Contact } from '@/types/schema'

/**
 * Hook personnalisé pour filtrer les contacts selon un terme de recherche
 * @param contacts - Liste des contacts à filtrer
 * @param searchTerm - Terme de recherche
 * @returns Contacts filtrés
 */
export function useContactFilter(contacts: Contact[], searchTerm: string) {
  return useMemo(() => {
    if (!searchTerm.trim()) return contacts
    
    const searchLower = searchTerm.toLowerCase()
    
    return contacts.filter(contact => {
      const fullName = `${contact.first_name || ''} ${contact.last_name || ''}`.trim().toLowerCase()
      const email = contact.email.toLowerCase()
      const phone = contact.phone?.toLowerCase() || ''
      const address = contact.address?.toLowerCase() || ''
      
      return fullName.includes(searchLower) ||
             email.includes(searchLower) ||
             phone.includes(searchLower) ||
             address.includes(searchLower)
    })
  }, [contacts, searchTerm])
}
