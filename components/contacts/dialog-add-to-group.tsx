"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, PlusCircle, Search, UsersRound, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"

interface Group {
  $id: string;
  name: string;
  description?: string;
}

interface DialogAddToGroupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedContactIds: string[];
  dictionary?: any;
  onSuccess?: () => void;
}

export function DialogAddToGroup({ 
  open, 
  onOpenChange, 
  selectedContactIds,
  dictionary,
  onSuccess
}: DialogAddToGroupProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  
  const t = dictionary?.groups || {};
  const filteredGroups = searchQuery 
    ? groups.filter(group => 
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (group.description && group.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : groups;

  useEffect(() => {
    if (open) {
      fetchGroups();
    }
  }, [open]);

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      // Import the function to get groups
      const { getGroups } = await import('@/app/actions/mail/groups/getGroups');
      const result = await getGroups();
      
      if (result.error) {
        toast.error(result.error);
        return;
      }
      
      setGroups(result.groups || []);
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error("Impossible de charger les groupes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      toast.error("Le nom du groupe est requis");
      return;
    }

    setIsAdding(true);
    try {
      // Import the function to add a group
      const { addGroup } = await import('@/app/actions/mail/groups/addGroup');
      
      const result = await addGroup({
        name: newGroupName.trim(),
        description: newGroupDescription.trim() || undefined
      });
      
      if (result.error) {
        toast.error(result.error);
        return;
      }
      
      toast.success("Groupe créé avec succès");
      setNewGroupName("");
      setNewGroupDescription("");
      setShowCreateGroup(false);
      
      // Refresh groups and select the newly created one
      await fetchGroups();
      
      // Use groupId instead of group.$id
      if (result.groupId) {
        setSelectedGroupId(result.groupId);
      }
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Impossible de créer le groupe");
    } finally {
      setIsAdding(false);
    }
  };

  // Fonction de nettoyage interne
  const cleanupState = () => {
    setIsAdding(false);
    setSelectedGroupId(null);
    setShowCreateGroup(false);
    setSearchQuery("");
    setNewGroupName("");
    setNewGroupDescription("");
  };
  
  const handleAddContactsToGroup = async () => {
    if (!selectedGroupId) {
      toast.error("Veuillez sélectionner un groupe");
      return;
    }

    setIsAdding(true);
    try {
      // Use the bulk add function
      const { addContactsToGroup } = await import('@/app/actions/mail/group-contacts/addContactsToGroup');
      
      const result = await addContactsToGroup({
        groupId: selectedGroupId,
        contactIds: selectedContactIds
      });
      
      if (result.error) {
        toast.error(result.error);
        setIsAdding(false);
        return;
      }
      
      if (result.success) {
        // Nettoyer l'état d'abord
        cleanupState();
        
        // Fermer le dialog immédiatement pour éviter les problèmes d'interaction
        onOpenChange(false);
        
        // Notifier le composant parent du succès après la fermeture
        // pour éviter des mises à jour d'état pendant que le modal est toujours attaché
        if (onSuccess) {
          // Utiliser requestAnimationFrame pour différer l'exécution 
          // au prochain cycle de rendu après la fermeture
          requestAnimationFrame(() => {
            onSuccess();
          });
        }
        
        // Afficher le toast après un délai pour éviter de bloquer l'UI
        setTimeout(() => {
          toast.success(result.message || "Contacts ajoutés au groupe avec succès");
        }, 100);
      }
    } catch (error) {
      console.error("Error adding contacts to group:", error);
      toast.error("Impossible d'ajouter les contacts au groupe");
      setIsAdding(false);
    }
  };

  // Gestionnaire de fermeture explicite - utilise requestAnimationFrame pour synchroniser avec le cycle de rendu
  const handleCloseDialog = () => {
    // Nettoyer l'état d'abord
    cleanupState();
    
    // Utiliser requestAnimationFrame pour s'assurer que la fermeture se fait après le nettoyage
    requestAnimationFrame(() => {
      // Informer le parent de la fermeture
      onOpenChange(false);
    });
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          // Fermer proprement et en une seule fois
          cleanupState();
          onOpenChange(false);
        } else {
          onOpenChange(true);
        }
      }}
    >
      <DialogContent 
        className="sm:max-w-md"
        onPointerDownOutside={(e) => {
          // Empêcher les événements de pointer sur l'overlay de créer des problèmes
          e.preventDefault();
        }}
        onInteractOutside={(e) => {
          // Empêcher les événements d'interaction externes de créer des problèmes
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UsersRound className="h-5 w-5" />
            {t.addContactsToGroup || "Ajouter des contacts à un groupe"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.searchGroups || "Rechercher des groupes..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
                disabled={isLoading}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowCreateGroup(!showCreateGroup)}
              title={t.createNewGroup || "Créer un nouveau groupe"}
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
          
          {showCreateGroup && (
            <div className="space-y-3 border p-3 rounded-md">
              <h3 className="font-medium text-sm">
                {t.createNewGroup || "Créer un nouveau groupe"}
              </h3>
              
              <div className="space-y-2">
                <Input
                  placeholder={t.groupName || "Nom du groupe"}
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  disabled={isAdding}
                />
                <Input
                  placeholder={t.groupDescription || "Description (optionnelle)"}
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  disabled={isAdding}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateGroup(false)}
                  disabled={isAdding}
                >
                  {t.cancel || "Annuler"}
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreateGroup}
                  disabled={isAdding || !newGroupName.trim()}
                >
                  {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t.create || "Créer"}
                </Button>
              </div>
            </div>
          )}
          
          <div className="max-h-[300px] overflow-y-auto pr-1">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : groups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t.noGroups || "Aucun groupe disponible. Créez-en un pour continuer."}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredGroups.map((group) => (
                  <Card
                    key={group.$id}
                    className={`p-3 hover:bg-muted/50 cursor-pointer ${
                      selectedGroupId === group.$id ? "border-primary bg-muted/30" : ""
                    }`}
                    onClick={() => setSelectedGroupId(group.$id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full border">
                        {selectedGroupId === group.$id && <Check className="h-3 w-3" />}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="font-medium">
                          {group.name}
                        </p>
                        {group.description && (
                          <p className="text-muted-foreground text-sm">
                            {group.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
                
                {searchQuery && filteredGroups.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    {t.noMatchingGroups || "Aucun groupe ne correspond à votre recherche."}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              // S'assurer que les événements de clic sont traités en une seule fois
              if (!isAdding) {
                handleCloseDialog();
              }
            }}
            disabled={isAdding}
          >
            {t.cancel || "Annuler"}
          </Button>
          <Button
            onClick={() => {
              // S'assurer que les événements de clic sont traités en une seule fois
              if (!isAdding && selectedGroupId) {
                handleAddContactsToGroup();
              }
            }}
            disabled={isAdding || !selectedGroupId}
          >
            {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t.addToGroup || "Ajouter au groupe"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
