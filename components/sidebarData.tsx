import {
  Home,
  MessageSquare,
  History,
  FolderDot,
  CreditCard,
  HelpCircle,
  Info,
  Settings,
  Users
} from "lucide-react";

interface DictionaryType {
  sidebar: {
    dashboard: {
      title: string;
      items: {
        home: string;
        contacts: string;
        groups: string;
      };
    };
    SMS: {
      title: string;
      items: {
        campaigns: string;
        history: string;
        projects: string;
        billing: string;
      };
    };
    platform: {
      title: string;
      items: {
        help: string;
        about: string;
        settings: string;
      };
    };
  };
}

export const getSidebarData = (dictionary: DictionaryType) => {
  return {
    navMain: [      {
        title: dictionary.sidebar.dashboard.title,
        items: [
          { 
            title: dictionary.sidebar.dashboard.items.home, 
            url: "/dashboard", 
            icon: Home,
            active: true
          },
          { 
            title: dictionary.sidebar.dashboard.items.contacts || "Contacts", 
            url: "/contacts", 
            icon: Users,
            active: true
          },
          {
            title: dictionary.sidebar.dashboard.items.groups || "Groups",
            url: "/groups",
            icon: Users,
            active: true
          }
        ],
      },
      {
        title: dictionary.sidebar.SMS.title,
        items: [
          {
            title: dictionary.sidebar.SMS.items.campaigns,
            url: "/campaigns",
            icon: MessageSquare,
            active: true
          },
          {
            title: dictionary.sidebar.SMS.items.history,
            url: "/history",
            icon: History,
            active: true
          },
          {
            title: dictionary.sidebar.SMS.items.projects,
            url: "/projects",
            icon: FolderDot,
            active: true
          },
          {
            title: dictionary.sidebar.SMS.items.billing,
            url: "/billing",
            icon: CreditCard,
            active: true
          }
        ]
      },
      {
        title: dictionary.sidebar.platform.title,
        items: [
          {
            title: dictionary.sidebar.platform.items.help,
            url: "/help",
            icon: HelpCircle,
            active: true
          },
          {
            title: dictionary.sidebar.platform.items.about,
            url: "/about",
            icon: Info,
            active: true
          },
          // {
          //   title: dictionary.sidebar.platform.items.settings,
          //   url: "/settings",
          //   icon: Settings,
          //   active: true
          // }
        ]
      }
    ],
  };
};

// Keep the original data for backwards compatibility during transition
export const data = {
  navMain: [    {
      title: "Tableau de bord",
      items: [
        { title: "Accueil", url: "/dashboard", icon: Home, active: true },
        { title: "Contacts", url: "/contacts", icon: Users, active: true },
        { title: "Groupes", url: "/groups", icon: Users, active: true }
      ],
    },
    {
      title: "SMS",
      items: [
        { title: "Campagnes", url: "/campaigns", icon: MessageSquare, active: true },
        { title: "Historiques", url: "/history", icon: History, active: true },
        { title: "Projets", url: "/projects", icon: FolderDot, active: true },
        { title: "Facturation", url: "/billing", icon: CreditCard, active: true }
      ],
    },
    {
      title: "Plateforme",
      items: [
        { title: "Aide", url: "/help", icon: HelpCircle, active: true },
        { title: "A propos", url: "/about", icon: Info, active: true },
        { title: "Paramètres", url: "/settings", icon: Settings, active: true }
      ],
    }
  ],
};
