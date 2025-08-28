import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
  role?: 'owner' | 'admin' | 'member' | 'viewer';
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  loading: boolean;
  switchWorkspace: (workspaceId: string) => void;
  createWorkspace: (name: string) => Promise<{ error: any; workspace?: Workspace }>;
  inviteMember: (email: string, role: 'admin' | 'member' | 'viewer') => Promise<{ error: any }>;
  refreshWorkspaces: () => Promise<void>;
}

export const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

interface WorkspaceProviderProps {
  children: ReactNode;
}

export const WorkspaceProvider = ({ children }: WorkspaceProviderProps) => {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWorkspaces = async () => {
    if (!user) {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data: workspaceMembers, error } = await supabase
        .from('workspace_members')
        .select(`
          workspace_id,
          role,
          workspaces:workspace_id (
            id,
            name,
            slug,
            plan,
            settings,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const workspacesWithRoles = workspaceMembers
        .filter(member => member.workspaces)
        .map(member => ({
          ...member.workspaces,
          role: member.role
        })) as Workspace[];

      setWorkspaces(workspacesWithRoles);

      // Set current workspace from localStorage or default to first
      const savedWorkspaceId = localStorage.getItem('currentWorkspaceId');
      const savedWorkspace = savedWorkspaceId 
        ? workspacesWithRoles.find(w => w.id === savedWorkspaceId)
        : workspacesWithRoles[0];

      setCurrentWorkspace(savedWorkspace || workspacesWithRoles[0] || null);
      
    } catch (error: any) {
      console.error('Error fetching workspaces:', error);
      toast({
        variant: "destructive",
        title: "Error loading workspaces",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [user]);

  const switchWorkspace = (workspaceId: string) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (workspace) {
      setCurrentWorkspace(workspace);
      localStorage.setItem('currentWorkspaceId', workspaceId);
      toast({
        title: "Workspace switched",
        description: `Now working in ${workspace.name}`,
      });
    }
  };

  const createWorkspace = async (name: string) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      // Generate slug from name
      const slug = name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
      
      const { data: workspace, error: createError } = await supabase
        .from('workspaces')
        .insert([{ name, slug }])
        .select()
        .single();

      if (createError) throw createError;

      // Add user as owner
      const { error: memberError } = await supabase
        .from('workspace_members')
        .insert([{
          workspace_id: workspace.id,
          user_id: user.id,
          role: 'owner'
        }]);

      if (memberError) throw memberError;

      // Refresh workspaces
      await fetchWorkspaces();

      toast({
        title: "Workspace created",
        description: `${name} has been created successfully`,
      });

      return { error: null, workspace: workspace as Workspace };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating workspace",
        description: error.message,
      });
      return { error };
    }
  };

  const inviteMember = async (email: string, role: 'admin' | 'member' | 'viewer') => {
    if (!currentWorkspace || !user) {
      return { error: new Error('No current workspace or user') };
    }

    try {
      // Generate invitation token
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      const { error } = await supabase
        .from('workspace_invitations')
        .insert([{
          workspace_id: currentWorkspace.id,
          invited_by: user.id,
          email,
          role,
          token,
          expires_at: expiresAt.toISOString()
        }]);

      if (error) throw error;

      toast({
        title: "Invitation sent",
        description: `Invitation sent to ${email}`,
      });

      return { error: null };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error sending invitation",
        description: error.message,
      });
      return { error };
    }
  };

  const refreshWorkspaces = async () => {
    await fetchWorkspaces();
  };

  const value: WorkspaceContextType = {
    workspaces,
    currentWorkspace,
    loading,
    switchWorkspace,
    createWorkspace,
    inviteMember,
    refreshWorkspaces,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};