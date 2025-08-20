import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProjectInstructionsPanel } from './ProjectInstructionsPanel';
import { ProjectFilesPanel } from './ProjectFilesPanel';
import { ProjectUrlsPanel } from './ProjectUrlsPanel';
import { ProjectHistoryPanel } from './ProjectHistoryPanel';
import { cn } from '@/lib/utils';

interface ProjectSidebarProps {
  projectId: string;
  className?: string;
  onConversationSelect?: (conversation: any) => void;
}

export const ProjectSidebar: React.FC<ProjectSidebarProps> = ({ 
  projectId, 
  className = "",
  onConversationSelect
}) => {
  return (
    <div className={cn("w-80 border-l border-border bg-background/50", className)}>
      <ScrollArea className="h-full">
        <div className="p-4 space-y-6">
          <ProjectInstructionsPanel projectId={projectId} />
          <ProjectFilesPanel projectId={projectId} />
          <ProjectUrlsPanel projectId={projectId} />
          <ProjectHistoryPanel 
            projectId={projectId} 
            onConversationSelect={onConversationSelect}
          />
        </div>
      </ScrollArea>
    </div>
  );
};