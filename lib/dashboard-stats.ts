/**
 * Utilitaires pour calculer les statistiques rapides du dashboard
 * Ces fonctions permettent d'obtenir des métriques clés pour l'affichage du dashboard
 */

import { getProjects } from '@/app/actions/project/getProjects';
import { getProjectsByUserId } from '@/app/actions/project/getProjectsByUserId';
import { getMessagesByUserId } from '@/app/actions/messages/getMessagesByUserId';
import { getTransactions } from '@/app/actions/transactions/getTransaction';

/**
 * Interface pour les statistiques du dashboard
 */
export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalSmsCredits: number;
  messagesSentThisMonth: number;
  totalMessagesSent: number;
  successRate: number;
  pendingMessages: number;
  failedMessages: number;
  totalSpent: number;
  spentThisMonth: number;
  lastTransactionDate: string | null;
  mostUsedProject: string | null;
}

/**
 * Interface pour les statistiques détaillées des messages
 */
export interface MessageStats {
  total: number;
  thisMonth: number;
  today: number;
  thisWeek: number;
  byStatus: {
    SUCCESS: number;
    PENDING: number;
    FAILED: number;
  };
  byProject: Array<{
    projectId: string;
    projectName: string;
    messageCount: number;
  }>;
  averagePerDay: number;
  successRate: number;
}

/**
 * Interface pour les statistiques des projets
 */
export interface ProjectStats {
  total: number;
  active: number;
  disabled: number;
  pending: number;
  totalCredits: number;
  averageCreditsPerProject: number;
  projectsWithCredits: number;
  projectsWithoutCredits: number;
}

/**
 * Interface pour les statistiques financières
 */
export interface FinancialStats {
  totalSpent: number;
  spentThisMonth: number;
  spentThisYear: number;
  averageTransactionAmount: number;
  totalTransactions: number;
  pendingTransactions: number;
  completedTransactions: number;
  failedTransactions: number;
  lastTransactionDate: string | null;
  monthlySpending: Array<{
    month: string;
    amount: number;
  }>;
}

/**
 * Obtient les statistiques complètes du dashboard pour un utilisateur
 */
