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
