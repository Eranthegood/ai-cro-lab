import { 
  Settings, 
  TrendingUp, 
  BarChart3, 
  LogOut, 
  User,
  Database,
  Brain,
  FileText,
  Code,
  Zap,
  Target,
  TestTube,
  BookOpen,
  ChevronDown
} from "lucide-react";
import { useLocation, NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
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
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import WorkspaceSwitcher from "@/components/workspace/WorkspaceSwitcher";
import { cn } from "@/lib/utils";

const AppSidebar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
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
        { title: "Data Sources", url: "/dashboard/analysis", icon: Database },
        { title: "Knowledge Base", url: "/dashboard/knowledge", icon: BookOpen },
        { title: "Settings", url: "/dashboard/settings", icon: Settings },
      ]
    },
    {
      title: "OBSERVE", 
      icon: BarChart3,
      isOpen: observeOpen,
      setOpen: setObserveOpen,
      items: [
        { title: "Analytics", url: "/dashboard/analytics", icon: TrendingUp },
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
        { title: "Optimization", url: "/dashboard/optimization", icon: Zap, badge: "New" },
        { title: "Targeting", url: "/dashboard/targeting", icon: Target },
        { title: "Personalization", url: "/dashboard/personalization", icon: User },
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
                        <NavLink to={item.url} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <item.icon className="h-4 w-4" />
                            <span className="text-sm">{item.title}</span>
                          </div>
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                              {item.badge}
                            </Badge>
                          )}
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

      <SidebarFooter className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;