export async function getDashboardStats(userId: string): Promise<DashboardStats | null> {
  try {
    const [projectsResult, messagesResult, transactionsResult] = await Promise.all([
      getProjectsByUserId(userId),
      getMessagesByUserId(userId),
      getTransactions()
    ]);

    if (projectsResult.error || messagesResult.error || transactionsResult.error) {
      console.error('Erreur lors de la récupération des données:', {
        projects: projectsResult.error,
        messages: messagesResult.error,
        transactions: transactionsResult.error
      });
      return null;
    }

    const projects = projectsResult.projects || [];
    const messages = messagesResult.messages || [];
    const transactions = transactionsResult.transactions || [];

    // Calculs des projets
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.active === 'enabled').length;
    const totalSmsCredits = projects.reduce((sum, p) => sum + (p.sms_credits || 0), 0);

    // Calculs des messages
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const messagesSentThisMonth = messages.filter(m => {
      const messageDate = new Date(m.$createdAt);
      return messageDate.getMonth() === currentMonth && messageDate.getFullYear() === currentYear;
    }).length;

    const totalMessagesSent = messages.length;
    const successfulMessages = messages.filter(m => m.status === 'SUCCESS').length;
    const pendingMessages = messages.filter(m => m.status === 'PENDING').length;
    const failedMessages = messages.filter(m => m.status === 'FAILED').length;

    const successRate = totalMessagesSent > 0 ? (successfulMessages / totalMessagesSent) * 100 : 0;

    // Calculs financiers
    const completedTransactions = transactions.filter(t => t.status === 'completed');
    const totalSpent = completedTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

    const spentThisMonth = completedTransactions
      .filter(t => {
        const transactionDate = new Date(t.$createdAt);
        return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    // Projet le plus utilisé
    const projectMessageCounts = new Map();
    messages.forEach(m => {
      const count = projectMessageCounts.get(m.project_id) || 0;
      projectMessageCounts.set(m.project_id, count + 1);
    });

    let mostUsedProject = null;
    let maxCount = 0;
    for (const [projectId, count] of projectMessageCounts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        const project = projects.find(p => p.id === projectId);
        mostUsedProject = project ? project.sender_name : projectId;
      }
    }

    // Dernière transaction
    const lastTransaction = transactions
      .sort((a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime())[0];
    const lastTransactionDate = lastTransaction ? lastTransaction.$createdAt : null;

    return {
      totalProjects,
      activeProjects,
      totalSmsCredits,
      messagesSentThisMonth,
      totalMessagesSent,
      successRate,
      pendingMessages,
      failedMessages,
      totalSpent,
      spentThisMonth,
      lastTransactionDate,
      mostUsedProject
    };

  } catch (error) {
    console.error('Erreur lors du calcul des statistiques du dashboard:', error);
    return null;
  }
}

/**
 * Obtient les statistiques détaillées des messages
 */
export async function getMessageStats(userId: string): Promise<MessageStats | null> {
  try {
    const messagesResult = await getMessagesByUserId(userId);
    const projectsResult = await getProjectsByUserId(userId);

    if (messagesResult.error || projectsResult.error) {
      console.error('Erreur lors de la récupération des données de messages');
      return null;
    }

    const messages = messagesResult.messages || [];
    const projects = projectsResult.projects || [];

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const today = new Date().toDateString();

    // Calculer la date d'il y a une semaine
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const total = messages.length;
    
    const thisMonth = messages.filter(m => {
      const messageDate = new Date(m.$createdAt);
      return messageDate.getMonth() === currentMonth && messageDate.getFullYear() === currentYear;
    }).length;

    const todayCount = messages.filter(m => {
      const messageDate = new Date(m.$createdAt);
      return messageDate.toDateString() === today;
    }).length;

    const thisWeek = messages.filter(m => {
      const messageDate = new Date(m.$createdAt);
      return messageDate >= weekAgo;
    }).length;

    const byStatus = {
      SUCCESS: messages.filter(m => m.status === 'SUCCESS').length,
      PENDING: messages.filter(m => m.status === 'PENDING').length,
      FAILED: messages.filter(m => m.status === 'FAILED').length
    };

    // Messages par projet
    const projectMessageCounts = new Map();
    messages.forEach(m => {
      const count = projectMessageCounts.get(m.project_id) || 0;
      projectMessageCounts.set(m.project_id, count + 1);
    });

    const byProject = Array.from(projectMessageCounts.entries()).map(([projectId, count]) => {
      const project = projects.find(p => p.id === projectId);
      return {
        projectId,
        projectName: project ? project.sender_name : 'Projet inconnu',
        messageCount: count
      };
    });

    // Moyenne par jour (sur les 30 derniers jours)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const messagesLast30Days = messages.filter(m => {
      const messageDate = new Date(m.$createdAt);
      return messageDate >= thirtyDaysAgo;
    }).length;
    const averagePerDay = messagesLast30Days / 30;

    const successRate = total > 0 ? (byStatus.SUCCESS / total) * 100 : 0;

    return {
      total,
      thisMonth,
      today: todayCount,
      thisWeek,
      byStatus,
      byProject,
      averagePerDay,
      successRate
    };

  } catch (error) {
    console.error('Erreur lors du calcul des statistiques de messages:', error);
    return null;
  }
}

/**
 * Obtient les statistiques des projets
 */
export async function getProjectStats(userId: string): Promise<ProjectStats | null> {
  try {
    const projectsResult = await getProjectsByUserId(userId);

    if (projectsResult.error) {
      console.error('Erreur lors de la récupération des projets');
      return null;
    }

    const projects = projectsResult.projects || [];

    const total = projects.length;
    const active = projects.filter(p => p.active === 'enabled').length;
    const disabled = projects.filter(p => p.active === 'disabled').length;
    const pending = projects.filter(p => p.active === 'pending').length;

    const totalCredits = projects.reduce((sum, p) => sum + (p.sms_credits || 0), 0);
    const averageCreditsPerProject = total > 0 ? totalCredits / total : 0;

    const projectsWithCredits = projects.filter(p => (p.sms_credits || 0) > 0).length;
    const projectsWithoutCredits = projects.filter(p => (p.sms_credits || 0) === 0).length;

    return {
      total,
      active,
      disabled,
      pending,
      totalCredits,
      averageCreditsPerProject,
      projectsWithCredits,
      projectsWithoutCredits
    };

  } catch (error) {
    console.error('Erreur lors du calcul des statistiques de projets:', error);
    return null;
  }
}

