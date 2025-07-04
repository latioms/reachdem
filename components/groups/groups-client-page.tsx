"use client"

import { useEffect, useState } from "react"
import { GroupList, GroupSearch, DialogAddGroup } from "@/components/groups"
import { Button } from "@/components/ui/button"
import { Plus, UsersRound, RefreshCw } from "lucide-react"
import { getGroups } from "@/app/actions/mail/groups/getGroups"
import { getContactsCountByGroup } from "@/app/actions/mail/group-contacts/getContactsCountByGroup"
import { Skeleton } from "@/components/ui/skeleton"
import { useSearchDebounce } from "@/hooks/use-search-debounce"
import type { Group } from "@/components/groups/group-list"

interface GroupsClientPageProps {
  dictionary?: any;
}

export function GroupsClientPage({ dictionary }: GroupsClientPageProps) {
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [groupsPerPage] = useState(10)
  
  // Utilisation des hooks personnalisés pour la recherche
  const { searchTerm, debouncedSearchTerm, setSearchTerm } = useSearchDebounce()
  
  // Filtrer les groupes selon le terme de recherche
  const filteredGroups = groups.filter(group => {
    if (!debouncedSearchTerm) return true
    
    const searchLower = debouncedSearchTerm.toLowerCase()
    return (
      group.name?.toLowerCase().includes(searchLower) ||
      group.description?.toLowerCase().includes(searchLower)
    )
  })

  // Réinitialiser la page courante quand on effectue une recherche
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchTerm])

  const fetchGroups = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await getGroups()
      
      if (result.error) {
        setError(result.error)
        setGroups([])
      } else {
        // Récupérer les groupes
        const groupsData = result.groups || []
        
        // Pour chaque groupe, récupérer le nombre de contacts
        const groupsWithMemberCount = await Promise.all(
          groupsData.map(async (group) => {
            const countResult = await getContactsCountByGroup(group.id)
            return {
              ...group,
              membersCount: countResult.success ? countResult.count : 0
            }
          })
        )
        
        setGroups(groupsWithMemberCount)
      }
    } catch (err) {
      setError("Une erreur inattendue s'est produite" + err)
      setGroups([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  const handleGroupAdded = () => {
    // Rafraîchir la liste après ajout d'un groupe
    fetchGroups()
    // Réinitialiser à la première page
    setCurrentPage(1)
  }

  const handleDeleteGroup = async (groupId: string) => {
    // TODO: Implémenter la suppression
    console.log("Delete group:", groupId)
  }

  const handleEditGroup = (group: Group) => {
    // TODO: Implémenter l'édition
    console.log("Edit group:", group)
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
            <UsersRound className="h-8 w-8" />
            {dictionary?.groups?.title || "Groupes"}
          </h1>
          <p className="text-muted-foreground">
            {dictionary?.groups?.pageDescription || "Gérez vos groupes de contacts"}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchGroups}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {dictionary?.common?.refresh || "Actualiser"}
          </Button>
          <DialogAddGroup dictionary={dictionary} onSuccess={handleGroupAdded}>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {dictionary?.groups?.newGroup || "Nouveau groupe"}
            </Button>
          </DialogAddGroup>
        </div>
      </div>    
      {/* Error State */}
      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-100 border border-red-200 rounded-md">
          {error}
        </div>
      )}    
      <GroupSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        resultsCount={filteredGroups.length}
        totalCount={groups.length}
        dictionary={dictionary}
      />
      {/* Group List */}
      <GroupList 
        groups={filteredGroups}
        dictionary={dictionary}
        onEdit={handleEditGroup}
        onDelete={handleDeleteGroup}
        currentPage={currentPage}
        groupsPerPage={groupsPerPage}
        onPageChange={setCurrentPage}
        totalGroups={filteredGroups.length}
      />
    </div>
  )
}
