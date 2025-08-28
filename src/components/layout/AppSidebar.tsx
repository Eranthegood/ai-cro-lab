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
  FileText,
  Home
} from "lucide-react";
import { AnthropicIcon } from "@/assets/AnthropicIcon";
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
import { RateLimitProgress } from "@/components/knowledge-vault/RateLimitProgress";

const AppSidebar = () => {
  const location = useLocation();
  const { hasDataFreshnessWarning, hasKnowledgeScoreWarning, backgroundTasks } = useNotifications();
  const { open } = useSidebar();
  
  const hasActiveVaultTasks = backgroundTasks.some(task => 
    task.status === 'processing' && task.type === 'vault-analysis'
  );
  
  // Check if current route is in Knowledge Vault submenu
  const isKnowledgeRoute = (path: string) => {
    return path.startsWith('/vault-') || path === '/knowledge-base' || path === '/journey-mapper';
  };
  
  // Check if current route is in A/B Testing submenu
  const isABTestingRoute = (path: string) => {
    return path.startsWith('/dashboard/ab-testing') || path === '/ab-test-generator';
  };
  
  const [knowledgeExpanded, setKnowledgeExpanded] = useState(() => 
    isKnowledgeRoute(location.pathname)
  );
  
  const [abTestingExpanded, setAbTestingExpanded] = useState(() => 
    isABTestingRoute(location.pathname)
  );

  // Update expansion when route changes
  useEffect(() => {
    if (isKnowledgeRoute(location.pathname)) {
      setKnowledgeExpanded(true);
    }
    if (isABTestingRoute(location.pathname)) {
      setAbTestingExpanded(true);
    }
  }, [location.pathname]);

  const menuItems = [
    { title: "Home", url: "/", icon: Home },
    { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
    { 
      title: "Knowledge Vault", 
      url: "/dashboard/knowledge", 
      icon: BookOpen,
      submenu: [
        { title: "Ask your vault", url: "/vault-simple", icon: Brain },
        { title: "Overview", url: "/knowledge-base", icon: FileText },
        { title: "Configuration", url: "/vault-config", icon: Settings },
        { title: "Journey Mapper", url: "/journey-mapper", icon: Map }
      ]
    },
    { 
      title: "A/B Testing", 
      url: "/dashboard/ab-testing", 
      icon: TestTube,
      submenu: [
        { title: "Generator", url: "/ab-test-generator", icon: Target },
        { title: "Analytics", url: "/dashboard/ab-testing", icon: BarChart3 }
      ]
    },
    { title: "Code Generator", url: "/dashboard/generator", icon: Code },
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
            <div className="mt-3">
              <RateLimitProgress />
            </div>
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
                        onClick={() => {
                          if (item.title === "Knowledge Vault") {
                            setKnowledgeExpanded(!knowledgeExpanded);
                          } else if (item.title === "A/B Testing") {
                            setAbTestingExpanded(!abTestingExpanded);
                          }
                        }}
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
                               <span className="text-sm flex-1 flex items-center gap-2">
                                 {item.title}
                                 {item.title === "Knowledge Vault" && hasActiveVaultTasks && (
                                   <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                                 )}
                               </span>
                                <ChevronDown className={cn(
                                  "h-4 w-4 transition-transform", 
                                  ((item.title === "Knowledge Vault" && knowledgeExpanded) || 
                                   (item.title === "A/B Testing" && abTestingExpanded)) && "rotate-180"
                                )} />
                             </>
                           )}
                        </div>
                      </SidebarMenuButton>
                      {((item.title === "Knowledge Vault" && knowledgeExpanded) || 
                        (item.title === "A/B Testing" && abTestingExpanded)) && open && (
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
                                 {subItem.title === "Journey Mapper" && (
                                   <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-4">
                                     Alpha
                                   </Badge>
                                 )}
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