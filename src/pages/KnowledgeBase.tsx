import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Upload, 
  Palette, 
  Users, 
  Briefcase, 
  Brain, 
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Plus,
  MoreVertical
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

const KnowledgeBase = () => {
  const knowledgeCategories = [
    {
      id: "design-system",
      title: "Design System",
      icon: Palette,
      status: "complete",
      progress: 95,
      files: 5,
      totalSize: "2.1MB",
      lastUpdated: "2 days ago",
      files_list: [
        { name: "design-tokens.json", size: "147KB", type: "JSON" },
        { name: "component-library.md", size: "89KB", type: "Markdown" },
        { name: "brand-guidelines.pdf", size: "1.8MB", type: "PDF" }
      ]
    },
    {
      id: "business-context",
      title: "Business Intelligence",
      icon: Briefcase,
      status: "complete",
      progress: 87,
      files: 8,
      totalSize: "4.2MB",
      lastUpdated: "1 week ago",
      files_list: [
        { name: "business-model-2025.pdf", size: "1.2MB", type: "PDF" },
        { name: "competitor-analysis.xlsx", size: "890KB", type: "Excel" },
        { name: "market-research.pdf", size: "2.1MB", type: "PDF" }
      ]
    },
    {
      id: "user-research",
      title: "User Research",
      icon: Users,
      status: "incomplete",
      progress: 23,
      files: 3,
      totalSize: "1.8MB",
      lastUpdated: "3 weeks ago",
      files_list: [
        { name: "user-personas.pdf", size: "567KB", type: "PDF" },
        { name: "user-interviews.docx", size: "234KB", type: "Word" },
        { name: "usability-study.pdf", size: "1MB", type: "PDF" }
      ]
    }
  ];

  const aiProcessingStatus = {
    overallScore: 847,
    maxScore: 1000,
    totalFiles: 19,
    processedFiles: 16
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'processing':
        return <RefreshCw className="w-4 h-4 text-primary animate-spin" />;
      case 'incomplete':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <Badge variant="secondary" className="bg-success/10 text-success">Complete</Badge>;
      case 'processing':
        return <Badge variant="default">Processing</Badge>;
      case 'incomplete':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Incomplete</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="border-b border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Knowledge Base</h1>
            <p className="text-muted-foreground mt-1">
              Enhance AI analysis with your company's context, design system, and business intelligence.
            </p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Knowledge
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* AI Knowledge Score */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-primary" />
                <span>AI Knowledge Score</span>
              </CardTitle>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retrain AI
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground mb-2">
                  {aiProcessingStatus.overallScore}/{aiProcessingStatus.maxScore}
                  <span className="text-2xl text-primary ml-2">⭐</span>
                </div>
                <p className="text-muted-foreground">
                  {aiProcessingStatus.processedFiles}/{aiProcessingStatus.totalFiles} files processed
                </p>
                <div className="w-full max-w-md mx-auto mt-4">
                  <Progress 
                    value={(aiProcessingStatus.overallScore / aiProcessingStatus.maxScore) * 100} 
                    className="h-3"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">Analysis Quality</p>
                  <p className="text-lg font-semibold text-success">Excellent</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">Context Coverage</p>
                  <p className="text-lg font-semibold text-foreground">84%</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">Last Update</p>
                  <p className="text-lg font-semibold text-foreground">2 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Knowledge Categories */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Knowledge Categories</h2>
          
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {knowledgeCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Card key={category.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{category.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {category.files} files • {category.totalSize}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(category.status)}
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreVertical className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      {getStatusBadge(category.status)}
                      <span className="text-sm text-muted-foreground">
                        Updated {category.lastUpdated}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Processing Status</span>
                        <span>{category.progress}% complete</span>
                      </div>
                      <Progress value={category.progress} className="w-full" />
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Recent Files:</h4>
                      {category.files_list.slice(0, 2).map((file, index) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-3 h-3 text-muted-foreground" />
                            <span className="truncate">{file.name}</span>
                          </div>
                          <span className="text-muted-foreground">{file.size}</span>
                        </div>
                      ))}
                      {category.files_list.length > 2 && (
                        <p className="text-xs text-muted-foreground">
                          +{category.files_list.length - 2} more files
                        </p>
                      )}
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Upload className="w-3 h-3 mr-1" />
                        Add Files
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        View All
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Processing Recommendations */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recommendations to Improve AI Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">Incomplete User Research</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Upload more user research documents to improve persona-driven insights. 
                    Consider adding user journey maps and survey results.
                  </p>
                </div>
                <Button variant="outline" size="sm" className="ml-auto">
                  Upload Files
                </Button>
              </div>

              <div className="flex items-start space-x-3 p-4 border border-blue-200 rounded-lg bg-blue-50">
                <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">Add Technical Documentation</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Include API documentation and technical constraints to generate more accurate, 
                    implementable code recommendations.
                  </p>
                </div>
                <Button variant="outline" size="sm" className="ml-auto">
                  Add Docs
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default KnowledgeBase;