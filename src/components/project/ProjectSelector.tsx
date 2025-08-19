import React, { useState } from 'react';
import { Plus, ChevronDown, FolderOpen } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useProjects } from '@/hooks/useProjects';

export const ProjectSelector = () => {
  const { projects, currentProject, switchProject, createProject, loading } = useProjects();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    setIsCreating(true);
    const { error } = await createProject(newProjectName.trim(), newProjectDescription.trim() || undefined);
    
    if (!error) {
      setIsCreateDialogOpen(false);
      setNewProjectName('');
      setNewProjectDescription('');
    }
    setIsCreating(false);
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-muted/50 rounded-lg">
        <FolderOpen className="h-4 w-4" />
        <span className="text-sm text-muted-foreground">Loading projects...</span>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="justify-start">
            <Plus className="h-4 w-4 mr-2" />
            Create first project
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Enter project name..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="projectDescription">Description (optional)</Label>
              <Textarea
                id="projectDescription"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                placeholder="Describe your project..."
                className="mt-1"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim() || isCreating}
              >
                {isCreating ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="justify-between min-w-[200px]">
            <div className="flex items-center space-x-2">
              <FolderOpen className="h-4 w-4" />
              <span className="truncate">{currentProject.name}</span>
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[200px]">
          <DropdownMenuLabel>Switch Project</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {projects.map((project) => (
            <DropdownMenuItem
              key={project.id}
              onClick={() => switchProject(project.id)}
              className={currentProject.id === project.id ? "bg-accent" : ""}
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              <span className="truncate">{project.name}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Enter project name..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="projectDescription">Description (optional)</Label>
              <Textarea
                id="projectDescription"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                placeholder="Describe your project..."
                className="mt-1"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim() || isCreating}
              >
                {isCreating ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};