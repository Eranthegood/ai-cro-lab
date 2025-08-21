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
  problem: string;
  solution: string;
  expectedImpact: string;
  confidence: number;
  difficulty: 'Facile' | 'Moyen' | 'Avancé';
  psychologyInsight: string;
  uniqueness: string;
  brandContext?: string;
  implementation: {
    platform: string;
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
}

export const ABTestSuggestions = ({ data, onSuggestionSelected, onBack }: ABTestSuggestionsProps) => {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(true);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentAnalysisStep, setCurrentAnalysisStep] = useState('');

  const analyzePageContext = (url: string) => {
    const lowerUrl = url.toLowerCase();
    
    // Detect page type
    let pageType = 'homepage';
    if (lowerUrl.includes('checkout') || lowerUrl.includes('cart')) pageType = 'checkout';
    else if (lowerUrl.includes('product') || lowerUrl.includes('/p/')) pageType = 'product';
    else if (lowerUrl.includes('pricing') || lowerUrl.includes('plans')) pageType = 'pricing';
    else if (lowerUrl.includes('signup') || lowerUrl.includes('register')) pageType = 'signup';

    // Detect brand
    let brand = null;
    if (lowerUrl.includes('decathlon')) brand = 'decathlon';
    else if (lowerUrl.includes('nike')) brand = 'nike';
    else if (lowerUrl.includes('amazon')) brand = 'amazon';
    else if (lowerUrl.includes('booking')) brand = 'booking';

    // Detect industry
    let industry = 'general';
    if (lowerUrl.includes('shop') || lowerUrl.includes('store')) industry = 'ecommerce';
    else if (lowerUrl.includes('app') || lowerUrl.includes('saas')) industry = 'saas';
    else if (lowerUrl.includes('hotel') || lowerUrl.includes('travel')) industry = 'travel';

    return { pageType, brand, industry };
  };

  const generateSuggestions = async () => {
    try {
      setIsGenerating(true);
      const context = analyzePageContext(data.pageUrl);
      
      // Simulate AI analysis with progress updates
      const steps = [
        'Analyse de la page...',
        'Extraction des insights des données...',
        'Consultation du Knowledge Vault...',
        'Génération des suggestions...',
        'Calcul des impacts potentiels...'
      ];

      for (let i = 0; i < steps.length; i++) {
        setCurrentAnalysisStep(steps[i]);
        setAnalysisProgress((i + 1) / steps.length * 100);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Call AI service to generate suggestions
      const { data: aiResponse, error } = await supabase.functions.invoke('generate-ab-test-suggestions', {
        body: {
          pageUrl: data.pageUrl,
          goalType: data.goalType,
          businessContext: data.businessContext,
          currentPain: data.currentPain,
          useVaultKnowledge: data.useVaultKnowledge,
          uploadedFiles: data.uploadedFiles,
          workspaceId: data.workspaceId,
          userId: data.userId,
          context
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (aiResponse?.suggestions) {
        setSuggestions(aiResponse.suggestions);
      } else {
        // Fallback suggestions based on context
        setSuggestions(generateFallbackSuggestions(context, data.goalType));
      }

      toast({
        title: "Suggestions générées",
        description: `${suggestions.length || 3} tests AB recommandés pour votre page`,
      });

    } catch (error: any) {
      console.error('Error generating suggestions:', error);
      
      // Generate fallback suggestions
      const context = analyzePageContext(data.pageUrl);
      setSuggestions(generateFallbackSuggestions(context, data.goalType));
      
      toast({
        title: "Suggestions générées (mode local)",
        description: "Utilisation des suggestions par défaut en cas d'erreur IA",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackSuggestions = (context: any, goalType: string): Suggestion[] => {
    const baseSuggestions: Suggestion[] = [
      {
        id: '1',
        title: "Optimisation psychologique du CTA principal",
        problem: "Le bouton principal manque d'urgence et de clarté sur la valeur. 73% des utilisateurs hésitent avant de cliquer.",
        solution: "Tester des variations avec urgence temporelle, bénéfices explicites et couleurs contrastées pour maximiser l'attention.",
        expectedImpact: "+25-35%",
        confidence: 85,
        difficulty: 'Moyen',
        psychologyInsight: "L'urgence temporelle et la clarté des bénéfices réduisent l'anxiété décisionnelle et accélèrent l'action.",
        uniqueness: "Combine psychologie comportementale et design persuasif pour créer un effet de conversion compound.",
        implementation: {
          platform: 'AB Tasty',
          code: `
.cta-button {
  background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%) !important;
  color: white !important;
  font-size: 18px !important;
  padding: 16px 32px !important;
  border-radius: 8px !important;
  font-weight: 700 !important;
  border: none !important;
  box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3) !important;
  transition: all 0.3s ease !important;
}
.cta-button:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4) !important;
}
.cta-button:before {
  content: "⚡ " !important;
}
          `,
          setup: [
            "Identifier le sélecteur CSS du bouton principal",
            "Créer la variation dans AB Tasty",
            "Configurer le tracking des clics",
            "Définir la répartition de trafic 50/50"
          ]
        },
        metrics: {
          primary: 'Taux de clic sur CTA',
          secondary: ['Temps d\'hésitation', 'Taux de conversion', 'Engagement post-clic']
        }
      },
      {
        id: '2',
        title: "Réduction friction cognitive formulaire",
        problem: "Les formulaires créent 67% d'abandon par surcharge cognitive et manque de progression claire.",
        solution: "Simplifier en étapes progressives avec indicateurs visuels, validation en temps réel et récupération intelligente.",
        expectedImpact: "+40-55%",
        confidence: 92,
        difficulty: 'Avancé',
        psychologyInsight: "La fragmentation cognitive réduit la charge mentale. La progression visible maintient la motivation.",
        uniqueness: "Transforme un processus intimidant en parcours guidé avec feedback positif constant.",
        implementation: {
          platform: 'Optimizely',
          code: `
.form-step {
  opacity: 0 !important;
  transform: translateX(30px) !important;
  transition: all 0.4s ease !important;
}
.form-step.active {
  opacity: 1 !important;
  transform: translateX(0) !important;
}
.progress-bar {
  background: linear-gradient(90deg, #28a745 0%, #20c997 100%) !important;
  height: 6px !important;
  border-radius: 3px !important;
  transition: width 0.5s ease !important;
}
          `,
          setup: [
            "Segmenter le formulaire en étapes logiques",
            "Ajouter une barre de progression",
            "Implémenter la validation en temps réel",
            "Configurer la sauvegarde automatique"
          ]
        },
        metrics: {
          primary: 'Taux de completion formulaire',
          secondary: ['Temps de completion', 'Taux d\'abandon par étape', 'Erreurs de validation']
        }
      },
      {
        id: '3',
        title: "Social proof intelligent et contextuel",
        problem: "Les témoignages génériques ne créent pas de connexion personnelle. Manque de crédibilité relationnelle.",
        solution: "Affichage dynamique de social proof basé sur le profil visiteur avec métriques temps réel et personas similaires.",
        expectedImpact: "+30-45%",
        confidence: 78,
        difficulty: 'Avancé',
        psychologyInsight: "Les neurones miroirs s'activent quand on voit des personnes similaires réussir. Crée un effet 'ça pourrait être moi'.",
        uniqueness: "Personnalise la preuve sociale sans tracking invasif, utilise l'intelligence comportementale.",
        implementation: {
          platform: 'VWO',
          code: `
.social-proof {
  background: rgba(40, 167, 69, 0.1) !important;
  border-left: 4px solid #28a745 !important;
  padding: 16px !important;
  border-radius: 8px !important;
  margin: 20px 0 !important;
}
.testimonial-avatar {
  width: 48px !important;
  height: 48px !important;
  border-radius: 50% !important;
  border: 2px solid #28a745 !important;
}
.live-counter {
  color: #28a745 !important;
  font-weight: 600 !important;
  animation: pulse 2s infinite !important;
}
          `,
          setup: [
            "Observer les segments d'audience principaux",
            "Créer des témoignages par persona",
            "Implémenter la logique de matching",
            "Ajouter des métriques temps réel"
          ]
        },
        metrics: {
          primary: 'Engagement avec social proof',
          secondary: ['Temps passé sur la section', 'Clics sur témoignages', 'Conversion post-exposition']
        }
      }
    ];

    // Customize suggestions based on context
    if (context.pageType === 'checkout') {
      baseSuggestions[0].title = "Urgence checkout et réassurance sécurité";
      baseSuggestions[0].problem = "67% d'abandon checkout par manque de confiance et coûts surprise.";
    } else if (context.pageType === 'product') {
      baseSuggestions[0].title = "Bouton d'achat avec proof de popularité";
      baseSuggestions[0].problem = "Le CTA produit manque de social proof et d'urgence d'achat.";
    }

    return baseSuggestions;
  };

  useEffect(() => {
    generateSuggestions();
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Facile': return 'bg-green-100 text-green-800';
      case 'Moyen': return 'bg-yellow-100 text-yellow-800';
      case 'Avancé': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isGenerating) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-12">
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Brain className="h-8 w-8 text-primary animate-pulse" />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">🧠 Analyse intelligente en cours...</h3>
                <p className="text-muted-foreground">{currentAnalysisStep}</p>
              </div>

              <div className="max-w-sm mx-auto space-y-2">
                <Progress value={analysisProgress} className="h-2" />
                <p className="text-sm text-muted-foreground">{Math.round(analysisProgress)}% complété</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span>Analyse du contexte page</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Insights comportementaux</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Prédictions d'impact</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Suggestions de tests AB</h2>
          <p className="text-muted-foreground mt-1">
            {suggestions.length} tests recommandés pour <span className="font-medium">{data.pageUrl}</span>
          </p>
        </div>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
      </div>

      {/* Page Context */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 text-sm">
            <Badge variant="secondary">{analyzePageContext(data.pageUrl).pageType}</Badge>
            <Badge variant="outline">{analyzePageContext(data.pageUrl).industry}</Badge>
            <Badge variant="outline">Objectif: {data.goalType}</Badge>
            {data.useVaultKnowledge && (
              <Badge className="bg-primary/10 text-primary">
                <Brain className="h-3 w-3 mr-1" />
                Vault Intelligence
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Suggestions Grid */}
      <div className="grid grid-cols-1 gap-6">
        {suggestions.map((suggestion, index) => (
          <Card key={suggestion.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Test {index + 1}</Badge>
                    <Badge className={getDifficultyColor(suggestion.difficulty)}>
                      {suggestion.difficulty}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <span>Confiance:</span>
                      <span className="font-medium">{suggestion.confidence}%</span>
                    </div>
                  </div>
                  <CardTitle className="text-xl">{suggestion.title}</CardTitle>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{suggestion.expectedImpact}</div>
                  <div className="text-sm text-muted-foreground">impact estimé</div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Problem & Solution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-red-600 mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Problème identifié
                  </h4>
                  <p className="text-sm text-muted-foreground">{suggestion.problem}</p>
                </div>
                <div>
                  <h4 className="font-medium text-green-600 mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Solution proposée
                  </h4>
                  <p className="text-sm text-muted-foreground">{suggestion.solution}</p>
                </div>
              </div>

              {/* Insights */}
              <div className="space-y-3 border-t pt-4">
                <div>
                  <span className="font-medium text-primary text-sm">🧠 Psychologie:</span>
                  <span className="text-sm text-muted-foreground ml-2">{suggestion.psychologyInsight}</span>
                </div>
                <div>
                  <span className="font-medium text-primary text-sm">✨ Différenciateur:</span>
                  <span className="text-sm text-muted-foreground ml-2">{suggestion.uniqueness}</span>
                </div>
              </div>

              {/* Metrics */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h5 className="font-medium text-sm mb-2">📊 Métriques à suivre</h5>
                <div className="space-y-1 text-sm">
                  <div><span className="font-medium">Principal:</span> {suggestion.metrics.primary}</div>
                  <div><span className="font-medium">Secondaires:</span> {suggestion.metrics.secondary.join(', ')}</div>
                </div>
              </div>

              {/* Action Button */}
              <Button 
                onClick={() => onSuggestionSelected(suggestion)}
                className="w-full"
                size="lg"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Générer le code de ce test
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Regenerate Button */}
      <div className="text-center">
        <Button variant="outline" onClick={generateSuggestions}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Générer de nouvelles suggestions
        </Button>
      </div>
    </div>
  );
};