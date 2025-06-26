"use client"

import type { Contact } from "@/types/schema"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Mail, Phone, MapPin, User, Trash2, Edit, MoreHorizontal } from "lucide-react"
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

interface ContactListProps {
  contacts: Contact[];
  dictionary?: any;
  onEdit?: (contact: Contact) => void;
  onDelete?: (contactId: string) => void;
  currentPage?: number;
  contactsPerPage?: number;
  onPageChange?: (page: number) => void;
  totalContacts?: number;
}

export function ContactList({ 
  contacts, 
  dictionary, 
  onEdit, 
  onDelete, 
  currentPage = 1, 
  contactsPerPage = 10, 
  onPageChange,
  totalContacts
}: ContactListProps) {
  const t = dictionary?.contacts || {}

  // Pagination logic
  const indexOfLastContact = currentPage * contactsPerPage;
  const indexOfFirstContact = indexOfLastContact - contactsPerPage;
  const currentContacts = contacts.slice(indexOfFirstContact, indexOfLastContact);
  const totalPages = Math.ceil(contacts.length / contactsPerPage);  if (contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <User className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">
          {totalContacts && totalContacts > 0 
            ? (t.emptySearch?.title || "Aucun contact trouvé")
            : (t.emptyState?.title || "Aucun contact")
          }
        </h3>
        <p className="text-muted-foreground max-w-md">
          {totalContacts && totalContacts > 0 
            ? (t.emptySearch?.description || "Aucun contact ne correspond à votre recherche. Essayez de modifier les termes de recherche.")
            : (t.emptyState?.description || "Vous n'avez pas encore de contacts. Commencez par ajouter votre premier contact.")
          }
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">
          {t.list?.title || "Vos contacts"}
        </h2>        <Badge variant="secondary">
          {totalContacts !== undefined ? totalContacts : contacts.length} {(totalContacts !== undefined ? totalContacts : contacts.length) === 1 ? 'contact' : 'contacts'}
        </Badge>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Nom</TableHead>
              <TableHead className="w-[250px]">Email</TableHead>
              <TableHead className="w-[150px]">Téléphone</TableHead>
              <TableHead className="w-[200px]">Adresse</TableHead>
              <TableHead className="w-[120px]">Ajouté</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>          
          <TableBody>
            {currentContacts.map((contact) => (
              <TableRow key={contact.$id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {contact.first_name || contact.last_name ? (
                      `${contact.first_name || ''} ${contact.last_name || ''}`.trim()
                    ) : (
                      <span className="text-muted-foreground italic">
                        {contact.email.split('@')[0]}
                      </span>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate max-w-[200px]">{contact.email}</span>
                  </div>
                </TableCell>
                
                <TableCell>
                  {contact.phone ? (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {contact.phone}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                
                <TableCell>
                  {contact.address ? (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate max-w-[150px]" title={contact.address}>
                        {contact.address}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                
                <TableCell className="text-sm text-muted-foreground">
                  {contact.created_at ? (
                    formatDistanceToNow(new Date(contact.created_at), { 
                      addSuffix: true, 
                      locale: fr 
                    })
                  ) : (
                    "-"
                  )}
                </TableCell>
                
                <TableCell className="text-right">
                  {(onEdit || onDelete) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Ouvrir le menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(contact)}>
                            <Edit className="h-4 w-4 mr-2" />
                            {t.actions?.edit || "Modifier"}
                          </DropdownMenuItem>
                        )}
                        {onEdit && onDelete && <DropdownMenuSeparator />}
                        {onDelete && (
                          <DropdownMenuItem 
                            onClick={() => onDelete(contact.$id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t.actions?.delete || "Supprimer"}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}          
            </TableBody>
        </Table>
      </div>      {/* Pagination */}
      {contacts.length > contactsPerPage && onPageChange && (
        <div className="mt-8 space-y-4">
          <div className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              {dictionary?.table?.pagination?.showing
                ? dictionary.table.pagination.showing
                  .replace('{start}', String(indexOfFirstContact + 1))
                  .replace('{end}', String(Math.min(indexOfLastContact, contacts.length)))
                  .replace('{total}', String(contacts.length))
                : `Affichage de ${indexOfFirstContact + 1} à ${Math.min(indexOfLastContact, contacts.length)} sur ${contacts.length} contacts`
              }
            </p>
          </div>
            <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                >
                  {dictionary?.table?.pagination?.previous || "Précédent"}
                </PaginationPrevious>
              </PaginationItem>
              
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                
                // Show first page, last page, current page, and pages around current
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => onPageChange(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                
                // Show ellipsis
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                
                return null;
              })}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                >
                  {dictionary?.table?.pagination?.next || "Suivant"}
                </PaginationNext>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
