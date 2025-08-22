import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Wand2, AlertCircle, Loader2, Zap, Eye, Monitor } from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";
import { toast } from "@/hooks/use-toast";
import { scrapingService, ScrapedSiteData } from "@/services/scrapingService";
import { screenshotService } from "@/services/screenshotService";
import { LivePreviewWithVibe } from "./LivePreviewWithVibe";

interface EnhancedABTestCreatorProps {
  onAnalysisComplete: (data: any) => void;
}

type AnalysisMode = 'enhanced' | 'classic';

export const EnhancedABTestCreator: React.FC<EnhancedABTestCreatorProps> = ({ 
  onAnalysisComplete 
}) => {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  
  // Form state
  const [pageUrl, setPageUrl] = useState('');
  const [goalType, setGoalType] = useState('conversion');
  
  // Analysis state
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('enhanced');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scrapedData, setScrapedData] = useState<ScrapedSiteData | null>(null);
  const [analysisStep, setAnalysisStep] = useState<'input' | 'scraping' | 'preview'>('input');
  
  // Generation state
  const [generatedCode, setGeneratedCode] = useState('');

  const validateUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol.startsWith('http');
    } catch {
      return false;
    }
  };

  const handleEnhancedAnalysis = async () => {
    if (!pageUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a website URL to analyze",
        variant: "destructive",
      });
      return;
    }

    if (!validateUrl(pageUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL (e.g., https://example.com)",
        variant: "destructive",
      });
      return;
    }

    if (!currentWorkspace || !user) {
      toast({
        title: "Authentication Error",
        description: "Please ensure you're logged in and have a workspace selected",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep('scraping');

    try {
      toast({
        title: "Enhanced Analysis Started",
        description: "Scraping website content for live preview...",
      });

      // Step 1: Scrape the website
      const scrapedSite = await scrapingService.scrapeSite(pageUrl, {
        includeStyles: true,
        includeScripts: false,
        analyzeContent: true,
        generateSelectors: true
      });

      setScrapedData(scrapedSite);
      setAnalysisStep('preview');

      toast({
        title: "Website Scraped Successfully!",
        description: `${scrapedSite.targetableElements.length} editable elements detected`,
      });

    } catch (error: any) {
      console.error('Enhanced analysis failed:', error);
      
      // Fallback to classic mode
      toast({
        title: "Enhanced Mode Failed",
        description: "Falling back to classic analysis mode...",
        variant: "destructive",
      });
      
      setAnalysisMode('classic');
      await handleClassicAnalysis();
      
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClassicAnalysis = async () => {
    try {
      // Use existing screenshot-based analysis
      const screenshot = await screenshotService.captureScreenshot(pageUrl, {
        device: 'desktop',
        width: 1920,
        height: 1080,
        fullPage: true,
        delay: 2000
      });

      const analysisData = {
        pageUrl: pageUrl.trim(),
        goalType,
        analysisMode: 'classic',
        screenshot: {
          imageUrl: screenshot.imageUrl,
          visualAnalysis: screenshot.visualAnalysis,
          metadata: screenshot.metadata
        },
        workspace: currentWorkspace,
        user: user,
        timestamp: Date.now(),
        analysisId: `classic_${Date.now()}`
      };

      onAnalysisComplete(analysisData);
      
    } catch (error: any) {
      console.error('Classic analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Unable to analyze the website. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCodeGenerated = (code: string) => {
    setGeneratedCode(code);
    
    const enhancedData = {
      pageUrl: pageUrl.trim(),
      goalType,
      analysisMode: 'enhanced',
      scrapedData,
      generatedCode: code,
      workspace: currentWorkspace,
      user: user,
      timestamp: Date.now(),
      analysisId: `enhanced_${Date.now()}`
    };

    onAnalysisComplete(enhancedData);
  };

  const resetAnalysis = () => {
    setAnalysisStep('input');
    setScrapedData(null);
    setGeneratedCode('');
    setAnalysisMode('enhanced');
  };

  if (analysisStep === 'preview' && scrapedData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Live Preview & Vibe Coding</h2>
            <p className="text-muted-foreground">Click elements to edit with natural language</p>
          </div>
          <Button variant="outline" onClick={resetAnalysis}>
            Start New Analysis
          </Button>
        </div>
        
        <LivePreviewWithVibe 
          scrapedData={scrapedData}
          onCodeGenerated={handleCodeGenerated}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Choose Analysis Mode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={analysisMode} onValueChange={(value) => setAnalysisMode(value as AnalysisMode)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="enhanced" className="flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                Enhanced (Vibe Coding)
              </TabsTrigger>
              <TabsTrigger value="classic" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Classic (Screenshot)
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="enhanced" className="mt-4">
              <Alert>
                <Wand2 className="h-4 w-4" />
                <AlertDescription>
                  <strong>Enhanced Mode:</strong> Scrapes website content for live preview and Vibe Coding. 
                  Edit elements with natural language prompts in real-time.
                </AlertDescription>
              </Alert>
            </TabsContent>
            
            <TabsContent value="classic" className="mt-4">
              <Alert>
                <Monitor className="h-4 w-4" />
                <AlertDescription>
                  <strong>Classic Mode:</strong> Captures screenshot for AI analysis and suggestions. 
                  Generates static code recommendations.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* URL Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Website Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="page-url">Website URL *</Label>
              <Input
                id="page-url"
                value={pageUrl}
                onChange={(e) => setPageUrl(e.target.value)}
                placeholder="https://example.com"
                required
                disabled={isAnalyzing}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="goal-type">Optimization Goal</Label>
              <Select value={goalType} onValueChange={setGoalType} disabled={isAnalyzing}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conversion">🎯 Increase Conversion Rate</SelectItem>
                  <SelectItem value="cart">🛒 Reduce Cart Abandonment</SelectItem>
                  <SelectItem value="form">📝 Improve Form Completion</SelectItem>
                  <SelectItem value="ctr">👆 Increase Click-Through Rate</SelectItem>
                  <SelectItem value="engagement">⏱️ Improve Engagement</SelectItem>
                  <SelectItem value="revenue">💰 Increase Revenue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Analysis Status */}
          {analysisStep === 'scraping' && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Scraping website content and analyzing structure...
              </AlertDescription>
            </Alert>
          )}

          {/* Mode-specific Actions */}
          <div className="flex gap-3">
            {analysisMode === 'enhanced' ? (
              <Button 
                onClick={handleEnhancedAnalysis}
                disabled={isAnalyzing || !pageUrl.trim()}
                className="flex-1"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Scraping Website...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Start Enhanced Analysis
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={handleClassicAnalysis}
                disabled={isAnalyzing || !pageUrl.trim()}
                className="flex-1"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Capturing Screenshot...
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Start Classic Analysis
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Feature Badges */}
          <div className="flex flex-wrap gap-2">
            {analysisMode === 'enhanced' ? (
              <>
                <Badge variant="secondary">Live Preview</Badge>
                <Badge variant="secondary">Interactive Editing</Badge>
                <Badge variant="secondary">Vibe Coding</Badge>
                <Badge variant="secondary">Real-time Modifications</Badge>
              </>
            ) : (
              <>
                <Badge variant="outline">Screenshot Analysis</Badge>
                <Badge variant="outline">AI Suggestions</Badge>
                <Badge variant="outline">Code Generation</Badge>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};