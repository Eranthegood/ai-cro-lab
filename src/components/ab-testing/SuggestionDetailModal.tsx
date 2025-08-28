import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ExternalLink, 
  Download, 
  Copy, 
  Zap, 
  Brain, 
  TrendingUp,
  Clock,
  Target,
  Lightbulb,
  Code2,
  Users
} from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from 'date-fns';

interface HistoryItem {
  id: string;
  session_id: string;
  goal_type: string;
  page_url: string;
  created_at: string;
  suggestion_data: any; // Using any to handle Json type from Supabase
}

interface SuggestionDetailModalProps {
  session: HistoryItem;
  isOpen: boolean;
  onClose: () => void;
}

export const SuggestionDetailModal = ({ session, isOpen, onClose }: SuggestionDetailModalProps) => {
  const suggestions = (session.suggestion_data as any)?.suggestions || [];

  const getApproachIcon = (approach: string) => {
    switch (approach) {
      case 'Technical UX':
        return <Zap className="w-4 h-4 text-blue-500" />;
      case 'Psychology':
        return <Brain className="w-4 h-4 text-purple-500" />;
      case 'Brand Differentiation':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'simple css':
      case 'easy':
      case 'simple':
        return 'border-green-200 text-green-700 bg-green-50';
      case 'medium js':
      case 'medium':
        return 'border-yellow-200 text-yellow-700 bg-yellow-50';
      case 'complex integration':
      case 'complex':
      case 'hard':
        return 'border-red-200 text-red-700 bg-red-50';
      default:
        return 'border-gray-200 text-gray-700 bg-gray-50';
    }
  };

  const handleCopySession = () => {
    const sessionText = `
AB Test Session - ${new Date(session.created_at).toLocaleDateString()}
Page: ${session.page_url}
Goal: ${session.goal_type}

Suggestions (${suggestions.length}):
${suggestions.map((s, i) => `
${i + 1}. ${s.title}
   Approach: ${s.approach}
   Expected Impact: ${s.expected_impact}
   Problem: ${s.problem_detected}
   Solution: ${s.solution_description}
   Psychology: ${s.psychology_insight}
   Difficulty: ${s.difficulty}
`).join('\n')}
    `;

    navigator.clipboard.writeText(sessionText.trim());
    toast({
      title: "Session copied",
      description: "Session details copied to clipboard"
    });
  };

  const handleExportSession = () => {
    const exportData = {
      session_id: session.session_id,
      page_url: session.page_url,
      goal_type: session.goal_type,
      created_at: session.created_at,
      suggestions: suggestions
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ab-test-session-${session.session_id.slice(0, 8)}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Session exported",
      description: "Session data exported as JSON file"
    });
  };

  const groupedSuggestions = suggestions.reduce((acc, suggestion) => {
    const approach = suggestion.approach || 'Other';
    if (!acc[approach]) acc[approach] = [];
    acc[approach].push(suggestion);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            AB Test Session Details
          </DialogTitle>
          <DialogDescription>
            Session generated {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          {/* Session Info */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Session Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Page URL:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      {new URL(session.page_url).hostname}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(session.page_url, '_blank')}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Goal Type:</span>
                  <Badge variant="secondary">{session.goal_type}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Suggestions:</span>
                  <Badge variant="outline">{suggestions.length} suggestions</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Created:</span>
                  <span className="text-sm">
                    {new Date(session.created_at).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Suggestions by Approach */}
            {Object.entries(groupedSuggestions).map(([approach, approachSuggestions]) => (
              <Card key={approach}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    {getApproachIcon(approach)}
                    {approach} 
                    <Badge variant="outline" className="ml-auto">
                      {Array.isArray(approachSuggestions) ? approachSuggestions.length : 0} suggestions
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array.isArray(approachSuggestions) && approachSuggestions.map((suggestion, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{suggestion.title}</h4>
                        <Badge 
                          variant="outline" 
                          className={getDifficultyColor(suggestion.difficulty)}
                        >
                          {suggestion.difficulty}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="w-4 h-4 text-orange-500" />
                            <span className="text-sm font-medium">Expected Impact</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {suggestion.expected_impact}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-medium">Problem Identified</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {suggestion.problem_detected}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Code2 className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium">Solution</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {suggestion.solution_description}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-purple-500" />
                            <span className="text-sm font-medium">Psychology Insight</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {suggestion.psychology_insight}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        {/* Actions */}
        <Separator className="my-4" />
        <div className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCopySession}>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" onClick={handleExportSession}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};