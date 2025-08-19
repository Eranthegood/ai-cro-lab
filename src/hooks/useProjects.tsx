import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useWorkspace } from './useWorkspace';
import { toast } from '@/hooks/use-toast';

interface Project {
  id: string;
  workspace_id: string;
  name: string;
  description?: string;
  settings: any;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface ProjectConversation {
  id: string;
  project_id: string;
  title?: string;
  messages: any;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface SavedResponse {
  id: string;
  project_id: string;
  workspace_id: string;
  name: string;
  content: string;
  message_context: any;
  created_by: string;
  created_at: string;
}

interface ProjectsContextType {
  projects: Project[];
  currentProject: Project | null;
  conversations: ProjectConversation[];
  savedResponses: SavedResponse[];
  loading: boolean;
  switchProject: (projectId: string) => void;
  createProject: (name: string, description?: string) => Promise<{ error: any; project?: Project }>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<{ error: any }>;
  deleteProject: (projectId: string) => Promise<{ error: any }>;
  createConversation: (projectId: string, title?: string) => Promise<{ error: any; conversation?: ProjectConversation }>;
  updateConversation: (conversationId: string, messages: any[]) => Promise<{ error: any }>;
  saveResponseToVault: (projectId: string, name: string, content: string, context?: any) => Promise<{ error: any }>;
  refreshProjects: () => Promise<void>;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export const useProjects = () => {
  const context = useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }
  return context;
};

interface ProjectsProviderProps {
  children: ReactNode;
}

export const ProjectsProvider = ({ children }: ProjectsProviderProps) => {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [conversations, setConversations] = useState<ProjectConversation[]>([]);
  const [savedResponses, setSavedResponses] = useState<SavedResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    if (!user || !currentWorkspace) {
      setProjects([]);
      setCurrentProject(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data: projectsData, error } = await supabase
        .from('projects')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setProjects(projectsData || []);

      // Set current project from localStorage or default to first
      const savedProjectId = localStorage.getItem(`currentProjectId_${currentWorkspace.id}`);
      const savedProject = savedProjectId 
        ? projectsData?.find(p => p.id === savedProjectId)
        : projectsData?.[0];

      setCurrentProject(savedProject || projectsData?.[0] || null);
      
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      toast({
        variant: "destructive",
        title: "Error loading projects",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('project_conversations')
        .select('*')
        .eq('project_id', projectId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations((data || []).map(conv => ({
        ...conv,
        messages: Array.isArray(conv.messages) ? conv.messages : []
      })));
    } catch (error: any) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchSavedResponses = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('vault_saved_responses')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedResponses(data || []);
    } catch (error: any) {
      console.error('Error fetching saved responses:', error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user, currentWorkspace]);

  useEffect(() => {
    if (currentProject) {
      fetchConversations(currentProject.id);
      fetchSavedResponses(currentProject.id);
    }
  }, [currentProject]);

  const switchProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project && currentWorkspace) {
      setCurrentProject(project);
      localStorage.setItem(`currentProjectId_${currentWorkspace.id}`, projectId);
      toast({
        title: "Project switched",
        description: `Now working in ${project.name}`,
      });
    }
  };

  const createProject = async (name: string, description?: string) => {
    if (!user || !currentWorkspace) return { error: new Error('User not authenticated') };

    try {
      const { data: project, error: createError } = await supabase
        .from('projects')
        .insert([{ 
          workspace_id: currentWorkspace.id,
          name, 
          description,
          created_by: user.id
        }])
        .select()
        .single();

      if (createError) throw createError;

      await fetchProjects();

      toast({
        title: "Project created",
        description: `${name} has been created successfully`,
      });

      return { error: null, project: project as Project };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating project",
        description: error.message,
      });
      return { error };
    }
  };

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId);

      if (error) throw error;

      await fetchProjects();

      toast({
        title: "Project updated",
        description: "Project has been updated successfully",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating project",
        description: error.message,
      });
      return { error };
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      await fetchProjects();

      toast({
        title: "Project deleted",
        description: "Project has been deleted successfully",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting project",
        description: error.message,
      });
      return { error };
    }
  };

  const createConversation = async (projectId: string, title?: string) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      const { data: conversation, error } = await supabase
        .from('project_conversations')
        .insert([{
          project_id: projectId,
          title,
          messages: [],
          created_by: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      await fetchConversations(projectId);

      return { error: null, conversation: conversation as ProjectConversation };
    } catch (error: any) {
      return { error };
    }
  };

  const updateConversation = async (conversationId: string, messages: any[]) => {
    try {
      const { error } = await supabase
        .from('project_conversations')
        .update({ messages })
        .eq('id', conversationId);

      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const saveResponseToVault = async (projectId: string, name: string, content: string, context?: any) => {
    if (!user || !currentWorkspace) return { error: new Error('User not authenticated') };

    try {
      const { error } = await supabase
        .from('vault_saved_responses')
        .insert([{
          project_id: projectId,
          workspace_id: currentWorkspace.id,
          name,
          content,
          message_context: context || {},
          created_by: user.id
        }]);

      if (error) throw error;

      await fetchSavedResponses(projectId);

      toast({
        title: "Saved to Vault",
        description: `Response saved as "${name}"`,
      });

      return { error: null };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error saving to vault",
        description: error.message,
      });
      return { error };
    }
  };

  const refreshProjects = async () => {
    await fetchProjects();
  };

  const value: ProjectsContextType = {
    projects,
    currentProject,
    conversations,
    savedResponses,
    loading,
    switchProject,
    createProject,
    updateProject,
    deleteProject,
    createConversation,
    updateConversation,
    saveResponseToVault,
    refreshProjects,
  };

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
};