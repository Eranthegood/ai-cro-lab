import React, { useState } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ABTestCreator } from "@/components/ab-testing/ABTestCreator";
import { EnhancedABTestCreator } from "@/components/ab-testing/EnhancedABTestCreator";
import { ABTestSuggestions } from "@/components/ab-testing/ABTestSuggestions";
import { ABTestCodeGenerator } from "@/components/ab-testing/ABTestCodeGenerator";
import { SuggestionPreview } from "@/components/ab-testing/SuggestionPreview";
import { LivePreviewWithVibe } from "@/components/ab-testing/LivePreviewWithVibe";
import ABTestErrorBoundary from "@/components/ab-testing/ErrorBoundary";
import { Upload, Brain, Code, Zap, Wand2, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ABTestGenerator = () => {
  const [currentStep, setCurrentStep] = useState<'upload' | 'suggestions' | 'preview' | 'vibe' | 'code'>('upload');
  const [uploadedData, setUploadedData] = useState<any>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<any>(null);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [analysisMode, setAnalysisMode] = useState<'enhanced' | 'classic'>('enhanced');
  const [vibeInitialModifications, setVibeInitialModifications] = useState<any>(null);
  const [vibeSuggestionContext, setVibeSuggestionContext] = useState<any>(null);

  const handleAnalysisComplete = (data: any) => {
    setUploadedData(data);
    
    // If enhanced mode with generated code, skip to code step
    if (data.analysisMode === 'enhanced' && data.generatedCode) {
      setGeneratedCode(data.generatedCode);
      setCurrentStep('code');
    } else {
      setCurrentStep('suggestions');
    }
  };

  const handleSuggestionSelected = (suggestion: any) => {
    setSelectedSuggestion(suggestion);
    // Go to preview step instead of directly to code
    setCurrentStep('preview');
  };

  const handleBackToSuggestions = () => {
    setCurrentStep('suggestions');
    setSelectedSuggestion(null);
  };

  const handleStartVibeCoding = (initialModifications: any, suggestionContext: any) => {
    setVibeInitialModifications(initialModifications);
    setVibeSuggestionContext(suggestionContext);
    setCurrentStep('vibe');
  };

  const handleVibeCodeGenerated = (code: string) => {
    setGeneratedCode(code);
    setCurrentStep('code');
  };

  const handleCodeGenerated = (code: string) => {
    setGeneratedCode(code);
  };

  return (
    <DashboardLayout>
      <ABTestErrorBoundary
        onBack={() => setCurrentStep('upload')}
        onRetry={() => window.location.reload()}
      >
        <div className="p-6 max-w-7xl mx-auto animate-fade-in">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              🎯 AB Test Generator
            </h1>
            <p className="text-muted-foreground mt-2">
              Transformez vos données en tests AB prêts à déployer avec l'intelligence artificielle
            </p>
          </div>

        {/* Progress Steps - Updated to include Preview */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <div className={`flex items-center gap-3 transition-all duration-500 ${currentStep === 'upload' ? 'text-primary' : 'text-success'}`}>
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all duration-500 transform hover:scale-105 ${
                currentStep === 'upload' ? 'border-primary bg-primary/10 animate-pulse' : 
                'border-success bg-success text-success-foreground'
              }`}>
                {currentStep !== 'upload' ? 
                  <span className="animate-fade-in">✓</span> : 
                  <span className={currentStep === 'upload' ? 'animate-bounce' : ''}>1</span>
                }
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Setup</span>
                <span className="text-xs text-muted-foreground">Configure test</span>
              </div>
            </div>
            
            <div className={`h-px flex-1 mx-2 transition-all duration-700 ${currentStep === 'suggestions' || currentStep === 'preview' || currentStep === 'vibe' || currentStep === 'code' ? 'bg-success animate-pulse' : 'bg-muted-foreground/30'}`} />
            
            <div className={`flex items-center gap-3 transition-all duration-500 ${currentStep === 'suggestions' ? 'text-primary' : (currentStep === 'preview' || currentStep === 'vibe' || currentStep === 'code') ? 'text-success' : 'text-muted-foreground'}`}>
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all duration-500 transform hover:scale-105 ${
                currentStep === 'suggestions' ? 'border-primary bg-primary/10 animate-pulse' : 
                (currentStep === 'preview' || currentStep === 'vibe' || currentStep === 'code') ? 'border-success bg-success text-success-foreground' : 
                'border-muted-foreground/30'
              }`}>
                {(currentStep === 'preview' || currentStep === 'vibe' || currentStep === 'code') ? 
                  <span className="animate-fade-in">✓</span> : 
                  <span className={currentStep === 'suggestions' ? 'animate-bounce' : ''}>2</span>
                }
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Analyze</span>
                <span className="text-xs text-muted-foreground">AI suggestions</span>
              </div>
            </div>
            
            <div className={`h-px flex-1 mx-2 transition-all duration-700 ${currentStep === 'preview' || currentStep === 'vibe' || currentStep === 'code' ? 'bg-success animate-pulse' : 'bg-muted-foreground/30'}`} />
            
            <div className={`flex items-center gap-3 transition-all duration-500 ${currentStep === 'preview' ? 'text-primary' : (currentStep === 'vibe' || currentStep === 'code') ? 'text-success' : 'text-muted-foreground'}`}>
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all duration-500 transform hover:scale-105 ${
                currentStep === 'preview' ? 'border-primary bg-primary/10 animate-pulse' : 
                (currentStep === 'vibe' || currentStep === 'code') ? 'border-success bg-success text-success-foreground' : 
                'border-muted-foreground/30'
              }`}>
                {(currentStep === 'vibe' || currentStep === 'code') ? 
                  <span className="animate-fade-in">✓</span> : 
                  <span className={currentStep === 'preview' ? 'animate-bounce' : ''}>3</span>
                }
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Preview</span>
                <span className="text-xs text-muted-foreground">View changes</span>
              </div>
            </div>
            
            <div className={`h-px flex-1 mx-2 transition-all duration-700 ${currentStep === 'vibe' || currentStep === 'code' ? 'bg-success animate-pulse' : 'bg-muted-foreground/30'}`} />
            
            <div className={`flex items-center gap-3 transition-all duration-500 ${currentStep === 'vibe' ? 'text-primary' : currentStep === 'code' ? 'text-success' : 'text-muted-foreground'}`}>
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all duration-500 transform hover:scale-105 ${
                currentStep === 'vibe' ? 'border-primary bg-primary/10 animate-pulse' : 
                currentStep === 'code' ? 'border-success bg-success text-success-foreground' : 
                'border-muted-foreground/30'
              }`}>
                {currentStep === 'code' ? 
                  <span className="animate-fade-in">✓</span> : 
                  <span className={currentStep === 'vibe' ? 'animate-bounce' : ''}>4</span>
                }
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Vibe Code</span>
                <span className="text-xs text-muted-foreground">Refine & tune</span>
              </div>
            </div>
            
            <div className={`h-px flex-1 mx-2 transition-all duration-700 ${currentStep === 'code' ? 'bg-success animate-pulse' : 'bg-muted-foreground/30'}`} />
            
            <div className={`flex items-center gap-3 transition-all duration-500 ${currentStep === 'code' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all duration-500 transform hover:scale-105 ${
                currentStep === 'code' ? 'border-primary bg-primary/10 animate-pulse' : 'border-muted-foreground/30'
              }`}>
                <span className={currentStep === 'code' ? 'animate-bounce' : ''}>5</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Generate</span>
                <span className="text-xs text-muted-foreground">Export code</span>
              </div>
            </div>
          </div>
        </div>

        {currentStep === 'upload' && (
          <div className="animate-slide-in-up">
            <Tabs value={analysisMode} onValueChange={(value) => setAnalysisMode(value as 'enhanced' | 'classic')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="enhanced" className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4" />
                  Enhanced (Vibe Coding)
                </TabsTrigger>
                <TabsTrigger value="classic" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Classic Mode
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="enhanced">
                <EnhancedABTestCreator onAnalysisComplete={handleAnalysisComplete} />
              </TabsContent>
              
              <TabsContent value="classic">
                <ABTestCreator onDataUploaded={handleAnalysisComplete} />
              </TabsContent>
            </Tabs>
          </div>
        )}

        {currentStep === 'suggestions' && uploadedData && (
          <div className="animate-scale-up">
            <ABTestSuggestions 
              data={uploadedData} 
              onSuggestionSelected={handleSuggestionSelected}
              onBack={() => setCurrentStep('upload')}
            />
          </div>
        )}

        {currentStep === 'preview' && selectedSuggestion && uploadedData && (
          <div className="animate-scale-up">
            <SuggestionPreview
              suggestion={selectedSuggestion}
              scrapedData={uploadedData.scrapedData}
              onBackToSuggestions={handleBackToSuggestions}
              onStartVibeCoding={handleStartVibeCoding}
            />
          </div>
        )}

        {currentStep === 'vibe' && uploadedData && vibeInitialModifications && (
          <div className="animate-fade-in">
            <LivePreviewWithVibe
              scrapedData={uploadedData.scrapedData}
              onCodeGenerated={handleVibeCodeGenerated}
              initialModifications={vibeInitialModifications}
              suggestionContext={vibeSuggestionContext}
            />
          </div>
        )}

        {currentStep === 'code' && selectedSuggestion && (
          <div className="animate-fade-in">
            <ABTestCodeGenerator 
              suggestion={selectedSuggestion}
              data={uploadedData}
              onCodeGenerated={handleCodeGenerated}
              onBack={() => setCurrentStep('vibe')}
            />
          </div>
        )}
        </div>
      </ABTestErrorBoundary>
    </DashboardLayout>
  );
};

export default ABTestGenerator;