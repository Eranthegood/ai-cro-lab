import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Zap,
  Brain,
  TrendingUp,
  Target,
  Globe,
  Calendar,
  AlertCircle,
  Lightbulb,
  CheckCircle,
  Wrench
} from 'lucide-react';

interface GroupedSuggestion {
  id: string;
  title: string;
  approach?: string;
  problem_detected?: string;
  solution_description?: string;
  expected_impact?: string;
  psychology_insight?: string;
  difficulty?: string;
  pageUrl: string;
  goalType: string;
  createdAt: string;
  sessionId: string;
}

interface SuggestionDetailDialogProps {
  suggestion: GroupedSuggestion | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SuggestionDetailDialog = ({
  suggestion,
  isOpen,
  onClose
}: SuggestionDetailDialogProps) => {
  if (!suggestion) return null;

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'simple css':
      case 'easy':
      case 'simple':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'medium js':
      case 'medium':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'complex integration':
      case 'complex':
      case 'hard':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getApproachIcon = (approach?: string) => {
    switch (approach) {
      case 'Technical UX':
        return <Zap className="h-4 w-4" />;
      case 'Psychology':
        return <Brain className="h-4 w-4" />;
      case 'Brand Differentiation':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold pr-8">
            {suggestion.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex flex-wrap gap-3">
            {suggestion.approach && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {getApproachIcon(suggestion.approach)}
                {suggestion.approach}
              </Badge>
            )}
            {suggestion.difficulty && (
              <Badge variant="outline" className={getDifficultyColor(suggestion.difficulty)}>
                <Wrench className="h-3 w-3 mr-1" />
                {suggestion.difficulty}
              </Badge>
            )}
            <Badge variant="outline">
              {suggestion.goalType}
            </Badge>
          </div>

          {/* Page & Date Info */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Page analysée</p>
                    <p className="text-sm text-muted-foreground break-all">{suggestion.pageUrl}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Date de création</p>
                    <p className="text-sm text-muted-foreground">{formatDate(suggestion.createdAt)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Problem Detected */}
          {suggestion.problem_detected && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  Problème identifié
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{suggestion.problem_detected}</p>
              </CardContent>
            </Card>
          )}

          {/* Solution Description */}
          {suggestion.solution_description && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Solution proposée
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{suggestion.solution_description}</p>
              </CardContent>
            </Card>
          )}

          {/* Expected Impact */}
          {suggestion.expected_impact && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Impact attendu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{suggestion.expected_impact}</p>
              </CardContent>
            </Card>
          )}

          {/* Psychology Insight */}
          {suggestion.psychology_insight && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  Insight psychologique
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{suggestion.psychology_insight}</p>
              </CardContent>
            </Card>
          )}

          {/* Session ID for debugging */}
          <div className="text-xs text-muted-foreground border-t pt-3">
            Session ID: {suggestion.sessionId}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};