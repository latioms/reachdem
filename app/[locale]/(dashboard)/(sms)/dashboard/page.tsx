import React from 'react'
import { getDictionary } from '../../../dictionaries';
import { getLang } from '@/lib/lang';
import { ProjectClientPage } from '@/components/project/project-client-page';
import CreditsManagementTable from '@/components/billing/CreditsManagementTable';
import { MessagesHistoryTable } from '@/components/history/messages-history-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, FolderDot, CreditCard, TrendingUp } from 'lucide-react';
import { DashboardStatsCards } from '@/components/dashboard/dashboard-stats-cards';
import { DashboardDetailedStats } from '@/components/dashboard/dashboard-detailed-stats';

export default async function Page() {
  const lang = await getLang();
  const t = await getDictionary(lang);

  return (
    <div className="container mx-auto py-6 space-y-8">      {/* Header du Dashboard */}
      <div className="flex flex-col space-y-2">        <h1 className="text-3xl font-bold tracking-tight">
          {t.dashboard?.title || t.sidebar?.dashboard?.title || "Dashboard"}
        </h1>
        <p className="text-muted-foreground">
          {t.dashboard?.subtitle || 
            (t.lang === 'fr' 
              ? "Vue d'ensemble de votre activité SMS et projets"
              : "Overview of your SMS activity and projects")
          }
        </p>
      </div>{/* Cartes de statistiques rapides */}
      <DashboardStatsCards dictionary={t} />      {/* Statistiques détaillées */}
      <div className="space-y-6">        <h2 className="text-2xl font-semibold tracking-tight">
          {t.dashboard?.detailedStatsTitle || (t.lang === 'fr' ? 'Statistiques détaillées' : 'Detailed Statistics')}
        </h2>
        <DashboardDetailedStats dictionary={t} />
      </div>

      {/* Section Projets */}
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          {/* Gestion des crédits */}
          <CreditsManagementTable dictionary={t.billing} />
        </div>
      </div>

      {/* Section Historique des messages */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {t.history?.table?.description || "Messages History"}
            </CardTitle>
            <CardDescription>
              Consultez l'historique de vos envois SMS récents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MessagesHistoryTable dictionary={t.history} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}