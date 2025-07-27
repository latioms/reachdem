"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"

interface GroupSearchProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  resultsCount?: number
  totalCount?: number
  dictionary?: any
  placeholder?: string
}

export function GroupSearch({
  searchTerm,
  onSearchChange,
  resultsCount,
  totalCount,
  dictionary,
  placeholder
}: GroupSearchProps) {
  // Raccourci clavier pour la recherche (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        const searchInput = document.querySelector('input[data-search="groups"]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          data-search="groups"
          placeholder={placeholder || dictionary?.groups?.search || "Rechercher un groupe..."}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-20"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSearchChange("")}
              className="h-6 w-6 p-0"
              title="Effacer la recherche"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <kbd className="hidden sm:inline-block pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">{`⌘ + `} </span>K
          </kbd>
        </div>
      </div>
      
      {searchTerm && resultsCount !== undefined && (
        <div className="text-sm text-muted-foreground whitespace-nowrap">
          {resultsCount} groupe{resultsCount !== 1 ? 's' : ''} trouvé{resultsCount !== 1 ? 's' : ''}
          {totalCount && totalCount !== resultsCount && (
            <span className="text-xs ml-1">sur {totalCount}</span>
          )}
        </div>
      )}
    </div>
  )
}
