"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, FolderDot, CreditCard, TrendingUp } from 'lucide-react'
import { useAuth } from '@/context/authContext'
import { getDashboardStats, formatPercentage, type DashboardStats } from '@/lib/dashboard-stats'
import { Skeleton } from '@/components/ui/skeleton'

interface DashboardStatsCardsProps {
  dictionary: any
}

export function DashboardStatsCards({ dictionary }: DashboardStatsCardsProps) {
  const { currentUser } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      if (!currentUser?.id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const dashboardStats = await getDashboardStats(currentUser.id)
        setStats(dashboardStats)
      } catch (err) {
        console.error('Erreur lors de la récupération des statistiques:', err)
        setError('Erreur lors du chargement des statistiques')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [currentUser?.id])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
  if (error || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: dictionary.dashboard?.stats?.activeProjects || "Active Projects", icon: FolderDot, subtitle: "projects" },
          { title: dictionary.dashboard?.stats?.monthlyMessages || "Monthly Messages", icon: MessageSquare, subtitle: "this month" },
          { title: dictionary.dashboard?.stats?.smsCredits || "SMS Credits", icon: CreditCard, subtitle: "remaining" },
          { title: dictionary.dashboard?.stats?.successRate || "Success Rate", icon: TrendingUp, subtitle: "of messages" }
        ].map((card, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">-</div>
              <p className="text-xs text-muted-foreground">
                {error ? dictionary.dashboard?.loading?.error || "Error" : dictionary.dashboard?.loading?.stats || "Loading..."}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">      {/* Projets actifs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {dictionary.dashboard?.stats?.activeProjects || "Active Projects"}
          </CardTitle>
          <FolderDot className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeProjects}</div>          <p className="text-xs text-muted-foreground">
            {dictionary.dashboard?.units?.outOfTotal?.replace('{total}', stats.totalProjects) || 
             (dictionary.lang === 'fr' ? `sur ${stats.totalProjects} projets total` : `out of ${stats.totalProjects} total projects`)}
          </p>
        </CardContent>
      </Card>

      {/* Messages envoyés ce mois */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {dictionary.dashboard?.stats?.monthlyMessages || "Monthly Messages"}
          </CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.messagesSentThisMonth.toLocaleString()}</div>          <p className="text-xs text-muted-foreground">
            {dictionary.dashboard?.units?.thisMonth || (dictionary.lang === 'fr' ? 'ce mois-ci' : 'this month')}
          </p>
        </CardContent>
      </Card>

      {/* Crédits SMS */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {dictionary.dashboard?.stats?.smsCredits || "SMS Credits"}
          </CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalSmsCredits.toLocaleString()}</div>          <p className="text-xs text-muted-foreground">
            {dictionary.dashboard?.units?.creditsRemaining || (dictionary.lang === 'fr' ? 'crédits restants' : 'credits remaining')}
          </p>
        </CardContent>
      </Card>

      {/* Taux de succès */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {dictionary.dashboard?.stats?.successRate || "Success Rate"}
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPercentage(stats.successRate)}</div>          <p className="text-xs text-muted-foreground">
            {dictionary.dashboard?.units?.ofMessages || (dictionary.lang === 'fr' ? 'des messages' : 'of messages')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
