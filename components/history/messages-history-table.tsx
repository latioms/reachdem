"use client"

import React, { useEffect, useState } from 'react'
import { getMessagesByUserId } from '@/app/actions/SMS/messages/getMessagesByUserId'
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from '@/context/authContext'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'

interface Message {
  $id: string;
  message_id: string;
  user_id: string;
  content: string;
  receiver: string;
  status: string;
  $createdAt: string;
}

interface MessagesHistoryTableProps {
  dictionary?: any;
}

export function MessagesHistoryTable({ dictionary }: MessagesHistoryTableProps) {
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
  // const uniqueDates = [...new Set(messages.map(message =>
  //   new Date(message.$createdAt).toISOString().split('T')[0]
  // ))].sort((a, b) => b.localeCompare(a)); // Sort dates in descending order

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
  const totalPages = Math.ceil(filteredMessages.length / messagesPerPage);  // Format date

  // Format date for filter options
  const formatDateForFilter = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      // Use 'fr' locale for French, or enUS for English with formatDistanceToNow
      let lang = fr

      if (dictionary?.timeFormat === 'enUS') {
        lang = enUS
      } else if (dictionary?.lang === 'fr') {
        lang = fr
      }
      return formatDistanceToNow(date, { addSuffix: true, locale: lang });
    } catch (error) {
      console.error("Error formatting date for filter:", error);
      return dateString;
    }
  };

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
    return <div>{dictionary?.table.loading || "Loading..."}</div>
  }

  return (
    <div>
      <Card className="mb-8 rounded-t-sm">
        <CardHeader>
          <div className="flex items-center text-center justify-between">
            <div>
              <CardDescription>{dictionary?.table.description || "Historique de vos messages"}</CardDescription>
            </div>            <div className="flex gap-2">
              {/* Status filter */}
              <select
                className="px-2 py-1 border rounded-md text-sm"
                onChange={(e) => setStatusFilter(e.target.value === 'all' ? null : e.target.value)}
                value={statusFilter || 'all'}
              >
                <option value="all" className='text-white bg-accent' >{dictionary?.table.filters.allStatuses || "Tous les statuts"}</option>
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
                <option className='text-white bg-accent' value="all">{dictionary?.table.filters.allRecipients || "Tous les destinataires"}</option>
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
                <tr>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">#</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">{dictionary?.table.columns.id || "ID"}</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">{dictionary?.table.columns.message || "Message"}</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">{dictionary?.table.columns.recipient || "Destinataire"}</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">{dictionary?.table.columns.status || "Statut"}</th>
                  <th
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-gray-900 flex items-center"
                    onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                  >
                    {dictionary?.table.columns.date || "Date"}
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
                          {dictionary?.status[message.status] || message.status}
                        </span>
                      </td>
                      <td className="p-4 text-left align-middle">{formatDateForFilter(message.$createdAt)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-4 text-center">{dictionary?.table.noMessages || "Aucun message trouvé"}</td>
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
                    {dictionary?.table.pagination.showing
                      ? dictionary.table.pagination.showing
                        .replace('{start}', String(indexOfFirstMessage + 1))
                        .replace('{end}', String(Math.min(indexOfLastMessage, filteredMessages.length)))
                        .replace('{total}', String(filteredMessages.length))
                      : `Affichage de ${indexOfFirstMessage + 1} à ${Math.min(indexOfLastMessage, filteredMessages.length)} sur ${filteredMessages.length} messages`
                    }
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
                      {dictionary?.table.pagination.previous || "Précédent"}
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
                    })}                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="ml-2"
                    >
                      {dictionary?.table.pagination.next || "Suivant"}
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
