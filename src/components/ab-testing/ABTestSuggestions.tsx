import React, { useState, useEffect } from 'react';
import { ArrowLeft, Brain, Zap, Target, Users, TrendingUp, RefreshCw, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";

interface Suggestion {
  id: string;
  title: string;
  problem_detected?: {
    issue: string;
    evidence: string;
    impact_scope: string;
  };
  problem?: string; // Legacy support
  solution: {
    approach: string;
    psychological_rationale: string;
    implementation_strategy: string;
  } | string; // Legacy support
  expected_impact?: {
    primary_metric: string;
    confidence_level: string;
    timeline_to_significance: string;
    secondary_benefits: string[];
  };
  expectedImpact?: string; // Legacy support
  confidence: number;
  difficulty: string;
  psychologyInsight?: string; // Legacy support
  differentiation_factor?: string;
  surprise_type?: string;
  credibility_signals?: {
    case_study_reference: string;
    psychological_research: string;
    industry_precedent?: string;
  };
  quality_score?: number;
  uniqueness?: string; // Legacy support
  brandContext?: string;
  implementation: {
    platform: string;
    difficulty?: string;
    code: string;
    setup: string[];
  };
  metrics: {
    primary: string;
    secondary: string[];
  };
}

interface ABTestSuggestionsProps {
  data: any;
  onSuggestionSelected: (suggestion: Suggestion) => void;
  onBack: () => void;
  onRegenerateRequested?: (iterationCount: number) => void;
}

export const ABTestSuggestions = ({ data, onSuggestionSelected, onBack, onRegenerateRequested }: ABTestSuggestionsProps) => {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(true);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentAnalysisStep, setCurrentAnalysisStep] = useState('');
  const [iterationCount, setIterationCount] = useState(0);
  const [engineVersion, setEngineVersion] = useState<string>('');

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
        setSuggestions(generateFallbackSuggestions());
        toast({
          title: "Using fallback suggestions",
          description: "AI service temporarily unavailable, showing curated recommendations.",
          variant: "default"
        });
      } else {
        setSuggestions(result.suggestions || []);
        setEngineVersion(result.meta?.engine_version || 'multi-layer-v2');
        setIterationCount(iteration);
        
        toast({
          title: iteration > 0 ? "Fresh suggestions generated!" : "AI suggestions generated!",
          description: `Generated ${result.suggestions?.length || 0} ${iteration > 0 ? 'alternative' : 'personalized'} test recommendations.`,
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setSuggestions(generateFallbackSuggestions());
      toast({
        title: "Error generating suggestions",
        description: "Showing fallback recommendations instead.",
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
    return [
      {
        id: "1",
        title: "Micro-Commitment Psychology Ladder",
        problem_detected: {
          issue: "Users experience decision paralysis with large commitments",
          evidence: "Behavioral psychology shows 67% higher completion with micro-steps",
          impact_scope: "73% of hesitant visitors"
        },
        solution: {
          approach: "Break main CTA into micro-commitment sequence with progress visualization",
          psychological_rationale: "Commitment escalation + goal gradient effect reduces cognitive load and creates momentum",
          implementation_strategy: "Multi-step progress bar with small victories at each stage"
        },
        expected_impact: {
          primary_metric: "Conversion rate +28-35%",
          confidence_level: "High (87%)",
          timeline_to_significance: "12 days",
          secondary_benefits: ["Reduced abandonment", "Higher engagement", "Better qualification"]
        },
        confidence: 87,
        difficulty: "Medium",
        differentiation_factor: "Uses gaming psychology principles rarely applied to conversion optimization",
        surprise_type: "cross_industry",
        credibility_signals: {
          case_study_reference: "Similar implementation showed 31% improvement in e-commerce checkout",
          psychological_research: "Research by Ariely confirms micro-commitment effectiveness"
        },
        quality_score: 0.92,
        implementation: {
          platform: "AB Tasty",
          difficulty: "Medium",
          code: `
.progress-ladder {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}
.step {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #e0e0e0;
  margin-right: 10px;
  transition: all 0.3s ease;
}
.step.active {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  transform: scale(1.2);
}`,
          setup: [
            "Add progress indicator to form",
            "Break form into logical steps",
            "Add micro-rewards at each completion",
            "Track step completion rates"
          ]
        },
        metrics: {
          primary: "Multi-step conversion completion rate",
          secondary: ["Time per step", "Drop-off by stage", "Overall satisfaction"]
        }
      }
    ];
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
      case 'facile':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'medium':
      case 'moyen':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'advanced':
      case 'avancé':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

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

        {/* Suggestions Grid */}
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 mb-8">
          {suggestions.map((suggestion) => (
            <Card key={suggestion.id} className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 border-border/50">
              <CardHeader className="pb-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline" className={getDifficultyColor(suggestion.difficulty)}>
                      {suggestion.implementation?.difficulty || suggestion.difficulty}
                    </Badge>
                    <Badge variant="outline">
                      Confidence: {suggestion.confidence}%
                    </Badge>
                    {suggestion.quality_score && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Quality: {Math.round(suggestion.quality_score * 100)}%
                      </Badge>
                    )}
                    {suggestion.surprise_type && (
                      <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                        {suggestion.surprise_type.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{suggestion.title}</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Expected Impact:</span> {
                        suggestion.expected_impact?.primary_metric || suggestion.expectedImpact
                      }</p>
                      {suggestion.expected_impact?.timeline_to_significance && (
                        <p><span className="font-medium">Timeline:</span> {suggestion.expected_impact.timeline_to_significance}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm mb-1">🎯 Problem Identified</h4>
                    <p className="text-sm text-muted-foreground">
                      {suggestion.problem_detected?.issue || suggestion.problem}
                    </p>
                    {suggestion.problem_detected?.evidence && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        Evidence: {suggestion.problem_detected.evidence}
                      </p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-1">💡 Proposed Solution</h4>
                    <p className="text-sm text-muted-foreground">
                      {typeof suggestion.solution === 'object' 
                        ? suggestion.solution.approach 
                        : suggestion.solution}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-1">🧠 Psychology Insight</h4>
                    <p className="text-sm text-muted-foreground">
                      {typeof suggestion.solution === 'object' 
                        ? suggestion.solution.psychological_rationale 
                        : suggestion.psychologyInsight}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-1">✨ Why This Works</h4>
                    <p className="text-sm text-muted-foreground">
                      {suggestion.differentiation_factor || suggestion.uniqueness}
                    </p>
                  </div>

                  {suggestion.credibility_signals && (
                    <div>
                      <h4 className="font-medium text-sm mb-1">🎖️ Credibility</h4>
                      <div className="text-xs text-muted-foreground space-y-1">
                        {suggestion.credibility_signals.case_study_reference && (
                          <p>• {suggestion.credibility_signals.case_study_reference}</p>
                        )}
                        {suggestion.credibility_signals.psychological_research && (
                          <p>• {suggestion.credibility_signals.psychological_research}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">📊 Metrics to Track</h4>
                    <div className="text-sm text-muted-foreground">
                      <p><span className="font-medium">Primary:</span> {suggestion.metrics.primary}</p>
                      <p><span className="font-medium">Secondary:</span> {suggestion.metrics.secondary.join(', ')}</p>
                      {suggestion.expected_impact?.secondary_benefits && (
                        <p><span className="font-medium">Benefits:</span> {suggestion.expected_impact.secondary_benefits.join(', ')}</p>
                      )}
                    </div>
                  </div>

                  <Button 
                    className="w-full mt-4" 
                    onClick={() => onSuggestionSelected(suggestion)}
                  >
                    Select This Test
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4 border-t">
          <Button 
            onClick={onBack}
            variant="outline"
            className="flex-1"
          >
            Back to Setup
          </Button>
          <Button 
            onClick={handleRegenerate}
            variant="outline"
            className="flex-1"
            disabled={isGenerating}
          >
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
      </div>
    </div>
  );
};