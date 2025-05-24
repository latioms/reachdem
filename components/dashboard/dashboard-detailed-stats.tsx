"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/authContext'
import { getMessageStats, getFinancialStats, formatAmount, formatPercentage, formatRelativeDate, type MessageStats, type FinancialStats } from '@/lib/dashboard-stats'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface DashboardDetailedStatsProps {
  dictionary: any
}

export function DashboardDetailedStats({ dictionary }: DashboardDetailedStatsProps) {
  const { currentUser } = useAuth()
  const [messageStats, setMessageStats] = useState<MessageStats | null>(null)
  const [financialStats, setFinancialStats] = useState<FinancialStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDetailedStats = async () => {
      if (!currentUser?.id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const [msgStats, finStats] = await Promise.all([
          getMessageStats(currentUser.id),
          getFinancialStats(currentUser.id)
        ])
        
        setMessageStats(msgStats)
        setFinancialStats(finStats)
      } catch (err) {
        console.error('Erreur lors de la récupération des statistiques détaillées:', err)
        setError('Erreur lors du chargement des statistiques détaillées')
      } finally {
        setLoading(false)
      }
    }

    fetchDetailedStats()
  }, [currentUser?.id])

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
  if (error || (!messageStats && !financialStats)) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <p>{dictionary.dashboard?.loading?.error || "No data available at the moment"}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">      {/* Statistiques des messages */}
      {messageStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {dictionary.dashboard?.detailed?.messageActivity || "Message Activity"}
            </CardTitle>
            <CardDescription>
              {dictionary.lang === 'fr' ? 'Aperçu de vos envois récents' : 'Overview of your recent sends'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {dictionary.dashboard?.detailed?.today || "Today"}
              </span>
              <Badge variant="outline">{messageStats.today}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {dictionary.dashboard?.detailed?.thisWeek || "This Week"}
              </span>
              <Badge variant="outline">{messageStats.thisWeek}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {dictionary.dashboard?.detailed?.averagePerDay || "Average per Day"}
              </span>
              <Badge variant="outline">{messageStats.averagePerDay.toFixed(1)}</Badge>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">
                  {dictionary.lang === 'fr' ? 'Statuts' : 'Status'}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">
                      {dictionary.history?.status?.SUCCESS || "Success"}
                    </span>
                  </div>
                  <span className="text-sm font-medium">{messageStats.byStatus.SUCCESS}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">
                      {dictionary.history?.status?.PENDING || "Pending"}
                    </span>
                  </div>
                  <span className="text-sm font-medium">{messageStats.byStatus.PENDING}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm">
                      {dictionary.history?.status?.FAILED || "Failed"}
                    </span>
                  </div>
                  <span className="text-sm font-medium">{messageStats.byStatus.FAILED}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}      {/* Statistiques financières */}
      {financialStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {dictionary.dashboard?.detailed?.financialStats || "Financial Statistics"}
            </CardTitle>
            <CardDescription>
              {dictionary.lang === 'fr' ? 'Résumé de vos dépenses' : 'Summary of your expenses'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {dictionary.dashboard?.detailed?.monthlySpending || "Monthly Spending"}
              </span>
              <Badge variant="outline">{formatAmount(financialStats.spentThisMonth, dictionary.lang)}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {dictionary.dashboard?.detailed?.yearlySpending || "Yearly Spending"}
              </span>
              <Badge variant="outline">{formatAmount(financialStats.spentThisYear, dictionary.lang)}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {dictionary.lang === 'fr' ? 'Total dépensé' : 'Total spent'}
              </span>
              <Badge variant="outline">{formatAmount(financialStats.totalSpent, dictionary.lang)}</Badge>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">
                  {dictionary.dashboard?.detailed?.totalTransactions || "Transactions"}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">
                      {dictionary.billing?.status?.completed || "Completed"}
                    </span>
                  </div>
                  <span className="text-sm font-medium">{financialStats.completedTransactions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">
                      {dictionary.billing?.status?.pending || "Pending"}
                    </span>
                  </div>
                  <span className="text-sm font-medium">{financialStats.pendingTransactions}</span>
                </div>                {financialStats.lastTransactionDate && (
                  <div className="pt-2 text-xs text-muted-foreground">
                    {dictionary.lang === 'fr' ? 'Dernière transaction:' : 'Last transaction:'} {formatRelativeDate(financialStats.lastTransactionDate, dictionary.lang)}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}      {/* Projets les plus actifs */}
      {messageStats && messageStats.byProject.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {dictionary.dashboard?.detailed?.mostActiveProjects || "Most Active Projects"}
            </CardTitle>
            <CardDescription>
              {dictionary.lang === 'fr' ? 'Vos projets les plus utilisés' : 'Your most used projects'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {messageStats.byProject
              .sort((a, b) => b.messageCount - a.messageCount)
              .slice(0, 5)
              .map((project, index) => (
                <div key={project.projectId} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      index === 0 ? 'bg-green-500' : 
                      index === 1 ? 'bg-blue-500' : 
                      index === 2 ? 'bg-yellow-500' : 'bg-gray-400'
                    }`} />
                    <span className="text-sm truncate max-w-32" title={project.projectName}>
                      {project.projectName}
                    </span>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {project.messageCount} {dictionary.dashboard?.detailed?.messages || "messages"}
                  </Badge>
                </div>
              ))}
            {messageStats.byProject.length === 0 && (
              <div className="text-center py-4 text-muted-foreground text-sm">
                {dictionary.dashboard?.empty?.noProjects || "No projects with messages"}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
