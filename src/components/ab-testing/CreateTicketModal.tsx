import React, { useState } from 'react';
import { Target, Zap, Clock, User, AlertCircle } from 'lucide-react';
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

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestion: Suggestion;
}

export const CreateTicketModal = ({ isOpen, onClose, suggestion }: CreateTicketModalProps) => {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: suggestion.title || '',
    priority: 'medium' as string,
    framework: 'react' as string,
    description: '',
    hypothesis: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !currentWorkspace) return;

    setIsCreating(true);

    try {
      // Create AB test record
      const { data: abTest, error } = await supabase
        .from('ab_tests')
        .insert({
          name: formData.name,
          hypothesis: formData.hypothesis || `Testing ${suggestion.title}`,
          priority: formData.priority,
          framework: formData.framework,
          status: 'draft',
          source_suggestion_id: suggestion.id,
          business_impact: {
            expected: suggestion.expected_impact,
            psychology: suggestion.psychology_insight,
          },
          workspace_id: currentWorkspace.id,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "AB Test Created!",
        description: `Test "${formData.name}" has been created and is ready for development.`,
      });

      onClose();
    } catch (error) {
      console.error('Error creating AB test:', error);
      toast({
        title: "Error",
        description: "Failed to create AB test. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const generateDescription = () => {
    return `
## Test Objective
${suggestion.title}

## Problem Analysis
${suggestion.problem_detected || 'User behavior analysis pending'}

## Proposed Solution
${suggestion.solution_description || 'Solution implementation details'}

## Psychology Insights
${suggestion.psychology_insight || 'Behavioral analysis insights'}

## Expected Impact
${suggestion.expected_impact || 'Performance improvement metrics'}

## Implementation Difficulty
${suggestion.difficulty || 'Medium'}

## Acceptance Criteria
- [ ] Implement solution according to design specifications
- [ ] Set up proper analytics tracking
- [ ] Configure A/B test parameters
- [ ] Test across different devices and browsers
- [ ] Validate statistical significance requirements
    `.trim();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Create AB Test Ticket
          </DialogTitle>
          <DialogDescription>
            Generate a ready-to-dev ticket for this AB test suggestion
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Test Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter test name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="framework">Framework</Label>
                <Select value={formData.framework} onValueChange={(value) => setFormData({ ...formData, framework: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="react">React</SelectItem>
                    <SelectItem value="vue">Vue.js</SelectItem>
                    <SelectItem value="angular">Angular</SelectItem>
                    <SelectItem value="vanilla">Vanilla JS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="hypothesis">Test Hypothesis</Label>
                <Textarea
                  id="hypothesis"
                  value={formData.hypothesis}
                  onChange={(e) => setFormData({ ...formData, hypothesis: e.target.value })}
                  placeholder="If we implement this change, then we expect..."
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
                  disabled={isCreating}
                  className="flex-1"
                >
                  {isCreating ? 'Creating...' : 'Create Test'}
                </Button>
              </div>
            </form>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Generated Ticket Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {formData.priority.toUpperCase()}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {formData.framework}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {suggestion.difficulty || 'Medium'}
                  </Badge>
                </div>
                
                <div className="text-sm space-y-2">
                  <div>
                    <span className="font-medium">Title:</span> {formData.name}
                  </div>
                  <div>
                    <span className="font-medium">Expected Impact:</span> {suggestion.expected_impact}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Full Description</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs whitespace-pre-wrap text-muted-foreground">
                  {generateDescription()}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};