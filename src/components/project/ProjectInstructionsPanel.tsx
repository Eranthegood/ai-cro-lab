import React, { useState, useEffect } from 'react';
import { Plus, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useProjects } from '@/hooks/useProjects';

interface ProjectInstructionsPanelProps {
  projectId: string;
  className?: string;
}

export const ProjectInstructionsPanel: React.FC<ProjectInstructionsPanelProps> = ({ 
  projectId, 
  className = "" 
}) => {
  const [instructions, setInstructions] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { projects, updateProject } = useProjects();
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();

  const currentProject = projects.find(p => p.id === projectId);

  useEffect(() => {
    if (currentProject?.settings?.instructions) {
      setInstructions(currentProject.settings.instructions);
    }
  }, [currentProject]);

  const handleSave = async () => {
    if (!projectId || !currentWorkspace) return;

    try {
      setSaving(true);
      
      const updatedSettings = {
        ...currentProject?.settings,
        instructions: instructions.trim()
      };

      const { error } = await updateProject(projectId, {
        settings: updatedSettings
      });

      if (error) throw error;

      setIsEditing(false);
      toast({
        title: "Instructions saved",
        description: "Project instructions have been updated",
      });
    } catch (error: any) {
      console.error('Error saving instructions:', error);
      toast({
        variant: "destructive",
        title: "Save failed",
        description: error.message || "Could not save instructions",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original instructions
    if (currentProject?.settings?.instructions) {
      setInstructions(currentProject.settings.instructions);
    } else {
      setInstructions('');
    }
    setIsEditing(false);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Instructions</CardTitle>
          {!isEditing && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {!isEditing && !instructions ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="space-y-2">
              <p className="text-sm">Aucune instruction définie</p>
              <p className="text-xs">
                Ajouter des instructions pour personnaliser les réponses de Claude.
              </p>
              <Button
                size="sm"
                onClick={() => setIsEditing(true)}
                className="mt-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter des instructions
              </Button>
            </div>
          </div>
        ) : isEditing ? (
          <div className="space-y-4">
            <Textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Décrivez comment Claude devrait se comporter dans ce projet. Par exemple :
- Le ton à utiliser (professionnel, décontracté, etc.)
- Le domaine d'expertise à privilégier
- Les formats de réponse préférés
- Les éléments spécifiques à prendre en compte"
              className="min-h-[120px] resize-none"
              disabled={saving}
            />
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving || !instructions.trim()}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-foreground whitespace-pre-wrap bg-muted/30 p-3 rounded-lg">
              {instructions}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="w-full"
            >
              Modifier les instructions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};