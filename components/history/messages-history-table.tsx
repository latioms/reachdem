"use client"

import React, { useEffect, useState } from 'react'
import { getMessagesByUserId } from '@/app/actions/messages/getMessagesByUserId'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from '@/context/authContext'
import { format, formatRelative, formatDistance, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Message {
  $id: string;
  message_id: string;
  user_id: string;
  content: string;
  receiver: string;
  status: string;
  $createdAt: string;
}

export function MessagesHistoryTable() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [messagesPerPage] = useState(10)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [receiverFilter, setReceiverFilter] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const { currentUser } = useAuth();
    // Get unique statuses and receivers for filtering
  const uniqueStatuses = [...new Set(messages.map(message => message.status))]
  const uniqueReceivers = [...new Set(messages.map(message => message.receiver))]
    // Get unique dates for filtering
  const uniqueDates = [...new Set(messages.map(message => 
    new Date(message.$createdAt).toISOString().split('T')[0]
  ))].sort((a, b) => b.localeCompare(a)); // Sort dates in descending order

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        console.log("current account: ", currentUser);
        
        if (currentUser) {
          const response = await getMessagesByUserId(currentUser.id);
          if (response.success && response.messages) {
            // Cast the documents to our Message interface
            setMessages(response.messages as unknown as Message[]);
          }
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [currentUser]);  // Apply filters
  const filteredMessages = messages
    .filter(message => {
      const messageDate = new Date(message.$createdAt).toISOString().split('T')[0];
      return (
        (statusFilter === null || message.status === statusFilter) &&
        (receiverFilter === null || message.receiver === receiverFilter) 
      );
    })
    .sort((a, b) => {
      const dateA = new Date(a.$createdAt).getTime();
      const dateB = new Date(b.$createdAt).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });

  // Pagination logic
  const indexOfLastMessage = currentPage * messagesPerPage;
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
  const currentMessages = filteredMessages.slice(indexOfFirstMessage, indexOfLastMessage);
  const totalPages = Math.ceil(filteredMessages.length / messagesPerPage);
  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'dd MMMM yyyy à HH:mm', { locale: fr });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };
  
  // Format date for filter options
  const formatDateForFilter = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'dd MMMM yyyy', { locale: fr });
    } catch (error) {
      console.error("Error formatting date for filter:", error);
      return dateString;
    }
  };
  
  // Get relative time (like "il y a 2 heures")
  const getRelativeTime = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return formatRelative(date, new Date(), { locale: fr });
    } catch (error) {
      console.error("Error getting relative time:", error);
      return dateString;
    }
  };  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, receiverFilter]);

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-50 text-green-700 ring-green-600/20';
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-700 ring-yellow-600/20';
      case 'FAILED':
        return 'bg-red-50 text-red-700 ring-red-600/20';
      default:
        return 'bg-blue-50 text-blue-700 ring-blue-600/20';
    }
  };

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <Card className="mb-8 rounded-t-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Messages envoyés</CardTitle>
              <CardDescription>Historique de tous vos messages</CardDescription>
            </div>            <div className="flex gap-2">
              {/* Status filter */}
              <select 
                className="px-2 py-1 border rounded-md text-sm"
                onChange={(e) => setStatusFilter(e.target.value === 'all' ? null : e.target.value)}
                value={statusFilter || 'all'}
              >
                <option value="all" className='text-white bg-accent' >Tous les statuts</option>
                {uniqueStatuses.map(status => (
                  <option className='text-white bg-accent' key={status} value={status}>{status}</option>
                ))}
              </select>
              
              {/* Receiver filter */}
              <select 
                className="px-2 py-1 border rounded-md text-sm"
                onChange={(e) => setReceiverFilter(e.target.value === 'all' ? null : e.target.value)}
                value={receiverFilter || 'all'}
              >
                <option className='text-white bg-accent' value="all">Tous les destinataires</option>
                {uniqueReceivers.map(receiver => (
                  <option className='text-white bg-accent' key={receiver} value={receiver}>{receiver}</option>
                ))}
              </select>


            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">#</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Message</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Destinataire</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Statut</th>
                  <th 
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-gray-900 flex items-center"
                    onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                  >
                    Date
                    <span className="ml-1">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {currentMessages.length > 0 ? (
                  currentMessages.map((message, index) => (
                    <tr key={message.$id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <td className="p-4 text-left align-middle">{indexOfFirstMessage + index + 1}</td>
                      <td className="p-4 text-left align-middle">{message.message_id.substring(0, 8)}...</td>
                      <td className="p-4 text-left align-middle max-w-[200px] truncate" title={message.content}>{message.content}</td>
                      <td className="p-4 text-left align-middle">{message.receiver}</td>
                      <td className="p-4 text-left align-middle">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(message.status)}`}>
                          {message.status}
                        </span>
                      </td>
                      <td className="p-4 text-left align-middle">{formatDate(message.$createdAt)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-4 text-center">Aucun message trouvé</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {filteredMessages.length > messagesPerPage && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Affichage de <span className="font-medium">{indexOfFirstMessage + 1}</span> à{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastMessage, filteredMessages.length)}
                    </span>{' '}
                    sur <span className="font-medium">{filteredMessages.length}</span> messages
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="mr-2"
                    >
                      Précédent
                    </Button>
                    {[...Array(totalPages)].map((_, index) => {
                      // Show only 5 page numbers
                      if (
                        index + 1 === 1 ||
                        index + 1 === totalPages ||
                        (index + 1 >= currentPage - 1 && index + 1 <= currentPage + 1)
                      ) {
                        return (
                          <Button
                            key={index}
                            variant={currentPage === index + 1 ? 'default' : 'outline'}
                            onClick={() => setCurrentPage(index + 1)}
                            className="mx-1"
                          >
                            {index + 1}
                          </Button>
                        );
                      }
                      if (index + 1 === currentPage - 2 || index + 1 === currentPage + 2) {
                        return <span key={index} className="mx-1 flex items-center">...</span>;
                      }
                      return null;
                    })}
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="ml-2"
                    >
                      Suivant
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
