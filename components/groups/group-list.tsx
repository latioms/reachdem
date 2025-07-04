"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Info, Trash2, Edit, MoreHorizontal, UsersRound } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"

// Type for Group
export interface Group {
  id: string;
  name: string;
  description?: string;
  membersCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface GroupListProps {
  groups: Group[];
  dictionary?: any;
  onEdit?: (group: Group) => void;
  onDelete?: (groupId: string) => void;
  currentPage?: number;
  groupsPerPage?: number;
  onPageChange?: (page: number) => void;
  totalGroups?: number;
}

export function GroupList({ 
  groups, 
  dictionary, 
  onEdit, 
  onDelete, 
  currentPage = 1, 
  groupsPerPage = 10, 
  onPageChange,
  totalGroups
}: GroupListProps) {
  const t = dictionary?.groups || {}

  // Pagination logic
  const lastPage = Math.max(1, Math.ceil((totalGroups || groups.length) / groupsPerPage))
  const indexOfLastGroup = currentPage * groupsPerPage
  const indexOfFirstGroup = indexOfLastGroup - groupsPerPage
  const currentGroups = groups.slice(indexOfFirstGroup, indexOfLastGroup)

  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page)
    }
  }

  // Générer les liens de pagination
  const renderPaginationLinks = () => {
    const links = []
    const maxVisiblePages = 5 // Nombre max de pages visibles en plus des contrôles prev/next
    
    // Première page toujours affichée
    links.push(
      <PaginationItem key="first">
        <PaginationLink
          onClick={() => handlePageChange(1)}
          isActive={currentPage === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    )

    // Si on a beaucoup de pages, ajouter des ellipses et limiter les pages affichées
    if (lastPage > maxVisiblePages) {
      // Calculer la plage de pages à afficher
      let startPage = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2))
      let endPage = Math.min(lastPage - 1, startPage + maxVisiblePages - 3)
      
      if (endPage - startPage < maxVisiblePages - 3) {
        startPage = Math.max(2, endPage - (maxVisiblePages - 3))
      }
      
      // Ellipses au début si nécessaire
      if (startPage > 2) {
        links.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        )
      }
      
      // Pages du milieu
      for (let i = startPage; i <= endPage; i++) {
        links.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => handlePageChange(i)}
              isActive={currentPage === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        )
      }
      
      // Ellipses à la fin si nécessaire
      if (endPage < lastPage - 1) {
        links.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        )
      }
      
      // Dernière page si on a plus d'une page
      if (lastPage > 1) {
        links.push(
          <PaginationItem key="last">
            <PaginationLink
              onClick={() => handlePageChange(lastPage)}
              isActive={currentPage === lastPage}
            >
              {lastPage}
            </PaginationLink>
          </PaginationItem>
        )
      }
    } else {
      // Si on a peu de pages, toutes les afficher
      for (let i = 2; i <= lastPage; i++) {
        links.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => handlePageChange(i)}
              isActive={currentPage === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        )
      }
    }
    
    return links
  }

  if (groups.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/10">
        <UsersRound className="mx-auto h-12 w-12 text-muted-foreground/80" />
        <h3 className="mt-4 text-lg font-semibold">
          {t.noGroups || "Aucun groupe trouvé"}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {t.noGroupsDescription || "Créez un nouveau groupe pour organiser vos contacts."}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t.name || "Nom"}</TableHead>
            <TableHead className="hidden md:table-cell">{t.descriptionField || "Description"}</TableHead>
            <TableHead className="hidden md:table-cell">{t.members || "Membres"}</TableHead>
            <TableHead className="hidden md:table-cell">Date de création</TableHead>
            <TableHead className="text-right">{t.actions || "Actions"}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentGroups.map((group) => (
            <TableRow key={group.id}>
              <TableCell className="font-medium">
                <Link href={`/groups/${group.id}`} className="flex items-center gap-2 hover:text-blue-600 hover:underline">
                  <UsersRound className="h-4 w-4 text-muted-foreground" />
                  {group.name}
                </Link>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {group.description ? (
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                    <span className="line-clamp-2">{group.description}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Badge variant="outline" className="flex items-center gap-1 w-fit">
                  <UsersRound className="h-3 w-3" />
                  {group.membersCount || 0}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">
                {group.createdAt ? formatDistanceToNow(group.createdAt, { addSuffix: true, locale: fr }) : "-"}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/groups/${group.id}`}>
                        <UsersRound className="mr-2 h-4 w-4" />
                        {t.viewDetails || "Voir les détails"}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit && onEdit(group)}>
                      <Edit className="mr-2 h-4 w-4" />
                      {t.editGroup || "Modifier"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => onDelete && onDelete(group.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t.deleteGroup || "Supprimer"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {lastPage > 1 && (
        <div className="py-4 px-2">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                  className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {renderPaginationLinks()}
              
              <PaginationItem>
                <PaginationNext
                  onClick={() => currentPage < lastPage && handlePageChange(currentPage + 1)}
                  className={currentPage >= lastPage ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
