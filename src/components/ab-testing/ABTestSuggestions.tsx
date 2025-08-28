import React, { useState, useEffect } from 'react';
import { ArrowLeft, Brain, Zap, Target, Users, TrendingUp, RefreshCw, Sparkles, Download, FileText, Save, Bookmark } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";
import { CreateTicketModal } from "./CreateTicketModal";
import { AddToBacklogModal } from "./AddToBacklogModal";

interface Suggestion {
  id: string;
  title: string;
  approach?: string; // New field for approach categorization
  problem_detected?: string;
  solution_description?: string;
  implementation_method?: string;
  expected_impact?: string;
  psychology_insight?: string;
  code_complexity?: string;
  unique_factor?: string;
  confidence?: number;
  difficulty?: string;
  // Legacy fields for backward compatibility
  problem?: string;
  solution?: {
    approach: string;
    psychological_rationale: string;
    implementation_strategy: string;
  } | string;
  expectedImpact?: string;
  psychologyInsight?: string;
  differentiation_factor?: string;
  surprise_type?: string;
  credibility_signals?: {
    case_study_reference: string;
    psychological_research: string;
    industry_precedent?: string;
  };
  quality_score?: number;
  uniqueness?: string;
  brandContext?: string;
  implementation?: {
    platform: string;
    difficulty?: string;
    code: string;
    setup: string[];
  };
  metrics?: {
    primary: string;
    secondary: string[];
  };
}

interface ABTestSuggestionsProps {
  data: any;
  onBack: () => void;
  onRegenerateRequested?: (iterationCount: number) => void;
}

