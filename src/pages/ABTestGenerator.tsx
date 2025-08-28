import React, { useState } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ABTestCreator } from "@/components/ab-testing/ABTestCreator";
import { ABTestSuggestions } from "@/components/ab-testing/ABTestSuggestions";
import { Upload, Brain } from 'lucide-react';

const ABTestGenerator = () => {
  const [currentStep, setCurrentStep] = useState<'upload' | 'suggestions'>('upload');
  const [uploadedData, setUploadedData] = useState<any>(null);

  const handleDataUploaded = (data: any) => {
    setUploadedData(data);
    setCurrentStep('suggestions');
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            🎯 AB Test Generator
          </h1>
          <p className="text-muted-foreground mt-2">
            Analysez vos données et obtenez des suggestions intelligentes pour vos tests AB
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center max-w-sm mx-auto">
            <div className={`flex items-center gap-2 ${currentStep === 'upload' ? 'text-primary' : currentStep === 'suggestions' ? 'text-success' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                currentStep === 'upload' ? 'border-primary bg-primary/10' : 
                currentStep === 'suggestions' ? 'border-success bg-success text-success-foreground' : 
                'border-muted-foreground/30'
              }`}>
                {currentStep === 'suggestions' ? '✓' : '1'}
              </div>
              <span className="text-sm font-medium">Upload</span>
            </div>
            
            <div className={`h-px flex-1 mx-4 ${currentStep === 'suggestions' ? 'bg-success' : 'bg-muted-foreground/30'}`} />
            
            <div className={`flex items-center gap-2 ${currentStep === 'suggestions' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                currentStep === 'suggestions' ? 'border-primary bg-primary/10' : 
                'border-muted-foreground/30'
              }`}>
                2
              </div>
              <span className="text-sm font-medium">Analyze</span>
            </div>
          </div>
        </div>

        {currentStep === 'upload' && (
          <ABTestCreator onDataUploaded={handleDataUploaded} />
        )}

        {currentStep === 'suggestions' && uploadedData && (
          <ABTestSuggestions 
            data={uploadedData} 
            onBack={() => setCurrentStep('upload')}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default ABTestGenerator;