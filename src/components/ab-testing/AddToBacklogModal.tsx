import React, { useState } from 'react';
import { Bookmark, Tag, MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';

interface Suggestion {
  id: string;
  title: string;
  approach?: string;
  problem_detected?: string;
  solution_description?: string;
  expected_impact?: string;
  psychology_insight?: string;
  difficulty?: string;
  [key: string]: any;
}

interface AddToBacklogModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestion: Suggestion;
}

export const AddToBacklogModal = ({ isOpen, onClose, suggestion }: AddToBacklogModalProps) => {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    priority: 'medium' as string,
    tags: [] as string[],
    tagInput: '',
    notes: '',
  });

  const handleAddTag = () => {
    if (formData.tagInput.trim() && !formData.tags.includes(formData.tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, formData.tagInput.trim()],
        tagInput: '',
      });
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !currentWorkspace) return;

    setIsAdding(true);

    try {
      const { error } = await supabase
        .from('ab_test_backlog')
        .insert({
          workspace_id: currentWorkspace.id,
          user_id: user.id,
          suggestion_id: suggestion.id,
          original_suggestion_data: suggestion,
          priority: formData.priority,
          tags: formData.tags,
          notes: formData.notes,
          status: 'active',
        });

      if (error) throw error;

      toast({
        title: "Added to Backlog!",
        description: `"${suggestion.title}" has been saved to your AB test backlog.`,
      });

      onClose();
    } catch (error) {
      console.error('Error adding to backlog:', error);
      toast({
        title: "Error",
        description: "Failed to add to backlog. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bookmark className="w-5 h-5" />
            Add to Backlog
          </DialogTitle>
          <DialogDescription>
            Save this suggestion for later consideration and development
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Suggestion Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{suggestion.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Approach:</span> {suggestion.approach}
              </div>
              <div>
                <span className="font-medium">Expected Impact:</span> {suggestion.expected_impact}
              </div>
              <div>
                <span className="font-medium">Difficulty:</span> {suggestion.difficulty}
              </div>
            </CardContent>
          </Card>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Nice to have</SelectItem>
                  <SelectItem value="medium">Medium - Should have</SelectItem>
                  <SelectItem value="high">High - Important</SelectItem>
                  <SelectItem value="urgent">Urgent - Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  id="tags"
                  value={formData.tagInput}
                  onChange={(e) => setFormData({ ...formData, tagInput: e.target.value })}
                  placeholder="Add tag..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" onClick={handleAddTag} size="sm">
                  <Tag className="w-4 h-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {formData.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any additional notes or context..."
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isAdding}
                className="flex-1"
              >
                {isAdding ? 'Adding...' : 'Add to Backlog'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};