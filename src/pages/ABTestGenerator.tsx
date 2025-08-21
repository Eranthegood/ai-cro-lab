import React, { useState } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ABTestCreator } from "@/components/ab-testing/ABTestCreator";
import { ABTestSuggestions } from "@/components/ab-testing/ABTestSuggestions";
import { ABTestCodeGenerator } from "@/components/ab-testing/ABTestCodeGenerator";
import ABTestErrorBoundary from "@/components/ab-testing/ErrorBoundary";
import { Upload, Brain, Code, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ABTestGenerator = () => {
  const [currentStep, setCurrentStep] = useState<'upload' | 'suggestions' | 'code'>('upload');
  const [uploadedData, setUploadedData] = useState<any>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<any>(null);
  const [generatedCode, setGeneratedCode] = useState<string>('');

  const handleDataUploaded = (data: any) => {
    setUploadedData(data);
    setCurrentStep('suggestions');
  };

  const handleSuggestionSelected = (suggestion: any) => {
    setSelectedSuggestion(suggestion);
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

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <div className={`flex items-center gap-3 transition-all duration-500 ${currentStep === 'upload' ? 'text-primary' : (currentStep === 'suggestions' || currentStep === 'code') ? 'text-success' : 'text-muted-foreground'}`}>
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all duration-500 transform hover:scale-105 ${
                currentStep === 'upload' ? 'border-primary bg-primary/10 animate-pulse' : 
                (currentStep === 'suggestions' || currentStep === 'code') ? 'border-success bg-success text-success-foreground' : 
                'border-muted-foreground/30'
              }`}>
                {(currentStep === 'suggestions' || currentStep === 'code') ? 
                  <span className="animate-fade-in">✓</span> : 
                  <span className={currentStep === 'upload' ? 'animate-bounce' : ''}>1</span>
                }
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Setup</span>
                <span className="text-xs text-muted-foreground">Configure test</span>
              </div>
            </div>
            
            <div className={`h-px flex-1 mx-4 transition-all duration-700 ${currentStep === 'suggestions' || currentStep === 'code' ? 'bg-success animate-pulse' : 'bg-muted-foreground/30'}`} />
            
            <div className={`flex items-center gap-3 transition-all duration-500 ${currentStep === 'suggestions' ? 'text-primary' : currentStep === 'code' ? 'text-success' : 'text-muted-foreground'}`}>
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all duration-500 transform hover:scale-105 ${
                currentStep === 'suggestions' ? 'border-primary bg-primary/10 animate-pulse' : 
                currentStep === 'code' ? 'border-success bg-success text-success-foreground' : 
                'border-muted-foreground/30'
              }`}>
                {currentStep === 'code' ? 
                  <span className="animate-fade-in">✓</span> : 
                  <span className={currentStep === 'suggestions' ? 'animate-bounce' : ''}>2</span>
                }
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Analyze</span>
                <span className="text-xs text-muted-foreground">AI suggestions</span>
              </div>
            </div>
            
            <div className={`h-px flex-1 mx-4 transition-all duration-700 ${currentStep === 'code' ? 'bg-success animate-pulse' : 'bg-muted-foreground/30'}`} />
            
            <div className={`flex items-center gap-3 transition-all duration-500 ${currentStep === 'code' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all duration-500 transform hover:scale-105 ${
                currentStep === 'code' ? 'border-primary bg-primary/10 animate-pulse' : 'border-muted-foreground/30'
              }`}>
                <span className={currentStep === 'code' ? 'animate-bounce' : ''}>3</span>
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
            <ABTestCreator onDataUploaded={handleDataUploaded} />
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

        {currentStep === 'code' && selectedSuggestion && (
          <div className="animate-fade-in">
            <ABTestCodeGenerator 
              suggestion={selectedSuggestion}
              data={uploadedData}
              onCodeGenerated={handleCodeGenerated}
              onBack={() => setCurrentStep('suggestions')}
            />
          </div>
        )}
        </div>
      </ABTestErrorBoundary>
    </DashboardLayout>
  );
};

export default ABTestGenerator;