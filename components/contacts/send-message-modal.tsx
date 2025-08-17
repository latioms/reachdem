"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { sendMessageToContact } from '@/app/actions/contacts/sendMessageToContact';
import { getProjectsByUserId } from '@/app/actions/SMS/project/getProjectsByUserId';
import { toast } from 'sonner';
import { Send, MessageCircle, User, Phone } from 'lucide-react';
import type { Contact } from '@/types/schema';
import type { Models } from 'appwrite';

interface SendMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact;
  dictionary?: any;
  userId: string;
}

export default function SendMessageModal({
  isOpen,
  onClose,
  contact,
  dictionary,
  userId
}: SendMessageModalProps) {
  const [projectId, setProjectId] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [charCount, setCharCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [projects, setProjects] = useState<Models.Document[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState<boolean>(true);
  
  const MAX_CHARS = 160;
  const t = dictionary?.contacts || {};

  useEffect(() => {
    // Nettoyage au démontage du composant
    return () => {
      document.body.style.pointerEvents = '';
      document.body.style.overflow = '';
      document.body.removeAttribute('data-scroll-locked');
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setProjectId('');
      setMessage('');
      setCharCount(0);
      fetchProjects();
    } else {
      // Nettoyage complet quand le modal se ferme
      setProjectId('');
      setMessage('');
      setCharCount(0);
      setIsLoading(false);
      setProjects([]);
    }
  }, [isOpen, userId]);

  const fetchProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const response = await getProjectsByUserId(userId);
      if (response.success && response.projects) {
        // Filter only active projects with SMS credits
        const activeProjects = response.projects.filter(
          (project: Models.Document) => project.active === 'enabled' && project.sms_credits > 0
        );
        setProjects(activeProjects);
      } else {
        setProjects([]);
        toast.error("Erreur lors du chargement des projets");
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
      toast.error("Erreur lors du chargement des projets");
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const handleMessageChange = (value: string) => {
    if (value.length <= MAX_CHARS) {
      setMessage(value);
      setCharCount(value.length);
    }
  };

  const handleSendMessage = async () => {
    if (!projectId || !message.trim() || !contact.phone) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (message.length > MAX_CHARS) {
      toast.error(`Le message ne peut pas dépasser ${MAX_CHARS} caractères`);
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await sendMessageToContact({
        contactId: contact.$id,
        projectId,
        message: message.trim(),
        phone: contact.phone
      });

      if (response.success) {
        toast.success("Message envoyé avec succès");
        // Réinitialiser l'état de chargement immédiatement
        setIsLoading(false);
        // Fermer le modal après un court délai
        setTimeout(() => {
          onClose();
        }, 100);
      } else {
        toast.error(response.error || "Erreur lors de l'envoi du message");
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Une erreur inattendue s'est produite");
    } finally {
      // Seulement réinitialiser si pas de succès
      if (isLoading) {
        setIsLoading(false);
      }
    }
  };

  const contactDisplayName = contact.first_name || contact.last_name 
    ? `${contact.first_name || ''} ${contact.last_name || ''}`.trim()
    : contact.email.split('@')[0];

  const selectedProject = projects.find(p => p.$id === projectId);

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open && !isLoading) {
          // Forcer le nettoyage des styles du body
          setTimeout(() => {
            document.body.style.pointerEvents = '';
            document.body.style.overflow = '';
            document.body.removeAttribute('data-scroll-locked');
          }, 100);
          onClose();
        }
      }}
    >
      <DialogContent 
        className="sm:max-w-[500px]" 
        onPointerDownOutside={(e) => {
          if (isLoading) {
            e.preventDefault();
          }
        }} 
        onEscapeKeyDown={(e) => {
          if (isLoading) {
            e.preventDefault();
          }
        }}
        onCloseAutoFocus={(e) => {
          // Éviter le focus automatique qui peut causer des problèmes
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            {t.sendMessage?.title || "Envoyer un message"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contact Info */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{contactDisplayName}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  {contact.phone}
                </div>
              </div>
            </div>
          </div>

          {/* Project Selection */}
          <div className="space-y-2">
            <Label htmlFor="project">
              {t.sendMessage?.projectLabel || "Projet expéditeur"} *
            </Label>
            {isLoadingProjects ? (
              <div className="h-10 bg-muted animate-pulse rounded-md" />
            ) : (
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder={t.sendMessage?.projectPlaceholder || "Sélectionner un projet"} />
                </SelectTrigger>
                <SelectContent>
                  {projects.length === 0 ? (
                    <SelectItem value="" disabled>
                      {t.sendMessage?.noProjects || "Aucun projet disponible"}
                    </SelectItem>
                  ) : (
                    projects.map((project) => (
                      <SelectItem key={project.$id} value={project.$id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{project.sender_name}</span>
                          <Badge variant="secondary" className="ml-2">
                            {project.sms_credits} crédits
                          </Badge>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
            {projects.length === 0 && !isLoadingProjects && (
              <p className="text-sm text-muted-foreground">
                {t.sendMessage?.noProjectsHelp || "Vous devez avoir au moins un projet actif avec des crédits SMS."}
              </p>
            )}
          </div>

          {/* Message Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="message">
                {t.sendMessage?.messageLabel || "Message"} *
              </Label>
              <div className="text-sm text-muted-foreground">
                <span className={charCount > MAX_CHARS ? 'text-destructive' : ''}>
                  {charCount}
                </span>
                /{MAX_CHARS}
              </div>
            </div>
            <Textarea
              id="message"
              placeholder={t.sendMessage?.messagePlaceholder || "Tapez votre message ici..."}
              value={message}
              onChange={(e) => handleMessageChange(e.target.value)}
              className="min-h-[100px] resize-none"
              maxLength={MAX_CHARS}
            />
            {charCount > MAX_CHARS && (
              <p className="text-sm text-destructive">
                {t.sendMessage?.charLimitError || "Le message dépasse la limite de caractères autorisée"}
              </p>
            )}
          </div>

          {/* Cost Info */}
          {selectedProject && message.trim() && (
            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {t.sendMessage?.cost || "Coût"}:
                </span>
                <span className="font-medium">1 crédit SMS</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-muted-foreground">
                  {t.sendMessage?.remaining || "Crédits restants après envoi"}:
                </span>
                <span className="font-medium">
                  {selectedProject.sms_credits - 1} crédits
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isLoading}
          >
            {t.sendMessage?.cancel || "Annuler"}
          </Button>
          <Button 
            onClick={handleSendMessage} 
            disabled={
              isLoading || 
              !projectId || 
              !message.trim() || 
              charCount > MAX_CHARS ||
              projects.length === 0
            }
            className="gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                {t.sendMessage?.sending || "Envoi..."}
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                {t.sendMessage?.send || "Envoyer"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
