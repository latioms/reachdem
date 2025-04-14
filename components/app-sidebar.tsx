"use client";

import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { data, getSidebarData } from "@/components/sidebarData";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  dictionary?: any;
}

export function AppSidebar({ dictionary, ...props }: AppSidebarProps) {
  // Use internationalized data if dictionary is provided, otherwise fallback to the original data
  const sidebarData = dictionary ? getSidebarData(dictionary) : data;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher companyName="LFDP" />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarData.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser/>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
