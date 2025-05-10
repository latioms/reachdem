'use client';

import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTransactions } from '@/app/actions/transactions/getTransaction';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowUpDown, Search, Calendar, RefreshCw, CreditCard, CopyIcon } from 'lucide-react';
import { Label } from '../ui/label';

interface Transaction {
  $id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  $createdAt: string;
  updated: string;
  payment_method: string;
  description?: string;
  project_id?: string;
  project_name?: string;
  credits?: number;
  user_id?: string;
}

export default function BillingHistoryTable({ projectId, dictionary }: { projectId?: string, dictionary: any }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Transaction; direction: 'asc' | 'desc' }>({
    key: '$createdAt', direction: 'desc'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const result = await getTransactions(projectId);

        if (result.error) {
          setError(result.error);
        } else {
          // Cast the documents to our Transaction interface
          setTransactions((result.transactions || []) as unknown as Transaction[]);
        }
      } catch (err: any) {
        setError(err.message || 'Une erreur est survenue lors du chargement des transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [projectId, refreshTrigger]);
  // Filter and sort transactions when dependencies change
  useEffect(() => {
    let result = [...transactions];

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(transaction => transaction.status === statusFilter);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(transaction =>
        transaction.payment_method?.toLowerCase().includes(searchLower) ||
        transaction.description?.toLowerCase().includes(searchLower) ||
        transaction.project_name?.toLowerCase().includes(searchLower) ||
        transaction.$id?.toLowerCase().includes(searchLower) ||
        transaction.amount.toString().includes(searchLower)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortConfig.key === 'amount') {
        return sortConfig.direction === 'asc'
          ? a.amount - b.amount
          : b.amount - a.amount;
      } else if (sortConfig.key === '$createdAt' || sortConfig.key === 'updated') {
        return sortConfig.direction === 'asc'
          ? new Date(a[sortConfig.key]).getTime() - new Date(b[sortConfig.key]).getTime()
          : new Date(b[sortConfig.key]).getTime() - new Date(a[sortConfig.key]).getTime();
      } else {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        return sortConfig.direction === 'asc'
          ? aValue.toString().localeCompare(bValue.toString())
          : bValue.toString().localeCompare(aValue.toString());
      }
    });

    setFilteredTransactions(result);
  }, [transactions, searchTerm, statusFilter, sortConfig]);

  const handleSort = (key: keyof Transaction) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  // Fonction pour déterminer la locale date-fns à utiliser
  const getDateLocale = () => {
    return dictionary.timeFormat === 'fr' ? fr : undefined;
  };

  // Mise à jour de la fonction formatDate pour utiliser la locale du dictionnaire
  const formatDate = (date: string, relative = true) => {
    if (!date) return '';
    
    const dateObj = new Date(date);
    
    if (relative) {
      return formatDistanceToNow(dateObj, { 
        addSuffix: true,
        locale: getDateLocale()
      });
    }
    
    return format(dateObj, 'PPp', { 
      locale: getDateLocale()
    });
  };

  // Fonction pour obtenir le badge de statut avec les traductions
  const getStatusBadge = (status: string) => {
    let badgeClass = '';
    let statusText = '';
    
    switch (status) {
      case 'pending':
        badgeClass = 'bg-yellow-100 text-yellow-700 border-yellow-200';
        statusText = dictionary.status.pending;
        break;
      case 'completed':
        badgeClass = 'bg-green-100 text-green-700 border-green-200';
        statusText = dictionary.status.completed;
        break;
      case 'failed':
        badgeClass = 'bg-red-100 text-red-700 border-red-200';
        statusText = dictionary.status.failed;
        break;
      default:
        badgeClass = 'bg-gray-100 text-gray-700 border-gray-200';
        statusText = status;
    }
    
    return (
      <Badge variant="outline" className={`${badgeClass}`}>
        {statusText}
      </Badge>
    );
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      maximumFractionDigits: 0
    }).format(amount);
  };
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{dictionary.history.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
            <span>{dictionary.history.loading}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{dictionary.history.title}</CardTitle>
        </CardHeader>        <CardContent>
          <div className="text-red-500 py-4 flex flex-col items-center">
            <div className="mb-4">{error}</div>
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              {dictionary.history.refresh}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{dictionary.history.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            {dictionary.history.noTransactions}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>{dictionary.history.title}</CardTitle>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="mr-1 h-4 w-4" />
          {dictionary.history.refresh}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={dictionary.history.filters.search}
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-md mt-12">
          <Table>
            <TableHeader>
              <TableRow >
                <TableHead className="w-[180px] cursor-pointer" onClick={() => handleSort('$createdAt')}>
                  <div className="flex items-center space-x-1">
                    <span>{dictionary.history.columns.date}</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('amount')}>
                  <div className="flex items-center space-x-1">
                    <span>{dictionary.history.columns.amount}</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>{dictionary.history.columns.paymentMethod}</TableHead>
                <TableHead>{dictionary.history.columns.description}</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                  <div className="flex items-center space-x-1">
                    <span>{dictionary.history.columns.status}</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    {dictionary.history.noTransactions}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.$id} className="group">
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{formatDate(transaction?.$createdAt)}</span>
                        <span className="text-xs text-muted-foreground hidden group-hover:block">
                          {formatDate(transaction.$createdAt, false)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold">{formatAmount(transaction.amount)}</span>
                        {transaction.credits && (
                          <span className="text-xs text-muted-foreground">{transaction.credits} crédits</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell><span className='flex items-center gap-2'><CreditCard className='h-5 w-5' />{transaction?.payment_method || 'Mobile Payment'}</span></TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Label className='px-6 py-2 bg-background rounded-md flex items-center gap-1 group cursor-pointer' 
                          onClick={() => {
                            if (transaction.project_id) {
                              navigator.clipboard.writeText(transaction.project_id);
                              // Optionally add a toast notification here
                            }
                          }}>
                          {transaction.project_id || 'Général'}
                          <CopyIcon className="relative h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Label>
                      </div>
                    </TableCell>                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="text-xs text-muted-foreground mt-4 text-right">
          Total: {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
        </div>
      </CardContent>
    </Card>
  );
}
