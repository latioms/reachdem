import React from 'react'
import { getDictionary } from '../../dictionaries';
import { getLang } from '@/lib/lang';
import { ProjectClientPage } from '@/components/project/project-client-page';
import CreditsManagementTable from '@/components/billing/CreditsManagementTable';
import { MessagesHistoryTable } from '@/components/history/messages-history-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, FolderDot, CreditCard, TrendingUp } from 'lucide-react';

export default async function Page() {
  const lang = await getLang();
  const t = await getDictionary(lang);

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header du Dashboard */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de votre activité SMS et projets
        </p>
      </div>

      {/* Cartes de statistiques rapides */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.projects?.title || "Projets"}
            </CardTitle>
            <FolderDot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              projets actifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Messages envoyés
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              ce mois-ci
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Crédits SMS
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              crédits restants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taux de succès
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              des messages
            </p>
          </CardContent>
        </Card>
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