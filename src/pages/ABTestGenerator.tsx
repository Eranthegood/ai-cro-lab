import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ABTestErrorBoundary } from '@/components/ab-testing/ErrorBoundary';
import { ABTestWorkflowStarter, WorkflowData } from '@/components/ab-testing/ABTestWorkflowStarter';
import { ABTestSuggestions } from '@/components/ab-testing/ABTestSuggestions';
import { SuggestionPreview } from '@/components/ab-testing/SuggestionPreview';
import { LivePreviewWithVibe } from '@/components/ab-testing/LivePreviewWithVibe';
import { ABTestCodeGenerator } from '@/components/ab-testing/ABTestCodeGenerator';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";
import { toast } from "@/hooks/use-toast";
import { scrapingService, ScrapedSiteData } from "@/services/scrapingService";
import { Loader2 } from 'lucide-react';

type WorkflowStep = 'upload' | 'scraping' | 'suggestions' | 'preview' | 'vibe' | 'code';

interface ProcessedData {
  workflowData: WorkflowData;
  scrapedData: ScrapedSiteData;
  analysisId: string;
}

interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  impact: string;
  difficulty: string;
  confidence: number;
  solution: {
    approach: string;
    changes: string[];
    reasoning: string;
  };
  implementation: {
    cssChanges: string;
    htmlChanges?: string;
    jsChanges?: string;
  };
  preview?: {
    selectors: Record<string, string>;
    modifications: Array<{
      selector: string;
      property: string;
      value: string;
      originalValue?: string;
    }>;
    visualChanges: {
      colors?: string[];
      typography?: string[];
      layout?: string[];
    };
  };
}

