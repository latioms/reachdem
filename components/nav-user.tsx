"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  Languages,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/authContext";
import LanguageToggle from "@/components/ui/LanguageToggle";

export function NavUser() {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const { currentUser } = useAuth();

  // Extraire les initiales du nom pour l'avatar fallback
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.split(' ').map(part => part[0]).join('').toUpperCase().substring(0, 2);
  };

  // Si l'utilisateur n'est pas connecté ou les données ne sont pas encore chargées
  if (!currentUser) {
    return null; // Ou un état de chargement si préféré
  }

  // Construire l'objet user à partir des données réelles
  const user = {
    name: currentUser.email.split('@')[0], // Using email username as display name
    email: currentUser.email,
    avatar: '/user.png'
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">{getInitials(user.email)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
            <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
            >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">{getInitials(user.email)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
                {currentUser.countryName && (
                  <span className="truncate text-xs text-muted-foreground">{currentUser.countryName}</span>
                )}
              </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />            <DropdownMenuGroup>
              <DropdownMenuItem>
              <BadgeCheck />
              Account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/billing')}>
              <CreditCard />
              Billing
              </DropdownMenuItem>              
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <div className="flex items-center gap-2 w-full  py-1">
                  <Languages className="h-4 w-4" />
                  <span className="flex-1">Lang</span>
                  <LanguageToggle />
                </div>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={async () => {
              await fetch('/api/logout', { method: 'POST' });
              router.push('/login');
            }}>
              <LogOut />
              Déconnexion
            </DropdownMenuItem>

            </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
