import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StreamingChatInterface } from "@/components/knowledge-vault/StreamingChatInterface";
import { Brain, Lightbulb, Zap, TrendingUp } from "lucide-react";
import { useTrackEvent } from "@/hooks/useLaunchDarkly";

const InsightsVariantA = () => {
  const trackEvent = useTrackEvent();

  const features = [
    {
      icon: Brain,
      title: "Contextual Analysis",
      description: "AI analyzes your uploaded documents and project context to provide relevant insights."
    },
    {
      icon: Lightbulb,
      title: "Intelligent Parsing", 
      description: "Advanced parsing extracts key information and relationships from your knowledge base."
    },
    {
      icon: Zap,
      title: "Real-time Responses",
      description: "Get instant AI-powered answers with streaming responses for seamless interaction."
    },
    {
      icon: TrendingUp,
      title: "Performance Insights",
      description: "Discover patterns and optimization opportunities in your data and workflows."
    }
  ];

  const handleFeatureClick = (featureTitle: string) => {
    trackEvent('insights_feature_clicked', {
      variant: 'A',
      feature: featureTitle,
      timestamp: Date.now()
    });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-3xl font-light text-foreground">AI Insights</h1>
          <Badge variant="secondary" className="text-xs">
            Version A
          </Badge>
        </div>
        <p className="text-muted-foreground text-lg">
          Explore intelligent insights powered by your knowledge vault
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <Card 
              key={index} 
              className="transition-all duration-200 hover:shadow-lg cursor-pointer"
              onClick={() => handleFeatureClick(feature.title)}
            >
              <CardHeader className="pb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <IconComponent className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-lg font-medium">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chat Interface */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Assistant
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Ask questions about your knowledge base and get intelligent insights
          </p>
        </CardHeader>
        <CardContent>
          <StreamingChatInterface />
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How AI Insights Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <h4 className="font-medium text-sm">Contextual Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  The AI analyzes your uploaded documents, project files, and knowledge base to understand context.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <h4 className="font-medium text-sm">Intelligent Parsing</h4>
                <p className="text-sm text-muted-foreground">
                  Advanced parsing algorithms extract key information, relationships, and patterns from your data.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <h4 className="font-medium text-sm">Enriched Responses</h4>
                <p className="text-sm text-muted-foreground">
                  Get comprehensive answers that combine your knowledge base with AI insights for actionable results.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InsightsVariantA;