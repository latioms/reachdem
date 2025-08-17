"use client"

import { useEffect, useState } from "react"
import { ContactList, ContactSearch, DialogAddContact } from "@/components/contacts"
import { Button } from "@/components/ui/button"
import { Plus, Users, RefreshCw } from "lucide-react"
import { getContacts } from "@/app/actions/mail/contacts/getContacts"
import checkAuth from "@/app/actions/chechAuth"
import type { Contact } from "@/types/schema"
import { Skeleton } from "@/components/ui/skeleton"
import { useSearchDebounce } from "@/hooks/use-search-debounce"
import { useContactFilter } from "@/hooks/use-contact-filter"

interface ContactsClientPageProps {
  dictionary?: any;
}

export function ContactsClientPage({ dictionary }: ContactsClientPageProps) {  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [contactsPerPage] = useState(10)
  const [userId, setUserId] = useState<string | null>(null)
  
  // Utilisation des hooks personnalisés pour la recherche
  const { searchTerm, debouncedSearchTerm, setSearchTerm } = useSearchDebounce()
  const filteredContacts = useContactFilter(contacts, debouncedSearchTerm)

  // Réinitialiser la page courante quand on effectue une recherche
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchTerm])

  const fetchContacts = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await getContacts()
      
      if (result.error) {
        setError(result.error)
        setContacts([])
      } else {
        setContacts(result.contacts || [])
      }
    } catch (err) {
      setError("Une erreur inattendue s'est produite" + err)
      setContacts([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserInfo = async () => {
    try {
      const result = await checkAuth()
      if (result.isAuthenticated && result.user?.id) {
        setUserId(result.user.id)
        console.log('User ID fetched:', result.user.id) // Debug log
      } else {
        console.error('User not authenticated or missing ID')
      }
    } catch (error) {
      console.error('Error fetching user info:', error)
    }
  }

  useEffect(() => {
    fetchContacts()
    fetchUserInfo()
  }, [])
  const handleContactAdded = () => {
    // Rafraîchir la liste après ajout d'un contact
    fetchContacts()
    // Réinitialiser à la première page
    setCurrentPage(1)
  }

  const handleDeleteContact = async (contactId: string) => {
    // TODO: Implémenter la suppression
    console.log("Delete contact:", contactId)
  }

  const handleEditContact = (contact: Contact) => {
    // TODO: Implémenter l'édition
    console.log("Edit contact:", contact)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-6 p-6">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-4 w-80 mt-2" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-4 border rounded-lg space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8" />
            {dictionary?.contacts?.title || "Contacts"}
          </h1>
          <p className="text-muted-foreground">
            {dictionary?.contacts?.description || "Gérez vos contacts pour vos campagnes de mailing"}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchContacts}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {dictionary?.common?.refresh || "Actualiser"}
          </Button>
            <DialogAddContact dictionary={dictionary} onSuccess={handleContactAdded}>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {dictionary?.contacts?.addButton || "Ajouter un contact"}
            </Button>
          </DialogAddContact>
        </div>
      </div>    
      {/* Error State */}
      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-100 border border-red-200 rounded-md">
          {error}
        </div>
      )}    
      <ContactSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        resultsCount={filteredContacts.length}
        totalCount={contacts.length}
        dictionary={dictionary}
      />
      {/* Contact List */}
      <ContactList 
        contacts={filteredContacts}
        dictionary={dictionary}
        onEdit={handleEditContact}
        onDelete={handleDeleteContact}
        currentPage={currentPage}
        contactsPerPage={contactsPerPage}
        onPageChange={setCurrentPage}
        totalContacts={contacts.length}
        userId={userId || undefined}
      />
    </div>
  )
}