export const ABTestSuggestions = ({ data, onBack, onRegenerateRequested }: ABTestSuggestionsProps) => {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(true);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentAnalysisStep, setCurrentAnalysisStep] = useState('');
  const [iterationCount, setIterationCount] = useState(0);
  const [engineVersion, setEngineVersion] = useState<string>('');
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBacklogModalOpen, setIsBacklogModalOpen] = useState(false);

  const analyzePageContext = (url: string) => {
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.includes('shop') || lowerUrl.includes('product') || lowerUrl.includes('cart')) {
      return { pageType: 'ecommerce', brand: 'shop', industry: 'retail' };
    } else if (lowerUrl.includes('app') || lowerUrl.includes('dashboard') || lowerUrl.includes('login')) {
      return { pageType: 'saas', brand: 'app', industry: 'software' };
    } else if (lowerUrl.includes('bank') || lowerUrl.includes('finance') || lowerUrl.includes('invest')) {
      return { pageType: 'finance', brand: 'financial', industry: 'finance' };
    } else {
      return { pageType: 'homepage', brand: 'general', industry: 'business' };
    }
  };

  const generateSuggestions = async (iteration: number = 0) => {
    setIsGenerating(true);
    setAnalysisProgress(0);
    setCurrentAnalysisStep('Initializing multi-layer analysis engine...');

    try {
      // Enhanced progress updates for multi-layer system
      const steps = [
        { step: 'Loading user preferences and history...', progress: 15 },
        { step: 'Analyzing competitive landscape...', progress: 30 },
        { step: 'Processing vault knowledge...', progress: 45 },
        { step: 'Generating intelligent insights with Claude Sonnet 4...', progress: 70 },
        { step: 'Applying quality validation and enhancement...', progress: 85 },
        { step: 'Personalizing recommendations...', progress: 95 },
        { step: 'Complete!', progress: 100 }
      ];

      for (const { step, progress } of steps) {
        setCurrentAnalysisStep(step);
        setAnalysisProgress(progress);
        await new Promise(resolve => setTimeout(resolve, 600));
      }

      // Call enhanced Supabase function
      const { data: result, error } = await supabase.functions.invoke('generate-ab-test-suggestions', {
        body: {
          pageUrl: data.pageUrl,
          goalType: data.goalType,
          businessContext: data.businessContext,
          currentPain: data.currentPain,
          useVaultKnowledge: data.useVaultKnowledge,
          uploadedFiles: data.selectedFiles,
          workspaceId: currentWorkspace?.id,
          userId: user?.id,
          context: analyzePageContext(data.pageUrl),
          iterationCount: iteration
        }
      });

      if (error) {
        console.error('Error generating suggestions:', error);
        toast({
          title: "Error generating suggestions",
          description: "Unable to generate AI suggestions. Please try again.",
          variant: "destructive"
        });
        return;
      } else {
        setSuggestions(result.suggestions || []);
        setEngineVersion(result.meta?.engine_version || 'comprehensive-v3');
        setIterationCount(iteration);
        
        toast({
          title: iteration > 0 ? "Fresh suggestions generated!" : "AI suggestions generated!",
          description: `Generated ${result.suggestions?.length || 0} ${iteration > 0 ? 'alternative' : 'personalized'} test recommendations across 3 approaches.`,
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error generating suggestions",
        description: "Unable to connect to suggestion engine. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = () => {
    const nextIteration = iterationCount + 1;
    generateSuggestions(nextIteration);
    onRegenerateRequested?.(nextIteration);
  };

  const generateFallbackSuggestions = (): Suggestion[] => {
    // No hardcoded fallbacks - all data comes from the API
    return [];
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

  const exportSuggestions = () => {
    const exportData = {
      pageUrl: data.pageUrl,
      goalType: data.goalType,
      analysisDate: new Date().toISOString(),
      suggestions: suggestions.map(s => ({
        title: s.title,
        approach: s.approach,
        problem: s.problem_detected || s.problem,
        solution: s.solution_description || s.solution,
        psychologyInsight: s.psychology_insight || s.psychologyInsight,
        expectedImpact: s.expected_impact || s.expectedImpact,
        difficulty: s.difficulty || s.code_complexity
      }))
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ab-test-suggestions-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateTest = (suggestion: Suggestion) => {
    setSelectedSuggestion(suggestion);
    setIsCreateModalOpen(true);
  };

  const handleAddToBacklog = (suggestion: Suggestion) => {
    setSelectedSuggestion(suggestion);
    setIsBacklogModalOpen(true);
  };

  const SuggestionCard = ({ suggestion }: {
  suggestion: Suggestion;
}) => (
  <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 border-border/50">
    <CardHeader className="pb-4">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          <Badge variant="outline" className={getDifficultyColor(suggestion.difficulty || suggestion.code_complexity || 'medium')}>
            {suggestion.code_complexity || suggestion.difficulty || 'Medium'}
          </Badge>
          {suggestion.approach && (
            <Badge variant="secondary">
              {suggestion.approach}
            </Badge>
          )}
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">{suggestion.title}</h3>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Expected Impact:</span> {
              suggestion.expected_impact || suggestion.expectedImpact || 'Analysis pending'
            }</p>
          </div>
        </div>
      </div>
    </CardHeader>

    <CardContent>
      <div className="space-y-3">
        <div>
          <h4 className="font-medium text-sm mb-1">🎯 Problem Identified</h4>
          <p className="text-sm text-muted-foreground">
            {suggestion.problem_detected || suggestion.problem || 'User behavior analysis in progress'}
          </p>
        </div>

        <div>
          <h4 className="font-medium text-sm mb-1">💡 Proposed Solution</h4>
          <p className="text-sm text-muted-foreground">
            {suggestion.solution_description || 
             (typeof suggestion.solution === 'object' ? suggestion.solution.approach : suggestion.solution) ||
             'Solution details being generated'}
          </p>
        </div>

        <div>
          <h4 className="font-medium text-sm mb-1">🧠 Psychology Insight</h4>
          <p className="text-sm text-muted-foreground">
            {suggestion.psychology_insight || 
             (typeof suggestion.solution === 'object' ? suggestion.solution.psychological_rationale : suggestion.psychologyInsight) ||
             'Behavioral analysis pending'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-3 border-t">
          <Button
            onClick={() => handleCreateTest(suggestion)}
            size="sm"
            className="flex-1"
          >
            <Target className="w-4 h-4 mr-2" />
            Create AB Test
          </Button>
          <Button
            onClick={() => handleAddToBacklog(suggestion)}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Bookmark className="w-4 h-4 mr-2" />
            Backlog
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

  useEffect(() => {
    generateSuggestions(0);
  }, []);

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Multi-Layer AI Analysis Engine</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Generating Intelligent Suggestions</h1>
            <p className="text-muted-foreground">Our AI is analyzing your context and generating personalized test recommendations</p>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="text-center">
                  <Brain className="w-16 h-16 mx-auto mb-4 text-primary animate-pulse" />
                  <h3 className="text-lg font-semibold mb-2">{currentAnalysisStep}</h3>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{analysisProgress}%</span>
                  </div>
                  <Progress value={analysisProgress} className="h-3" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <Target className="w-4 h-4" />
            <span className="text-sm font-medium">AI-Generated Test Opportunities</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Personalized AB Test Suggestions</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our multi-layer AI engine analyzed your context and generated these intelligent test opportunities
          </p>
        </div>

        {/* Page Context */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {data.pageUrl && (
            <Badge variant="secondary" className="px-3 py-1">
              📍 {data.pageUrl.split('/')[2]}
            </Badge>
          )}
          <Badge variant="secondary" className="px-3 py-1">
            🎯 {data.goalType}
          </Badge>
          {data.useVaultKnowledge && (
            <Badge variant="secondary" className="px-3 py-1">
              📚 Knowledge Vault Enhanced
            </Badge>
          )}
          {engineVersion && (
            <Badge variant="outline" className="px-3 py-1">
              🤖 {engineVersion}
            </Badge>
          )}
        </div>

        {/* Suggestions by Approach */}
        <div className="space-y-8 mb-8">
          {/* Technical UX Optimization */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Zap className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold">Technical UX Optimization</h2>
              <Badge variant="outline" className="ml-auto">
                {suggestions.filter(s => s.approach === 'Technical UX').length} suggestions
              </Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {suggestions
                .filter(suggestion => suggestion.approach === 'Technical UX')
                .map((suggestion) => (
                   <SuggestionCard 
                     key={suggestion.id} 
                     suggestion={suggestion} 
                   />
                ))}
            </div>
          </div>

          {/* Psychology & Persuasion */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <Brain className="w-4 h-4 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold">Psychology & Persuasion</h2>
              <Badge variant="outline" className="ml-auto">
                {suggestions.filter(s => s.approach === 'Psychology').length} suggestions
              </Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {suggestions
                .filter(suggestion => suggestion.approach === 'Psychology')
                .map((suggestion) => (
                   <SuggestionCard 
                     key={suggestion.id} 
                     suggestion={suggestion} 
                   />
                ))}
            </div>
          </div>

          {/* Brand Differentiation */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold">Brand Differentiation</h2>
              <Badge variant="outline" className="ml-auto">
                {suggestions.filter(s => s.approach === 'Brand Differentiation').length} suggestions
              </Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {suggestions
                .filter(suggestion => suggestion.approach === 'Brand Differentiation')
                .map((suggestion) => (
                   <SuggestionCard 
                     key={suggestion.id} 
                     suggestion={suggestion} 
                   />
                ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button 
            onClick={onBack}
            variant="outline"
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Setup
          </Button>
          <Button 
            onClick={() => window.open('/ab-test-history', '_blank')}
            variant="outline"
            className="flex-1"
          >
            <FileText className="w-4 h-4 mr-2" />
            View History
          </Button>
          <Button 
            onClick={exportSuggestions}
            variant="outline"
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Suggestions
          </Button>
          <Button 
            onClick={handleRegenerate}
            variant="default"
            className="flex-1"
            disabled={isGenerating}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {isGenerating ? 'Generating...' : 
             iterationCount > 0 ? `Regenerate (${iterationCount + 1})` : 'Generate New Suggestions'
            }
          </Button>
        </div>
        
        {engineVersion && (
          <div className="text-center text-xs text-muted-foreground mt-2">
            Powered by {engineVersion} • Iteration {iterationCount + 1}
          </div>
        )}

        {/* Modals */}
        {selectedSuggestion && (
          <>
            <CreateTicketModal
              isOpen={isCreateModalOpen}
              onClose={() => {
                setIsCreateModalOpen(false);
                setSelectedSuggestion(null);
              }}
              suggestion={selectedSuggestion}
            />
            <AddToBacklogModal
              isOpen={isBacklogModalOpen}
              onClose={() => {
                setIsBacklogModalOpen(false);
                setSelectedSuggestion(null);
              }}
              suggestion={selectedSuggestion}
            />
          </>
        )}
      </div>
    </div>
  );
};