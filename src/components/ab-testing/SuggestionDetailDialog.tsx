import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Wrench,
  Clock,
  Users,
  BarChart3,
  AlertTriangle,
  List,
  Palette,
  Star,
  Bookmark
} from 'lucide-react';
import { CreateTicketModal } from './CreateTicketModal';
import { AddToBacklogModal } from './AddToBacklogModal';

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
  // Additional fields
  code_complexity?: string;
  implementation_steps?: string[];
  success_metrics?: string[];
  testing_strategy?: string;
  design_variations?: string[];
  target_audience?: string;
  priority?: string;
  estimated_time?: string;
  confidence_level?: string;
  risk_factors?: string[];
  original_data?: any;
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBacklogModalOpen, setIsBacklogModalOpen] = useState(false);
  
  if (!suggestion) return null;

  // Convert suggestion format to match what the modals expect
  const convertedSuggestion = {
    id: suggestion.id,
    title: suggestion.title,
    approach: suggestion.approach,
    problem_detected: suggestion.problem_detected,
    solution_description: suggestion.solution_description,
    expected_impact: suggestion.expected_impact,
    psychology_insight: suggestion.psychology_insight,
    difficulty: suggestion.difficulty,
    ...suggestion.original_data // Include any additional data
  };

  const handleCreateTest = () => {
    setIsCreateModalOpen(true);
  };

  const handleAddToBacklog = () => {
    setIsBacklogModalOpen(true);
  };

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

          {/* Implementation Steps */}
          {suggestion.implementation_steps && suggestion.implementation_steps.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <List className="h-5 w-5 text-blue-600" />
                  Étapes d'implémentation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2">
                  {suggestion.implementation_steps.map((step, index) => (
                    <li key={index} className="text-sm leading-relaxed">{step}</li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}

          {/* Success Metrics */}
          {suggestion.success_metrics && suggestion.success_metrics.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  Métriques de succès
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1">
                  {suggestion.success_metrics.map((metric, index) => (
                    <li key={index} className="text-sm leading-relaxed">{metric}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Testing Strategy */}
          {suggestion.testing_strategy && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  Stratégie de test
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{suggestion.testing_strategy}</p>
              </CardContent>
            </Card>
          )}

          {/* Design Variations */}
          {suggestion.design_variations && suggestion.design_variations.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Palette className="h-5 w-5 text-pink-600" />
                  Variations de design
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1">
                  {suggestion.design_variations.map((variation, index) => (
                    <li key={index} className="text-sm leading-relaxed">{variation}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Additional Information Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Target Audience */}
            {suggestion.target_audience && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Audience cible</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{suggestion.target_audience}</p>
                </CardContent>
              </Card>
            )}

            {/* Priority */}
            {suggestion.priority && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Priorité</p>
                  </div>
                  <Badge variant="secondary">{suggestion.priority}</Badge>
                </CardContent>
              </Card>
            )}

            {/* Estimated Time */}
            {suggestion.estimated_time && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Temps estimé</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{suggestion.estimated_time}</p>
                </CardContent>
              </Card>
            )}

            {/* Confidence Level */}
            {suggestion.confidence_level && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Niveau de confiance</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{suggestion.confidence_level}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Risk Factors */}
          {suggestion.risk_factors && suggestion.risk_factors.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Facteurs de risque
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1">
                  {suggestion.risk_factors.map((risk, index) => (
                    <li key={index} className="text-sm leading-relaxed text-orange-700">{risk}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Debug Info */}
          {process.env.NODE_ENV === 'development' && suggestion.original_data && (
            <Card className="border-dashed">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">
                  Données brutes (développement)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(suggestion.original_data, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Session ID for debugging */}
          <div className="text-xs text-muted-foreground border-t pt-3">
            Session ID: {suggestion.sessionId}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={handleAddToBacklog}
              variant="outline"
              className="flex-1"
            >
              <Bookmark className="w-4 h-4 mr-2" />
              Ajouter au Backlog
            </Button>
            <Button
              onClick={handleCreateTest}
              className="flex-1"
            >
              <Target className="w-4 h-4 mr-2" />
              Créer AB Test
            </Button>
          </div>
        </div>

        {/* Modals */}
        <CreateTicketModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          suggestion={convertedSuggestion}
        />
        <AddToBacklogModal
          isOpen={isBacklogModalOpen}
          onClose={() => setIsBacklogModalOpen(false)}
          suggestion={convertedSuggestion}
        />
      </DialogContent>
    </Dialog>
  );
};