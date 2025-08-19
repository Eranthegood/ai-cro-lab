import { 
  Settings, 
  TrendingUp, 
  BarChart3, 
  Database,
  Brain,
  Code,
  Zap,
  Target,
  TestTube,
  BookOpen,
  ChevronDown,
  User
} from "lucide-react";
import { useLocation, NavLink } from "react-router-dom";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import WorkspaceSwitcher from "@/components/workspace/WorkspaceSwitcher";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/useNotifications";

const AppSidebar = () => {
  const location = useLocation();
  const { hasDataFreshnessWarning, hasKnowledgeScoreWarning } = useNotifications();

  const menuItems = [
    { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
    { title: "Knowledge Base", url: "/dashboard/knowledge", icon: BookOpen },
    { title: "A/B Testing", url: "/dashboard/testing", icon: TestTube },
    { title: "Code Generator", url: "/dashboard/generator", icon: Code },
    { title: "AI Insights", url: "/dashboard/insights", icon: Brain },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className="bg-background border-r border-border">
      <SidebarHeader className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 bg-foreground rounded flex items-center justify-center">
            <span className="text-background text-sm font-bold">CI</span>
          </div>
          <h2 className="font-medium text-foreground">CRO Intelligence</h2>
        </div>
        <WorkspaceSwitcher />
      </SidebarHeader>

      <SidebarContent className="p-0">
        <SidebarGroup className="px-0 py-2">
          <SidebarGroupContent className="px-0">
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className={cn(
                      "mx-4 px-3 py-2 rounded-sm",
                      isActive(item.url) ? "bg-accent text-accent-foreground border-b border-accent-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <NavLink to={item.url} className="flex items-center gap-3">
                        <div className="relative">
                          <item.icon className="h-4 w-4" />
                          {/* Warning dots for specific menu items */}
                          {(item.title === "Dashboard" && hasDataFreshnessWarning) || 
                           (item.title === "Knowledge Base" && hasKnowledgeScoreWarning) ? (
                            <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500"></div>
                          ) : null}
                        </div>
                        <span className="text-sm">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;