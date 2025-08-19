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
  const [configureOpen, setConfigureOpen] = useState(true);
  const [observeOpen, setObserveOpen] = useState(true);
  const [enhanceOpen, setEnhanceOpen] = useState(true);

  const sections = [
    {
      title: "CONFIGURE",
      icon: Settings,
      isOpen: configureOpen,
      setOpen: setConfigureOpen,
      items: [
        { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
        { title: "Knowledge Base", url: "/dashboard/knowledge", icon: BookOpen },
      ]
    },
    {
      title: "OBSERVE", 
      icon: BarChart3,
      isOpen: observeOpen,
      setOpen: setObserveOpen,
      items: [
        { title: "A/B Testing", url: "/dashboard/testing", icon: TestTube },
      ]
    },
    {
      title: "ENHANCE",
      icon: TrendingUp, 
      isOpen: enhanceOpen,
      setOpen: setEnhanceOpen,
      items: [
        { title: "Code Generator", url: "/dashboard/generator", icon: Code },
        { title: "AI Insights", url: "/dashboard/insights", icon: Brain },
      ]
    }
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
        {sections.map((section) => (
          <SidebarGroup key={section.title} className="px-0 py-2">
            <SidebarGroupLabel className="px-4 py-2">
              <Button 
                variant="ghost" 
                size="sm"
                className="w-full justify-between p-2 h-auto font-medium text-xs text-muted-foreground hover:text-foreground"
                onClick={() => section.setOpen(!section.isOpen)}
              >
                <div className="flex items-center gap-2">
                  <section.icon className="h-3 w-3" />
                  {section.title}
                </div>
                <ChevronDown className={cn(
                  "h-3 w-3 transition-transform",
                  !section.isOpen && "-rotate-90"
                )} />
              </Button>
            </SidebarGroupLabel>
            
            {section.isOpen && (
              <SidebarGroupContent className="px-0">
                <SidebarMenu>
                  {section.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={cn(
                          "mx-4 px-3 py-2 rounded-sm",
                          isActive(item.url) ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
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
            )}
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;