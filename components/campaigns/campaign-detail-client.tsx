"use client";
import { useState } from 'react';
import { Campaign, Contact } from '@/types/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, MessageSquare, Send, CalendarDays, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { sendCampaignNow } from '@/app/actions/campaigns/campaignActions';
import { useRouter } from 'next/navigation';
import SentMessagesHistory from './sent-messages-history';

interface Props {
  campaign: Campaign;
  validContacts: Contact[];
  dictionary?: any;
}

export default function CampaignDetailClient({ campaign, validContacts, dictionary }: Props) {
  const [isSending, setIsSending] = useState(false);
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'sending': return 'bg-yellow-100 text-yellow-800';
      case 'sent': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Brouillon';
      case 'scheduled': return 'Planifiée';
      case 'sending': return 'En cours';
      case 'sent': return 'Envoyée';
      case 'failed': return 'Échec';
      default: return status;
    }
  };

  const handleSendNow = async () => {
    setIsSending(true);
    try {
      const result = await sendCampaignNow(campaign.$id);
      if (result.success) {
        toast.success('Campagne envoyée avec succès!');
        router.refresh(); // Rafraîchir la page pour voir le nouveau statut
      } else {
        toast.error(result.error || 'Erreur lors de l\'envoi de la campagne');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de la campagne');
      console.error(error);
    }
    setIsSending(false);
  };

  const canSend = campaign.status === 'draft' && validContacts.length > 0;

  return (
    <div className="space-y-6">
      {/* Header avec bouton retour */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/campaigns">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux campagnes
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{campaign.name}</h1>
            <Badge className={getStatusColor(campaign.status)}>
              {getStatusText(campaign.status)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Détails de la campagne */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations générales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Détails de la campagne</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Message</label>
                <div className="mt-1 p-3 rounded-md">
                  <p className="text-sm">{campaign.message}</p>
                </div>
              </div>
              
              {campaign.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="mt-1 text-sm">{campaign.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <p className="mt-1 text-sm capitalize">{campaign.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Créée le</label>
                  <p className="mt-1 text-sm">
                    {new Date(campaign.created_at || '').toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Destinataires */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Destinataires</span>
              </CardTitle>
              <CardDescription>
                {validContacts.length} contact{validContacts.length > 1 ? 's' : ''} avec numéro de téléphone
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {validContacts.slice(0, 5).map((contact) => (
                  <div key={contact.$id} className="flex items-center justify-between p-2 rounded">
                    <span className="text-sm">
                      {contact.first_name || contact.last_name 
                        ? `${contact.first_name || ''} ${contact.last_name || ''}`.trim()
                        : contact.email
                      }
                    </span>
                    <span className="text-sm">{contact.phone}</span>
                  </div>
                ))}
                {validContacts.length > 5 && (
                  <p className="text-sm text-gray-500 text-center">
                    ... et {validContacts.length - 5} autre{validContacts.length - 5 > 1 ? 's' : ''} contact{validContacts.length - 5 > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Historique des messages envoyés */}
          {campaign.status === 'sent' && (
            <SentMessagesHistory 
              campaignId={campaign.$id} 
              campaignMessage={campaign.message}
            />
          )}
        </div>

        {/* Actions */}
        <div className="space-y-6">
          {/* Envoi immédiat */}
          {canSend && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Send className="h-5 w-5" />
                  <span>Envoyer maintenant</span>
                </CardTitle>
                <CardDescription>
                  Envoyer immédiatement à {validContacts.length} destinataire{validContacts.length > 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleSendNow} 
                  disabled={isSending}
                  className="w-full"
                  size="lg"
                >
                  {isSending ? 'Envoi en cours...' : 'Envoyer maintenant'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Programmation - DÉSACTIVÉ */}
          {canSend && (
            <Card className="opacity-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CalendarDays className="h-5 w-5" />
                  <span>Programmer l'envoi</span>
                </CardTitle>
                <CardDescription>
                  Fonctionnalité en développement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  disabled={true}
                  variant="outline"
                  className="w-full"
                >
                  Bientôt disponible
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Historique des messages (si envoyée) */}
          {campaign.status === 'sent' && (
            <SentMessagesHistory 
              campaignId={campaign.$id} 
              campaignMessage={campaign.message}
            />
          )}

          {/* Statistiques (si envoyée) */}
          {campaign.status === 'sent' && (
            <Card>
              <CardHeader>
                <CardTitle>Statistiques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Envoyés</span>
                    <span className="font-medium">{validContacts.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Taux de livraison</span>
                    <span className="font-medium">-</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Réponses</span>
                    <span className="font-medium">-</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
