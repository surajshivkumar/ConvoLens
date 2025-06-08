"use client";

import {
  BarChart3,
  MessageSquare,
  Mic,
  LayoutDashboard,
  Anchor,
  Bot,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navigation = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Conversations",
    url: "/conversations",
    icon: MessageSquare,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "chat",
    url: "/chat-assistant",
    icon: Bot,
  },
  {
    title: "Voice Assistant",
    url: "/voice-assistant",
    icon: Mic,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="sidebar-gradient border-r-0">
      <SidebarHeader className="border-b border-slate-700/50 p-6 glass-effect">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg marine-gradient glow-blue">
            <Anchor className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Yacht Analytics
            </h2>
            <p className="text-sm text-slate-400">Customer Service</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className="data-[active=true]:marine-gradient-subtle data-[active=true]:text-cyan-300 data-[active=true]:glow-cyan hover:bg-slate-800/50 hover:text-cyan-400 transition-all duration-300"
                  >
                    <Link href={item.url}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
