"use client"

import { LucideIcon } from 'lucide-react'
import { cn } from "@/lib/utils"
import { trackNavigationEvent } from "@/lib/tracking"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    items: {
      title: string
      url: string
      icon: LucideIcon
      active: boolean
    }[]
  }[]
}) {
  return (
    <>
      {items.map((group) => (
        <SidebarGroup key={group.title}>
          <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
          <SidebarMenu>            {group.items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  tooltip={item.title}
                  disabled={!item.active}
                >
                  <a 
                    href={item.url}
                    className={cn(
                      !item.active && "pointer-events-none opacity-50"
                    )}
                    onClick={() => {
                      if (item.active) {
                        trackNavigationEvent.sidebarClick(item.title)
                      }
                    }}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  )
}

