"use client"

import { useState, useRef } from "react"
import type { Contact } from "@/types/schema"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DialogAddToGroup } from "@/components/contacts/dialog-add-to-group"
import { 
  Mail, 
  Phone, 
  MapPin, 
  User, 
  Trash2, 
  Edit, 
  MoreHorizontal, 
  Check, 
  UsersRound,
  UserPlus,
  Layers,
  FileDown,
  AlertCircle
} from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

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
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)
  // Référence pour suivre si une action de dialogue est en cours, pour éviter les actions multiples
  const dialogActionInProgress = useRef(false)

  // Pagination logic
  const indexOfLastContact = currentPage * contactsPerPage;
  const indexOfFirstContact = indexOfLastContact - contactsPerPage;
  const currentContacts = contacts.slice(indexOfFirstContact, indexOfLastContact);
  const totalPages = Math.ceil(contacts.length / contactsPerPage);  

  // Functions for selection - avec manipulation d'état plus robuste
  const toggleSelectContact = (contactId: string) => {
    // Utiliser une référence stable pour l'état actuel
    const currentSelection = [...selectedContacts];
    const isSelected = currentSelection.includes(contactId);
    
    // Calculer le nouvel état à l'avance
    const newSelection = isSelected 
      ? currentSelection.filter(id => id !== contactId)
      : [...currentSelection, contactId];
    
    // Appliquer le nouvel état d'une manière stable
    setSelectedContacts(newSelection);
  }

  const toggleSelectAll = () => {
    // Vérifier si tous les contacts actuels sont sélectionnés
    const allSelected = currentContacts.every(contact => 
      selectedContacts.includes(contact.$id)
    );
    
    // Appliquer l'état approprié
    if (allSelected) {
      setSelectedContacts([]);
    } else {
      const allContactIds = currentContacts.map(contact => contact.$id);
      setSelectedContacts(allContactIds);
    }
  }

  const handleBulkDelete = async () => {
    if (selectedContacts.length === 0) return;
    
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedContacts.length} contact(s) ?`)) {
      return;
    }

    setIsDeleteLoading(true);
    
    try {
      // Execute delete operation for each selected contact
      let successCount = 0;
      let failCount = 0;
      
      for (const contactId of selectedContacts) {
        if (onDelete) {
          try {
            await onDelete(contactId);
            successCount++;
          } catch (error) {
            console.error(`Error deleting contact ID ${contactId}:`, error);
            failCount++;
          }
        }
      }
      
      if (successCount > 0) {
        toast.success(`${successCount} contact(s) supprimé(s) avec succès`);
      }
      
      if (failCount > 0) {
        toast.error(`Échec de la suppression de ${failCount} contact(s)`);
      }
      
      setSelectedContacts([]);
    } catch (error) {
      console.error('Error in bulk delete operation:', error);
      toast.error("Une erreur s'est produite lors de la suppression des contacts");
    } finally {
      setIsDeleteLoading(false);
    }
  }

  const [showAddToGroupDialog, setShowAddToGroupDialog] = useState(false);
  
  const addToGroup = () => {
    if (selectedContacts.length === 0) {
      toast.error("Veuillez sélectionner au moins un contact");
      return;
    }
    
    // Vérifier qu'aucune action de dialogue n'est déjà en cours
    if (dialogActionInProgress.current) return;
    
    // Marquer qu'une action de dialogue est en cours
    dialogActionInProgress.current = true;
    
    // Différer l'ouverture du modal pour permettre au DOM de se stabiliser
    // après un cycle de rendu complet, surtout important pour le header dynamique
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setShowAddToGroupDialog(true);
        // Réinitialiser le statut de l'action après un court délai
        setTimeout(() => {
          dialogActionInProgress.current = false;
        }, 300);
      });
    });
  }

  // Placeholder for future implementation
  const addToSegment = () => {
    toast.info(`Cette fonctionnalité sera implémentée prochainement`);
    // Implementation will be done later
  }

  // Placeholder for future implementation
  const exportContacts = () => {
    toast.info(`Cette fonctionnalité sera implémentée prochainement`);
    // Implementation will be done later
  }

  if (contacts.length === 0) {
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
        {selectedContacts.length === 0 ? (
          <>
            <h2 className="text-2xl font-semibold">
              {t.list?.title || "Vos contacts"}
            </h2>
            <Badge variant="secondary">
              {totalContacts !== undefined ? totalContacts : contacts.length} {(totalContacts !== undefined ? totalContacts : contacts.length) === 1 ? 'contact' : 'contacts'}
            </Badge>
          </>
        ) : (
          <div className="flex items-center gap-4 w-full">
            <Badge variant="secondary" className="h-8 px-3 flex items-center">
              {selectedContacts.length} {selectedContacts.length === 1 ? 'contact sélectionné' : 'contacts sélectionnés'}
            </Badge>

            <div className="flex-1 flex gap-2">
              {/* Add to Group Action */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <UsersRound className="h-4 w-4" />
                    <span>Ajouter au groupe</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={addToGroup}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Sélectionner un groupe
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Add to Segment Action */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Layers className="h-4 w-4" />
                    <span>Ajouter au segment</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={addToSegment}>
                    <Layers className="h-4 w-4 mr-2" />
                    Sélectionner un segment
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* More Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4 mr-1" />
                    <span>Plus d'actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={exportContacts}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Exporter
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleBulkDelete}
                    disabled={isDeleteLoading}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                // Réinitialiser la sélection avec un délai minime
                // pour éviter les problèmes de synchronisation d'état
                setTimeout(() => {
                  setSelectedContacts([]);
                }, 10);
              }}
            >
              Annuler
            </Button>
          </div>
        )}
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox 
                  checked={selectedContacts.length > 0 && selectedContacts.length === currentContacts.length}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="w-[180px]">Nom</TableHead>
              <TableHead className="w-[250px]">Email</TableHead>
              <TableHead className="w-[150px]">Téléphone</TableHead>
              <TableHead className="w-[180px]">Adresse</TableHead>
              <TableHead className="w-[120px]">Ajouté</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>          
          <TableBody>
            {currentContacts.map((contact) => (
              <TableRow 
                key={contact.$id} 
                className={`hover:bg-muted/50 ${selectedContacts.includes(contact.$id) ? 'bg-muted/30' : ''}`}
              >
                <TableCell className="w-[40px]">
                  <Checkbox 
                    checked={selectedContacts.includes(contact.$id)}
                    onCheckedChange={() => toggleSelectContact(contact.$id)}
                    aria-label={`Select contact ${contact.email}`}
                  />
                </TableCell>
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
      </div>      {/* Bulk actions */}
      {selectedContacts.length > 0 && (
        <div className="flex justify-between items-center py-4 px-6 bg-muted rounded-lg border">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={addToGroup}
              className="flex items-center"
            >
              <UsersRound className="h-4 w-4 mr-2" />
              Ajouter au groupe
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={addToSegment}
              className="flex items-center"
            >
              <Layers className="h-4 w-4 mr-2" />
              Ajouter au segment
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={exportContacts}
              className="flex items-center"
            >
              <FileDown className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
          
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleBulkDelete}
            className="flex items-center"
            disabled={isDeleteLoading}
          >
            {isDeleteLoading && <div className="mr-2 h-4 w-4 animate-spin" />}
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer {selectedContacts.length} contact(s)
          </Button>
        </div>
      )}      {/* Pagination */}
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

      {/* Dialog for adding contacts to groups - With improved DOM handling */}
      {showAddToGroupDialog && (
        <DialogAddToGroup
          open={showAddToGroupDialog}
          onOpenChange={(isOpen) => {
            // Vérifier qu'aucune action de dialogue n'est déjà en cours
            if (dialogActionInProgress.current) return;
            
            if (!isOpen) {
              // Marquer qu'une action de dialogue est en cours
              dialogActionInProgress.current = true;
              
              // Utiliser requestAnimationFrame pour synchroniser avec le cycle de rendu
              requestAnimationFrame(() => {
                // D'abord fermer visuellement le modal
                setShowAddToGroupDialog(false);
                
                // Puis laisser un autre cycle de rendu pour stabiliser le DOM
                requestAnimationFrame(() => {
                  // Réinitialiser le statut de l'action
                  dialogActionInProgress.current = false;
                });
              });
            }
          }}
          selectedContactIds={selectedContacts}
          dictionary={dictionary}
          onSuccess={() => {
            // Vérifier qu'aucune action de dialogue n'est déjà en cours
            if (dialogActionInProgress.current) return;
            
            // Marquer qu'une action de dialogue est en cours
            dialogActionInProgress.current = true;
            
            // Fermer le modal d'abord
            setShowAddToGroupDialog(false);
            
            // Puis nettoyer l'état dans un cycle de rendu suivant
            requestAnimationFrame(() => {
              setSelectedContacts([]);
              toast.success("Contacts ajoutés au groupe avec succès");
              
              // Réinitialiser le statut de l'action
              dialogActionInProgress.current = false;
            });
          }}
        />
      )}
    </div>
  )
}
