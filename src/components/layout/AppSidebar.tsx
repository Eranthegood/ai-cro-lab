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
  User,
  Map,
  FileText
} from "lucide-react";
import { useLocation, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import WorkspaceSwitcher from "@/components/workspace/WorkspaceSwitcher";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/context/NotificationContext";

const AppSidebar = () => {
  const location = useLocation();
  const { hasDataFreshnessWarning, hasKnowledgeScoreWarning } = useNotifications();
  const { open } = useSidebar();
  
  // Check if current route is in Knowledge Vault submenu
  const isKnowledgeRoute = (path: string) => {
    return path.startsWith('/dashboard/knowledge');
  };
  
  const [knowledgeExpanded, setKnowledgeExpanded] = useState(() => 
    isKnowledgeRoute(location.pathname)
  );

  // Update expansion when route changes
  useEffect(() => {
    if (isKnowledgeRoute(location.pathname)) {
      setKnowledgeExpanded(true);
    }
  }, [location.pathname]);

  const menuItems = [
    { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
    { 
      title: "Knowledge Vault", 
      url: "/dashboard/knowledge", 
      icon: BookOpen,
      submenu: [
        { title: "Overview", url: "/dashboard/knowledge", icon: FileText },
        { title: "Journey Mapper", url: "/dashboard/knowledge/journey-mapper", icon: Map }
      ]
    },
    { title: "A/B Testing", url: "/dashboard/testing", icon: TestTube },
    { title: "Code Generator", url: "/dashboard/generator", icon: Code },
    { title: "AI Insights", url: "/dashboard/insights", icon: Brain },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isParentActive = (item: any) => {
    if (item.submenu) {
      return item.submenu.some((sub: any) => isActive(sub.url));
    }
    return false;
  };

  return (
    <Sidebar className="bg-background border-r border-border" collapsible="icon">
      <SidebarHeader className="p-4 border-b border-border">
        {open && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 bg-foreground rounded flex items-center justify-center">
                <span className="text-background text-sm font-bold">CI</span>
              </div>
              <h2 className="font-medium text-foreground">CRO Intelligence</h2>
            </div>
            <WorkspaceSwitcher />
          </>
        )}
        {!open && (
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 bg-foreground rounded flex items-center justify-center">
              <span className="text-background text-sm font-bold">CI</span>
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="p-0">
        <SidebarGroup className="px-0 py-2">
          <SidebarGroupContent className="px-0">
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.submenu ? (
                    <>
                      <SidebarMenuButton 
                        className={cn(
                          open ? "mx-4 px-3 py-2 rounded-sm" : "mx-2 px-2 py-2 rounded-sm justify-center",
                          (isActive(item.url) || isParentActive(item)) ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                        onClick={() => setKnowledgeExpanded(!knowledgeExpanded)}
                        tooltip={!open ? item.title : undefined}
                      >
                        <div className={cn("flex items-center", open ? "gap-3" : "justify-center")}>
                          <div className="relative">
                            <item.icon className="h-4 w-4" />
                            {item.title === "Knowledge Vault" && hasKnowledgeScoreWarning && (
                              <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500"></div>
                            )}
                          </div>
                          {open && (
                            <>
                              <span className="text-sm flex-1">{item.title}</span>
                              <ChevronDown className={cn("h-4 w-4 transition-transform", knowledgeExpanded && "rotate-180")} />
                            </>
                          )}
                        </div>
                      </SidebarMenuButton>
                      {knowledgeExpanded && open && (
                        <div className="ml-4 space-y-1">
                          {item.submenu.map((subItem) => (
                            <SidebarMenuButton
                              key={subItem.title}
                              asChild
                              className={cn(
                                "mx-4 px-3 py-1.5 rounded-sm text-xs",
                                isActive(subItem.url) ? "bg-accent text-accent-foreground border-l-2 border-accent-foreground" : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              <NavLink to={subItem.url} className="flex items-center gap-2">
                                <subItem.icon className="h-3 w-3" />
                                <span>{subItem.title}</span>
                              </NavLink>
                            </SidebarMenuButton>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <SidebarMenuButton 
                      asChild 
                      className={cn(
                        open ? "mx-4 px-3 py-2 rounded-sm" : "mx-2 px-2 py-2 rounded-sm justify-center",
                        isActive(item.url) ? "bg-accent text-accent-foreground border-b border-accent-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                      tooltip={!open ? item.title : undefined}
                    >
                      <NavLink to={item.url} className={cn("flex items-center", open ? "gap-3" : "justify-center")}>
                          <div className="relative">
                            <item.icon className="h-4 w-4" />
                            {item.title === "Dashboard" && hasDataFreshnessWarning && (
                              <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500"></div>
                            )}
                          </div>
                          {open && <span className="text-sm">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  )}
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