import { useState } from "react";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Target,
  Brain,
  FileDown,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { JourneyStep, JourneyConnection } from "../../pages/JourneyMapper";

interface AnalyticsPanelProps {
  steps: JourneyStep[];
  connections: JourneyConnection[];
}

export const AnalyticsPanel = ({ steps, connections }: AnalyticsPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Calculate overall metrics
  const totalTraffic = steps.reduce((sum, step) => sum + (step.data.trafficVolume || 0), 0);
  const avgConversionRate = steps.length > 0 
    ? steps.reduce((sum, step) => sum + (step.data.conversionRate || 0), 0) / steps.length 
    : 0;
  const estimatedRevenue = Math.floor(totalTraffic * (avgConversionRate / 100) * 50); // Assuming $50 per conversion

  // Calculate health metrics
  const healthySteps = steps.filter(step => (step.data.conversionRate || 0) >= 70).length;
  const warningSteps = steps.filter(step => {
    const rate = step.data.conversionRate || 0;
    return rate >= 40 && rate < 70;
  }).length;
  const criticalSteps = steps.filter(step => (step.data.conversionRate || 0) < 40).length;

  const overallHealth = Math.floor(avgConversionRate);

  // Generate insights
  const insights = [
    {
      type: "critical",
      title: "Cart Abandonment Alert",
      description: "67% cart abandonment suggests payment friction or unexpected shipping costs",
      action: "Add shipping calculator before checkout"
    },
    {
      type: "warning", 
      title: "Mobile UX Issues",
      description: "Mobile performance 23% slower than desktop conversion",
      action: "Implement progress indicator"
    },
    {
      type: "success",
      title: "Email Signup Performing",
      description: "Email conversion rate 15% above industry average",
      action: "Scale email campaigns"
    }
  ];

  const getHealthColor = (score: number) => {
    if (score >= 70) return "text-green-500";
    if (score >= 50) return "text-orange-500";
    return "text-red-500";
  };

  if (!isExpanded) {
    return (
      <div className="bg-background border-t border-border">
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(true)}
          className="w-full py-2 flex items-center justify-center gap-2"
        >
          <ChevronUp className="h-4 w-4" />
          <span className="text-sm">Analytics Panel</span>
          <Badge variant="secondary" className="ml-2">
            {steps.length} steps
          </Badge>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-background border-t border-border">
      {/* Panel Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          📊 Journey Performance Dashboard
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(false)}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 space-y-6">
        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Overall Health */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Overall Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getHealthColor(overallHealth)}`}>
                {overallHealth}%
              </div>
              <Progress value={overallHealth} className="mt-2" />
              <div className="flex items-center justify-between text-xs mt-2">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Strong: {healthySteps}
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Attention: {warningSteps}
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Critical: {criticalSteps}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Traffic */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Traffic
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {(totalTraffic / 1000).toFixed(1)}k
              </div>
              <div className="text-sm text-muted-foreground">visitors/month</div>
            </CardContent>
          </Card>

          {/* Revenue */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Est. Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                €{(estimatedRevenue / 1000).toFixed(1)}k
              </div>
              <div className="text-sm text-muted-foreground">per month</div>
            </CardContent>
          </Card>

          {/* Conversion Rate */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4" />
                Avg Conversion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getHealthColor(avgConversionRate)}`}>
                {avgConversionRate.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">across journey</div>
            </CardContent>
          </Card>
        </div>

        {/* Journey Flow Visualization */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Journey Flow Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {steps.length > 0 ? (
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex flex-col items-center">
                      <div 
                        className={`w-16 h-8 rounded flex items-center justify-center text-xs font-medium text-white bg-gradient-to-r ${
                          (step.data.conversionRate || 0) >= 70 ? 'from-green-500 to-green-600' :
                          (step.data.conversionRate || 0) >= 40 ? 'from-orange-500 to-orange-600' :
                          'from-red-500 to-red-600'
                        }`}
                      >
                        {step.data.conversionRate || 0}%
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 text-center max-w-[80px] truncate">
                        {step.title}
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="text-xs text-muted-foreground">→</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Add steps to see journey flow
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI-Generated Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="flex-shrink-0 mt-0.5">
                  {insight.type === "critical" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                  {insight.type === "warning" && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                  {insight.type === "success" && <CheckCircle className="h-4 w-4 text-green-500" />}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{insight.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">{insight.description}</div>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      💡 {insight.action}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex gap-2 pt-2 border-t">
              <Button size="sm" className="flex-1">
                <Target className="h-4 w-4 mr-2" />
                Generate Test Plan
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <FileDown className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};