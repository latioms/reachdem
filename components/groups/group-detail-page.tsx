"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ContactList } from "@/components/contacts"
import { 
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { Trash2, Check, UsersRound, Edit, Loader2, ArrowLeft } from "lucide-react"
import { updateGroup, deleteGroup } from "@/app/actions/mail/groups"
import { removeContactFromGroup } from "@/app/actions/mail/group-contacts"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import type { Contact, Group } from "@/types/schema"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface GroupDetailPageProps {
  group: Group & { 
    id: string;
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
  };
  contacts: Contact[];
  dictionary?: any;
}

export function GroupDetailPage({ group, contacts, dictionary }: GroupDetailPageProps) {
  const router = useRouter()
  const t = dictionary?.groups || {}
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [groupName, setGroupName] = useState(group.name || group.group_name)
  const [groupDescription, setGroupDescription] = useState(group.description || '')
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [contactsPerPage] = useState(10)
  
  // Handle editing the group
  const handleSaveChanges = async () => {
    if (!groupName.trim()) {
      toast.error("Le nom du groupe ne peut pas être vide")
      return
    }
    
    setIsUpdating(true)
    
    try {
      const result = await updateGroup({
        groupId: group.id,
        group_name: groupName,
        description: groupDescription
      })
      
      if (result.error) {
        toast.error(result.error)
        return
      }
      
      toast.success("Groupe mis à jour avec succès")
      setIsEditing(false)
      // Refresh the page to get updated data
      router.refresh()
    } catch (error) {
      console.error("Error updating group:", error)
      toast.error("Une erreur s'est produite lors de la mise à jour du groupe")
    } finally {
      setIsUpdating(false)
    }
  }
  
  // Handle deleting the group
  const handleDeleteGroup = async () => {
    if (deleteConfirmInput !== group.name && deleteConfirmInput !== group.group_name) {
      toast.error("Le nom du groupe ne correspond pas")
      return
    }
    
    setIsDeleting(true)
    
    try {
      const result = await deleteGroup(group.id)
      
      if (result.error) {
        toast.error(result.error)
        return
      }
      
      toast.success("Groupe supprimé avec succès")
      // Navigate back to groups list
      router.push(`/groups`)
    } catch (error) {
      console.error("Error deleting group:", error)
      toast.error("Une erreur s'est produite lors de la suppression du groupe")
    } finally {
      setIsDeleting(false)
    }
  }
  
  // Handle removing a contact from the group
  const handleRemoveContact = async (contactId: string) => {
    try {
      const result = await removeContactFromGroup(group.id, contactId)
      
      if (result.error) {
        toast.error(result.error)
        return
      }
      
      toast.success("Contact retiré du groupe avec succès")
      // Refresh the page
      router.refresh()
    } catch (error) {
      console.error("Error removing contact:", error)
      toast.error("Une erreur s'est produite lors du retrait du contact")
    }
  }

  return (
    <div className="flex flex-col space-y-6 p-6">
      {/* Back to groups link */}
      <div>
        <Link href="/groups" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" />
          {t.backToGroups || "Retour à la liste des groupes"}
        </Link>
      </div>
      
      {/* Group Details Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <UsersRound className="h-5 w-5" />
              <CardTitle className="text-xl">
                {isEditing ? (
                  <Input 
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Nom du groupe"
                    className="mt-0"
                  />
                ) : (
                  <span>{group.name || group.group_name}</span>
                )}
              </CardTitle>
            </div>
            {!isEditing && (
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4" />
                {t.editGroup || "Modifier"}
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Description */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                {t.descriptionField || "Description"}
              </h3>
              {isEditing ? (
                <Textarea 
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  placeholder="Description du groupe (optionnel)"
                  className="resize-none"
                  rows={3}
                />
              ) : (
                <p className="text-sm whitespace-pre-line">
                  {group.description || <span className="text-muted-foreground italic">Aucune description</span>}
                </p>
              )}
            </div>
            
            {/* Created & Updated dates */}
            {!isEditing && (
              <div className="text-xs text-muted-foreground">
                <p>Créé le: {group.createdAt ? new Date(group.createdAt).toLocaleDateString() : 'N/A'}</p>
                {group.updatedAt && <p>Dernière mise à jour: {new Date(group.updatedAt).toLocaleDateString()}</p>}
              </div>
            )}
            
            {/* Members count */}
            {!isEditing && (
              <div className="mt-2">
                <Badge variant="secondary">
                  {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
        
        {isEditing && (
          <CardFooter className="flex justify-end gap-2 pt-0">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditing(false)
                setGroupName(group.name || group.group_name)
                setGroupDescription(group.description || '')
              }}
              disabled={isUpdating}
            >
              {t.cancel || "Annuler"}
            </Button>
            <Button 
              onClick={handleSaveChanges}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              {t.saveChanges || "Enregistrer"}
            </Button>
          </CardFooter>
        )}
      </Card>
      
      {/* Contacts in group */}
      <h2 className="text-xl font-bold mt-8 mb-4 flex items-center gap-2">
        <UsersRound className="h-5 w-5" />
        {t.contactsInGroup || "Contacts dans ce groupe"}
      </h2>
      
      <ContactList 
        contacts={contacts}
        dictionary={dictionary}
        onDelete={handleRemoveContact}
        currentPage={currentPage}
        contactsPerPage={contactsPerPage}
        onPageChange={setCurrentPage}
        totalContacts={contacts.length}
      />
      
      {/* Danger Zone */}
      <div className="mt-12 border border-destructive/20 rounded-lg p-6">
        <h2 className="text-lg font-bold text-destructive mb-4">
          {t.dangerZone || "Zone de danger"}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          {t.deleteGroupWarning || "Supprimer ce groupe entraînera la perte de toutes les associations entre ce groupe et vos contacts. Cette action est irréversible."}
        </p>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="gap-2">
              <Trash2 className="h-4 w-4" />
              {t.deleteGroup || "Supprimer le groupe"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t.deleteConfirmTitle || "Êtes-vous sûr ?"}</AlertDialogTitle>
              <AlertDialogDescription>
                {t.deleteConfirmDesc || "Cette action est irréversible. Les contacts ne seront pas supprimés, mais ils ne seront plus associés à ce groupe."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm font-medium">
                {t.typeGroupNameToConfirm || "Tapez le nom du groupe pour confirmer :"}
                <span className="font-bold"> {group.name || group.group_name}</span>
              </p>
              <Input
                value={deleteConfirmInput}
                onChange={(e) => setDeleteConfirmInput(e.target.value)}
                placeholder={group.name || group.group_name}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>{t.cancel || "Annuler"}</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={(e) => {
                  e.preventDefault()
                  handleDeleteGroup()
                }}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                {t.confirmDelete || "Confirmer la suppression"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
