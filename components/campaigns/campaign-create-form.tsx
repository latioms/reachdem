"use client";
import { useEffect, useState, useTransition } from 'react';
import { listContacts, listGroups } from '@/app/actions/campaigns/targetsActions';
import { createCampaign } from '@/app/actions/campaigns/campaignActions';
import { Contact, Group } from '@/types/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserProjects } from '@/hooks/use-projects';
import { useAuth } from '@/context/authContext';
import { toast } from 'sonner';

interface Props { onCreated?: () => void; }

export default function CampaignCreateForm({ onCreated }: Props) {
  const { currentUser } = useAuth();
  const { data: projects } = useUserProjects(currentUser?.id);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [projectId, setProjectId] = useState('');
  const [type, setType] = useState<'sms' | 'whatsapp'>('sms');
  const [isPending, startTransition] = useTransition();

  useEffect(() => { 
    (async () => { 
      const [c, g] = await Promise.all([listContacts(), listGroups()]); 
      setContacts(c); 
      setGroups(g); 
    })(); 
  }, []);

  const toggleContact = (id: string) => setSelectedContacts(p => { 
    const n = new Set(p); 
    if (n.has(id)) {
      n.delete(id);
    } else {
      n.add(id);
    }
    return n; 
  });
  
  const toggleGroup = (id: string) => setSelectedGroups(p => { 
    const n = new Set(p); 
    if (n.has(id)) {
      n.delete(id);
    } else {
      n.add(id);
    }
    return n; 
  });

  const handleSubmit = () => {
    if (!name || !message || !projectId) { 
      toast.error('Champs requis manquants'); 
      return; 
    }
    if (selectedContacts.size === 0 && selectedGroups.size === 0) { 
      toast.error('Sélectionnez au moins un contact ou un groupe'); 
      return; 
    }
    startTransition(async () => {
      const res = await createCampaign({ 
        project_id: projectId, 
        name, 
        description: '', 
        message, 
        contact_targets: Array.from(selectedContacts), 
        group_targets: Array.from(selectedGroups), 
        type, 
      });
      if (res) { 
        toast.success('Campagne créée'); 
        setName(''); 
        setMessage(''); 
        setSelectedContacts(new Set()); 
        setSelectedGroups(new Set()); 
        onCreated?.(); 
      } else { 
        toast.error('Échec de création'); 
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <div><Label>Nom</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Campagne SMS" /></div>
          <div><Label>Projet</Label><Select value={projectId} onValueChange={setProjectId}><SelectTrigger><SelectValue placeholder="Choisir un projet" /></SelectTrigger><SelectContent>{projects?.map(p => (<SelectItem key={p.id} value={p.id}>{p.sender_name}</SelectItem>))}</SelectContent></Select></div>
          <div><Label>Type</Label><Select value={type} onValueChange={(v: 'sms' | 'whatsapp') => setType(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sms">SMS</SelectItem><SelectItem value="whatsapp" disabled>WhatsApp (bientôt)</SelectItem></SelectContent></Select></div>
          <div><Label>Message</Label><Textarea value={message} onChange={e => setMessage(e.target.value)} maxLength={160} placeholder="Votre message" /><p className="text-xs text-muted-foreground mt-1">{message.length}/160</p></div>
          <Button disabled={isPending} onClick={handleSubmit} className="w-full">{isPending ? 'Création...' : 'Créer la campagne'}</Button>
        </div>
        <div className="space-y-4">
          <div><Label>Contacts ({selectedContacts.size})</Label><div className="max-h-48 overflow-auto border rounded p-2 space-y-1 text-sm">{contacts.map(c => (<label key={c.$id} className="flex items-center space-x-2 cursor-pointer"><Checkbox checked={selectedContacts.has(c.$id)} onCheckedChange={() => toggleContact(c.$id)} /><span>{c.first_name || c.last_name ? `${c.first_name || ''} ${c.last_name || ''}`.trim() : c.email}</span></label>))}{contacts.length === 0 && <p className="text-muted-foreground">Aucun contact</p>}</div></div>
          <div><Label>Groupes ({selectedGroups.size})</Label><div className="max-h-40 overflow-auto border rounded p-2 space-y-1 text-sm">{groups.map(g => (<label key={g.$id} className="flex items-center space-x-2 cursor-pointer"><Checkbox checked={selectedGroups.has(g.$id)} onCheckedChange={() => toggleGroup(g.$id)} /><span>{g.group_name}</span></label>))}{groups.length === 0 && <p className="text-muted-foreground">Aucun groupe</p>}</div></div>
        </div>
      </div>
    </div>
  );
}
