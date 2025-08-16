"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Phone, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { getCampaignMessages, SentMessage } from '@/app/actions/campaigns/messageActions';

interface Props {
  campaignId: string;
  campaignMessage: string;
}

export default function SentMessagesHistory({ campaignId, campaignMessage }: Props) {
  const [messages, setMessages] = useState<SentMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessageHistory = async () => {
      setLoading(true);
      try {
        const history = await getCampaignMessages(campaignId);
        setMessages(history);
      } catch (error) {
        console.error('Erreur lors du chargement de l\'historique:', error);
      }
      setLoading(false);
    };

    fetchMessageHistory();
  }, [campaignId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'sent':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return 'Livré';
      case 'sent': return 'Envoyé';
      case 'failed': return 'Échec';
      case 'pending': return 'En attente';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historique des envois</CardTitle>
          <CardDescription>Chargement...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Phone className="h-5 w-5" />
          <span>Historique des envois</span>
        </CardTitle>
        <CardDescription>
          {messages.length} message{messages.length > 1 ? 's' : ''} envoyé{messages.length > 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-96 overflow-y-auto">
          <div className="space-y-3">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className="flex items-start justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(message.status)}
                    <span className="font-medium text-sm">{message.contact_name}</span>
                    <Badge className={getStatusColor(message.status)}>
                      {getStatusText(message.status)}
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Phone className="h-3 w-3" />
                      <span>{message.phone}</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-400">
                    Envoyé le {new Date(message.sent_at).toLocaleString('fr-FR')}
                    {message.delivered_at && (
                      <span className="ml-2">
                        • Livré le {new Date(message.delivered_at).toLocaleString('fr-FR')}
                      </span>
                    )}
                  </div>

                  {message.error_message && (
                    <div className="text-xs text-red-600 bg-red-50 p-1 rounded">
                      Erreur: {message.error_message}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {messages.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Phone className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>Aucun message envoyé pour le moment</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