export const ABTestGenerator = () => {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('upload');
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [isScrapingLoading, setIsScrapingLoading] = useState(false);
  
  // Add state for Vibe Coding
  const [vibeInitialModifications, setVibeInitialModifications] = useState<any[]>([]);
  const [vibeSuggestionContext, setVibeSuggestionContext] = useState<string>('');

  const handleWorkflowStart = async (workflowData: WorkflowData) => {
    if (!user || !currentWorkspace) {
      toast({
        title: "Erreur d'Authentification",
        description: "Utilisateur ou workspace manquant",
        variant: "destructive",
      });
      return;
    }

    setCurrentStep('scraping');
    setIsScrapingLoading(true);

    try {
      toast({
        title: "🔥 Analyse Enhanced en cours",
        description: "Scraping professionnel avec Firecrawl pour contournement des protections...",
      });

      // Scrape the website using Firecrawl
      const scrapedSite = await scrapingService.scrapeSite(workflowData.pageUrl, {
        includeStyles: true,
        includeScripts: false,
        analyzeContent: true,
        generateSelectors: true
      });

      const processed: ProcessedData = {
        workflowData,
        scrapedData: scrapedSite,
        analysisId: `workflow_${Date.now()}`
      };

      setProcessedData(processed);
      setCurrentStep('suggestions');

      toast({
        title: "🎉 Site web analysé avec succès!",
        description: `${scrapedSite.targetableElements.length} éléments modifiables détectés`,
      });

    } catch (error: any) {
      console.error('🚨 Workflow analysis failed:', error);
      
      toast({
        title: "Erreur d'Analyse",
        description: error.message || "Impossible d'analyser le site web",
        variant: "destructive",
      });
      
      // Return to upload step
      setCurrentStep('upload');
    } finally {
      setIsScrapingLoading(false);
    }
  };

  const handleSuggestionSelected = (suggestion: Suggestion) => {
    setSelectedSuggestion(suggestion);
    setCurrentStep('preview');
  };

  const handleBackToSuggestions = () => {
    setSelectedSuggestion(null);
    setCurrentStep('suggestions');
  };

  const handleStartVibeCoding = () => {
    // Prepare initial modifications from suggestion
    if (selectedSuggestion?.preview?.modifications) {
      setVibeInitialModifications([{
        prompt: `Applied suggestion: ${selectedSuggestion.title}`,
        targetElement: null, // Will be determined from selectors
        cssChanges: selectedSuggestion.preview.modifications,
        timestamp: Date.now()
      }]);
      setVibeSuggestionContext(`User applied suggestion: "${selectedSuggestion.title}" - ${selectedSuggestion.description}`);
    }
    setCurrentStep('vibe');
  };

  const handleVibeCodeGenerated = (code: string) => {
    setGeneratedCode(code);
    setCurrentStep('code');
  };

  const handleCodeGenerated = (code: string) => {
    setGeneratedCode(code);
    setCurrentStep('code');
  };

  const getStepProgress = () => {
    switch (currentStep) {
      case 'upload': return 0;
      case 'scraping': return 16;
      case 'suggestions': return 33;
      case 'preview': return 50;
      case 'vibe': return 75;
      case 'code': return 100;
      default: return 0;
    }
  };

  const getStepName = (step: WorkflowStep) => {
    switch (step) {
      case 'upload': return 'Configuration';
      case 'scraping': return 'Scraping & Analyse';
      case 'suggestions': return 'Suggestions IA';
      case 'preview': return 'Preview & Sélection';
      case 'vibe': return 'Vibe Coding';
      case 'code': return 'Génération Code';
      default: return step;
    }
  };

  return (
    <DashboardLayout>
      <ABTestErrorBoundary>
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Générateur de Tests A/B
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Workflow complet : Upload → Vault → Scraping → Suggestions → Preview → Vibe Coding → Code
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Étape {['upload', 'scraping', 'suggestions', 'preview', 'vibe', 'code'].indexOf(currentStep) + 1} sur 6</span>
              <span>{getStepName(currentStep)}</span>
            </div>
            <Progress value={getStepProgress()} className="h-2" />
            
            {/* Step badges */}
            <div className="flex justify-between">
              {(['upload', 'scraping', 'suggestions', 'preview', 'vibe', 'code'] as WorkflowStep[]).map((step, index) => (
                <Badge 
                  key={step}
                  variant={currentStep === step ? 'default' : 
                           ['upload', 'scraping', 'suggestions', 'preview', 'vibe', 'code'].indexOf(currentStep) > index ? 'secondary' : 'outline'}
                  className="text-xs"
                >
                  {getStepName(step)}
                </Badge>
              ))}
            </div>
          </div>

          {/* Step Content */}
          {currentStep === 'upload' && (
            <ABTestWorkflowStarter onStartWorkflow={handleWorkflowStart} />
          )}

          {currentStep === 'scraping' && (
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary" />
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold">Analyse en cours...</h3>
                <p className="text-muted-foreground">
                  Scraping professionnel avec Firecrawl pour contournement des protections
                </p>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Extraction du contenu HTML complet</p>
                <p>• Analyse des styles CSS appliqués</p>
                <p>• Détection des éléments interactifs</p>
                <p>• Génération des sélecteurs optimaux</p>
              </div>
            </div>
          )}

          {currentStep === 'suggestions' && processedData && (
            <ABTestSuggestions 
              data={{
                pageUrl: processedData.workflowData.pageUrl,
                goalType: processedData.workflowData.goalType,
                analysisMode: 'enhanced',
                scrapedData: processedData.scrapedData,
                businessContext: processedData.workflowData.businessContext,
                currentPain: processedData.workflowData.currentPain,
                useVaultKnowledge: processedData.workflowData.useVaultKnowledge,
                selectedVaultFiles: processedData.workflowData.selectedVaultFiles,
                uploadedFiles: processedData.workflowData.uploadedFiles,
                workspace: currentWorkspace,
                user: user,
                timestamp: Date.now()
              }}
              onSuggestionSelected={handleSuggestionSelected as any}
            />
          )}

          {currentStep === 'preview' && selectedSuggestion && processedData?.scrapedData && (
            <SuggestionPreview
              suggestion={selectedSuggestion}
              scrapedData={processedData.scrapedData}
              onBackToSuggestions={handleBackToSuggestions}
              onStartVibeCoding={handleStartVibeCoding}
            />
          )}

          {currentStep === 'vibe' && processedData?.scrapedData && (
            <LivePreviewWithVibe
              scrapedData={processedData.scrapedData}
              onCodeGenerated={handleVibeCodeGenerated}
              initialModifications={vibeInitialModifications}
              suggestionContext={vibeSuggestionContext as any}
            />
          )}

          {currentStep === 'code' && selectedSuggestion && (
            <ABTestCodeGenerator
              suggestion={selectedSuggestion}
              data={processedData}
              onCodeGenerated={handleCodeGenerated}
              onBack={() => setCurrentStep('vibe')}
            />
          )}
        </div>
      </ABTestErrorBoundary>
    </DashboardLayout>
  );
};

export default ABTestGenerator;