/**
 * Obtient les statistiques financières
 */
export async function getFinancialStats(userId?: string): Promise<FinancialStats | null> {
  try {
    const transactionsResult = await getTransactions();

    if (transactionsResult.error) {
      console.error('Erreur lors de la récupération des transactions');
      return null;
    }

    const transactions = transactionsResult.transactions || [];

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const completedTransactions = transactions.filter(t => t.status === 'completed');
    const pendingTransactions = transactions.filter(t => t.status === 'pending').length;
    const failedTransactions = transactions.filter(t => t.status === 'failed').length;

    const totalSpent = completedTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

    const spentThisMonth = completedTransactions
      .filter(t => {
        const transactionDate = new Date(t.$createdAt);
        return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const spentThisYear = completedTransactions
      .filter(t => {
        const transactionDate = new Date(t.$createdAt);
        return transactionDate.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const averageTransactionAmount = completedTransactions.length > 0 
      ? totalSpent / completedTransactions.length 
      : 0;

    const totalTransactions = transactions.length;

    // Dernière transaction
    const lastTransaction = transactions
      .sort((a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime())[0];
    const lastTransactionDate = lastTransaction ? lastTransaction.$createdAt : null;

    // Dépenses mensuelles (12 derniers mois)
    const monthlySpending = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
      
      const amount = completedTransactions
        .filter(t => {
          const transactionDate = new Date(t.$createdAt);
          return transactionDate.getMonth() === date.getMonth() && 
                 transactionDate.getFullYear() === date.getFullYear();
        })
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      monthlySpending.push({ month, amount });
    }

    return {
      totalSpent,
      spentThisMonth,
      spentThisYear,
      averageTransactionAmount,
      totalTransactions,
      pendingTransactions,
      completedTransactions: completedTransactions.length,
      failedTransactions,
      lastTransactionDate,
      monthlySpending
    };

  } catch (error) {
    console.error('Erreur lors du calcul des statistiques financières:', error);
    return null;
  }
}

/**
 * Fonction utilitaire pour formater les pourcentages
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Fonction utilitaire pour formater les montants selon la locale
 */
export function formatAmount(amount: number, locale: string = 'fr'): string {
  const localeMap = {
    'fr': 'fr-FR',
    'en': 'en-US'
  };
  
  return new Intl.NumberFormat(localeMap[locale as keyof typeof localeMap] || 'fr-FR', {
    style: 'currency',
    currency: 'XAF',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Fonction utilitaire pour formater les dates relatives selon la locale
 */
export function formatRelativeDate(dateString: string, locale: string = 'fr'): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (locale === 'en') {
      if (diffInDays === 0) return 'Today';
      if (diffInDays === 1) return 'Yesterday';
      if (diffInDays < 7) return `${diffInDays} days ago`;
      if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
      if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
      return `${Math.floor(diffInDays / 365)} years ago`;
    } else {
      if (diffInDays === 0) return 'Aujourd\'hui';
      if (diffInDays === 1) return 'Hier';
      if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
      if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaines`;
      if (diffInDays < 365) return `Il y a ${Math.floor(diffInDays / 30)} mois`;
      return `Il y a ${Math.floor(diffInDays / 365)} ans`;
    }
  } catch (error) {
    console.error('Erreur lors du formatage de la date:', error);
    return dateString;
  }
}

/**
 * Fonction pour obtenir un résumé rapide en une seule fois
 */
export async function getQuickStats(userId: string) {
  try {
    const [dashboardStats, messageStats, projectStats, financialStats] = await Promise.all([
      getDashboardStats(userId),
      getMessageStats(userId),
      getProjectStats(userId),
      getFinancialStats(userId)
    ]);

    return {
      dashboard: dashboardStats,
      messages: messageStats,
      projects: projectStats,
      financial: financialStats,
      summary: {
        hasData: !!(dashboardStats && messageStats && projectStats && financialStats),
        lastUpdated: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques rapides:', error);
    return null;
  }
}
