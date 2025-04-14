import {
  Home,
  ShoppingCart,
  FolderTree,
  Users,
  Package,
  Megaphone,
  BarChart2,
  ClipboardList,
  FileText,
  Factory,
} from "lucide-react";

export const getSidebarData = (dictionary: any) => {
  return {

    navMain: [
      {
        title: dictionary.sidebar.dashboard.title,
        items: [
          { 
            title: dictionary.sidebar.dashboard.items.home, 
            url: "/home", 
            icon: Home 
          },
          { 
            title: dictionary.sidebar.dashboard.items.orders, 
            url: "/orders", 
            icon: ShoppingCart 
          },
          { 
            title: dictionary.sidebar.dashboard.items.categories, 
            url: "/categories", 
            icon: FolderTree 
          },
        ],
      },
    ],
  };
};

// Keep the original data for backwards compatibility during transition
export const data = {
  user: {
    name: "Admin",
    email: "admin@lfp.com",
    avatar: "/avatars/admin.jpg",
  },
  navMain: [
    {
      title: "Tableau de bord",
      items: [
        { title: "Accueil", url: "/home", icon: Home },
        { title: "Commandes", url: "/orders", icon: ShoppingCart },
        { title: "Catégories", url: "/categories", icon: FolderTree },
      ],
    },
  ],
};
