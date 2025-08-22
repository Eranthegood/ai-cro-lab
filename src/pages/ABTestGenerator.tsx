import React, { useState } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ABTestCreator } from "@/components/ab-testing/ABTestCreator";
import { ABTestSuggestions } from "@/components/ab-testing/ABTestSuggestions";
import { ABTestCodeGenerator } from "@/components/ab-testing/ABTestCodeGenerator";
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
      <div className="p-6 max-w-7xl mx-auto">
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
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div className={`flex items-center gap-2 ${currentStep === 'upload' ? 'text-primary' : (currentStep === 'suggestions' || currentStep === 'code') ? 'text-success' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                currentStep === 'upload' ? 'border-primary bg-primary/10' : 
                (currentStep === 'suggestions' || currentStep === 'code') ? 'border-success bg-success text-success-foreground' : 
                'border-muted-foreground/30'
              }`}>
                {(currentStep === 'suggestions' || currentStep === 'code') ? '✓' : '1'}
              </div>
              <span className="text-sm font-medium">Upload</span>
            </div>
            
            <div className={`h-px flex-1 mx-4 ${currentStep === 'suggestions' || currentStep === 'code' ? 'bg-success' : 'bg-muted-foreground/30'}`} />
            
            <div className={`flex items-center gap-2 ${currentStep === 'suggestions' ? 'text-primary' : currentStep === 'code' ? 'text-success' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                currentStep === 'suggestions' ? 'border-primary bg-primary/10' : 
                currentStep === 'code' ? 'border-success bg-success text-success-foreground' : 
                'border-muted-foreground/30'
              }`}>
                {currentStep === 'code' ? '✓' : '2'}
              </div>
              <span className="text-sm font-medium">Analyze</span>
            </div>
            
            <div className={`h-px flex-1 mx-4 ${currentStep === 'code' ? 'bg-success' : 'bg-muted-foreground/30'}`} />
            
            <div className={`flex items-center gap-2 ${currentStep === 'code' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                currentStep === 'code' ? 'border-primary bg-primary/10' : 'border-muted-foreground/30'
              }`}>
                3
              </div>
              <span className="text-sm font-medium">Generate</span>
            </div>
          </div>
        </div>

        {currentStep === 'upload' && (
          <ABTestCreator onDataUploaded={handleDataUploaded} />
        )}

        {currentStep === 'suggestions' && uploadedData && (
          <ABTestSuggestions 
            data={uploadedData} 
            onSuggestionSelected={handleSuggestionSelected}
            onBack={() => setCurrentStep('upload')}
          />
        )}

        {currentStep === 'code' && selectedSuggestion && (
          <ABTestCodeGenerator 
            suggestion={selectedSuggestion}
            data={uploadedData}
            onCodeGenerated={handleCodeGenerated}
            onBack={() => setCurrentStep('suggestions')}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default ABTestGenerator;