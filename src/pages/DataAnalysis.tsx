import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  FileText, 
  Zap, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  BarChart3,
  Target,
  Download,
  ChevronDown,
  Star,
  Activity
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DataAnalysis = () => {
  const [selectedPrompt, setSelectedPrompt] = useState("expert-cro-v1");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'uploading' | 'processing' | 'complete'>('idle');

  const promptModels = [
    {
      id: "expert-cro-v1",
      name: "Expert CRO v1",
      description: "10+ years CRO experience, e-commerce focused",
      accuracy: 87,
      satisfaction: 94,
      responseTime: "2.3s"
    },
    {
      id: "data-scientist-v2",
      name: "Data Scientist v2",
      description: "Statistical analysis with behavioral insights",
      accuracy: 82,
      satisfaction: 89,
      responseTime: "3.1s"
    },
    {
      id: "behavioral-analyst-v1",
      name: "Behavioral Analyst v1",
      description: "Psychology-focused UX optimization",
      accuracy: 78,
      satisfaction: 91,
      responseTime: "1.8s"
    }
  ];

  const mockInsights = [
    {
      id: 1,
      title: "Checkout Button Enhancement",
      priority: "Critical",
      score: 94,
      description: "Primary CTA button has 34% lower engagement than industry average. Button placement and design need optimization.",
      source: "Heatmap Analysis",
      impact: "+23% conversion estimated",
      status: "ready"
    },
    {
      id: 2,
      title: "Navigation Menu Simplification",
      priority: "High",
      score: 87,
      description: "Users spend 2.3x longer on navigation with 45% abandonment. Reduce cognitive load with streamlined menu structure.",
      source: "Journey Analysis",
      impact: "+15% engagement estimated",
      status: "ready"
    },
    {
      id: 3,
      title: "Product Form Optimization",
      priority: "Medium",
      score: 73,
      description: "Form completion rate 28% below benchmark. Field validation and progressive disclosure needed.",
      source: "Form Analytics",
      impact: "+12% completion estimated",
      status: "review"
    }
  ];

  const currentPrompt = promptModels.find(p => p.id === selectedPrompt);

  const simulateAnalysis = () => {
    setAnalysisStatus('uploading');
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setAnalysisStatus('processing'), 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="border-b border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Data Analysis</h1>
            <p className="text-muted-foreground mt-1">
              Upload Contentsquare data and generate CRO insights with AI analysis.
            </p>
          </div>

          {/* Prompt Model Selector */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Analysis powered by</p>
              <Select value={selectedPrompt} onValueChange={setSelectedPrompt}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {promptModels.map(prompt => (
                    <SelectItem key={prompt.id} value={prompt.id}>
                      <div className="flex items-center justify-between w-full">
                        <div className="text-left">
                          <div className="font-medium">{prompt.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {prompt.accuracy}% accuracy • {prompt.responseTime} avg
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Current Prompt Info */}
        {currentPrompt && (
          <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-success"></div>
                <div>
                  <p className="font-medium text-sm">{currentPrompt.name}</p>
                  <p className="text-xs text-muted-foreground">{currentPrompt.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span>{currentPrompt.accuracy}% accuracy</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Activity className="w-3 h-3 text-primary" />
                  <span>{currentPrompt.responseTime} response</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="w-5 h-5" />
              <span>Upload Contentsquare Data</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analysisStatus === 'idle' && (
              <div 
                className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={simulateAnalysis}
              >
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Drop files here or click to browse</h3>
                <p className="text-muted-foreground mb-4">
                  Support: CSV, PDF, JSON files • Multiple files allowed
                </p>
                <Button>Choose Files</Button>
              </div>
            )}

            {(analysisStatus === 'uploading' || analysisStatus === 'processing') && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 border border-border rounded-lg">
                  <FileText className="w-8 h-8 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium">contentsquare-heatmap-data.csv</p>
                    <p className="text-sm text-muted-foreground">2.4 MB • Processing...</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Analysis Progress</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-xs text-muted-foreground">
                    {analysisStatus === 'uploading' ? 'Uploading and parsing data...' : 
                     'Analyzing behavioral patterns with Expert CRO v1...'}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {mockInsights.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Generated Insights</h2>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">
                  {mockInsights.length} insights found
                </Badge>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {mockInsights.map((insight) => (
                <Card key={insight.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{insight.title}</h3>
                        <Badge 
                          variant={insight.priority === 'Critical' ? 'destructive' : 
                                  insight.priority === 'High' ? 'default' : 'secondary'}
                        >
                          {insight.priority}
                        </Badge>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Star className="w-3 h-3" />
                          <span>Score: {insight.score}/100</span>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground mb-3">{insight.description}</p>
                      
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="flex items-center space-x-1">
                          <BarChart3 className="w-4 h-4 text-muted-foreground" />
                          <span>Source: {insight.source}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="w-4 h-4 text-success" />
                          <span className="text-success font-medium">{insight.impact}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                      <Button size="sm">
                        Generate Code
                      </Button>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>

                  {insight.status === 'ready' && (
                    <div className="flex items-center space-x-2 p-2 bg-success/10 rounded-lg border border-success/20">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span className="text-sm text-success font-medium">Ready for code generation</span>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DataAnalysis;