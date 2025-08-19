import { BarChart3, Database, Code, BookOpen, Settings, LogOut, User } from "lucide-react";
import { useLocation, NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import WorkspaceSwitcher from "@/components/workspace/WorkspaceSwitcher";

const AppSidebar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const navigation = [
    { title: "Overview", url: "/dashboard", icon: BarChart3 },
    { title: "Data Analysis", url: "/dashboard/analysis", icon: Database },
    { title: "Code Generator", url: "/dashboard/generator", icon: Code },
    { title: "Knowledge Base", url: "/dashboard/knowledge", icon: BookOpen },
    { title: "Settings", url: "/dashboard/settings", icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 bg-black rounded flex items-center justify-center">
            <span className="text-white text-sm font-bold">CI</span>
          </div>
          <h2 className="font-bold text-lg">CRO Intelligence</h2>
        </div>
        <WorkspaceSwitcher />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className={isActive(item.url) ? "bg-accent text-accent-foreground" : ""}
                  >
                    <NavLink to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
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