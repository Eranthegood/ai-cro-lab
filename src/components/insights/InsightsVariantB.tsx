import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StreamingChatInterface } from "@/components/knowledge-vault/StreamingChatInterface";
import { Bot, FileSearch, Rocket, BarChart3 } from "lucide-react";
import { useTrackEvent } from "@/hooks/useLaunchDarkly";

const InsightsVariantB = () => {
  const trackEvent = useTrackEvent();

  const handleGetStartedClick = () => {
    trackEvent('insights_get_started_clicked', {
      variant: 'B',
      timestamp: Date.now()
    });
  };

  const handleQuickActionClick = (action: string) => {
    trackEvent('insights_quick_action_clicked', {
      variant: 'B',
      action,
      timestamp: Date.now()
    });
  };

  return (
    <div className="p-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-6">
          <h1 className="text-4xl font-light text-foreground">AI Insights Dashboard</h1>
          <Badge variant="secondary" className="text-xs">
            Version B
          </Badge>
        </div>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Unlock the power of your knowledge vault with AI-driven insights and intelligent analysis
        </p>
        
        <Button 
          size="lg" 
          onClick={handleGetStartedClick}
          className="mb-8"
        >
          <Rocket className="w-5 h-5 mr-2" />
          Get Started with AI Insights
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="text-center hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => handleQuickActionClick('analyze_documents')}>
          <CardHeader className="pb-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <FileSearch className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-lg">Analyze Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Deep dive into your uploaded files and extract meaningful insights
            </p>
          </CardContent>
        </Card>

        <Card className="text-center hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => handleQuickActionClick('ask_ai')}>
          <CardHeader className="pb-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-lg">Ask AI Assistant</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Get instant answers and insights from your knowledge base
            </p>
          </CardContent>
        </Card>

        <Card className="text-center hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => handleQuickActionClick('view_analytics')}>
          <CardHeader className="pb-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-lg">View Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Explore patterns and trends in your data and interactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Chat Interface */}
      <Card className="mb-8">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Bot className="w-6 h-6" />
            Intelligent Assistant
          </CardTitle>
          <p className="text-muted-foreground">
            Start a conversation with your AI-powered knowledge assistant
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <StreamingChatInterface />
        </CardContent>
      </Card>

      {/* Process Overview - Simplified */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="font-semibold mb-2">Upload & Parse</h3>
            <p className="text-sm text-muted-foreground">
              AI automatically processes and understands your documents
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="font-semibold mb-2">Ask Questions</h3>
            <p className="text-sm text-muted-foreground">
              Interactive chat interface for natural conversations
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="font-semibold mb-2">Get Insights</h3>
            <p className="text-sm text-muted-foreground">
              Receive intelligent, context-aware responses instantly
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InsightsVariantB;