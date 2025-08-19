import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FileText, ArrowRight, CheckCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Link } from "react-router-dom";

const Dashboard = () => {
  // Mock data - in real app this would come from Supabase
  const metrics = {
    knowledgeFreshness: 92,
    knowledgeScore: 847,
    knowledgeTotal: 1000,
    velocityRate: 18,
    plannedTests: 12,
    lastUpdate: "2h ago"
  };

  // Status calculation functions
  const getFreshnessStatus = (percentage: number) => {
    if (percentage >= 80) return { color: 'text-green-500', status: 'good' };
    if (percentage >= 60) return { color: 'text-orange-500', status: 'warning' };
    return { color: 'text-red-500', status: 'critical' };
  };

  const getKnowledgeScoreStatus = (score: number) => {
    if (score > 800) return { color: 'text-green-500', status: 'good' };
    if (score >= 500) return { color: 'text-orange-500', status: 'warning' };
    return { color: 'text-red-500', status: 'critical' };
  };

  const freshnessStatus = getFreshnessStatus(metrics.knowledgeFreshness);
  const knowledgeStatus = getKnowledgeScoreStatus(metrics.knowledgeScore);

  // Chart data for last 3 months
  const velocityChartData = [
    { month: 'Nov', tests: 14 },
    { month: 'Dec', tests: 16 },
    { month: 'Jan', tests: 18 },
  ];

  const plannedTestsChartData = [
    { month: 'Nov', planned: 2 },
    { month: 'Dec', planned: 16 },
    { month: 'Jan', planned: 8 },
  ];

  return (
    <TooltipProvider>
      <DashboardLayout>
        <div className="min-h-screen p-8">
        {/* Minimalist Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-light text-foreground">Overview</h1>
            <p className="text-muted-foreground mt-1">Last update {metrics.lastUpdate}</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/dashboard/analysis">
              <FileText className="w-4 h-4 mr-2" />
              New Analysis
            </Link>
          </Button>
        </div>

        {/* Core Metrics - Minimal 4-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-16">
          
          {/* Knowledge Freshness */}
          <div className="text-center">
            <div className="text-5xl font-light text-foreground mb-2">
              {metrics.knowledgeFreshness}%
            </div>
            <div className="flex items-center justify-center gap-1">
              <p className="text-muted-foreground text-sm">Knowledge Freshness</p>
              <UITooltip>
                <TooltipTrigger asChild>
                  <CheckCircle className={`w-3 h-3 ${freshnessStatus.color} opacity-60`} />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">The fresher the data, the better the performance results</p>
                </TooltipContent>
              </UITooltip>
            </div>
          </div>

          {/* Knowledge Score */}
          <div className="text-center">
            <div className="text-5xl font-light text-foreground mb-2">
              {metrics.knowledgeScore}
            </div>
            <div className="flex items-center justify-center gap-1">
              <p className="text-muted-foreground text-sm">Knowledge Score</p>
              <UITooltip>
                <TooltipTrigger asChild>
                  <CheckCircle className={`w-3 h-3 ${knowledgeStatus.color} opacity-60`} />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">The higher the knowledge, the better the performance results</p>
                </TooltipContent>
              </UITooltip>
            </div>
          </div>

          {/* Velocity Rate */}
          <div className="text-center">
            <div className="text-5xl font-light text-foreground mb-2">
              {metrics.velocityRate}
            </div>
            <p className="text-muted-foreground text-sm mb-4">Tests Launched (30d)</p>
            
            {/* Discreet line chart */}
            <div className="h-16 w-full opacity-60 hover:opacity-100 transition-opacity">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={velocityChartData}>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: 'currentColor' }}
                  />
                  <YAxis 
                    hide 
                    domain={['dataMin - 2', 'dataMax + 2']}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="tests" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={1.5}
                    dot={{ r: 2.5, fill: 'hsl(var(--primary))' }}
                    activeDot={{ r: 3.5, fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Planned Tests */}
          <div className="text-center">
            <div className="text-5xl font-light text-foreground mb-2">
              {metrics.plannedTests}
            </div>
            <p className="text-muted-foreground text-sm mb-4">Tests Planned</p>
            
            {/* Discreet line chart */}
            <div className="h-16 w-full opacity-60 hover:opacity-100 transition-opacity">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={plannedTestsChartData}>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: 'currentColor' }}
                  />
                  <YAxis 
                    hide 
                    domain={['dataMin - 1', 'dataMax + 1']}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="planned" 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeWidth={1.5}
                    dot={{ r: 2.5, fill: 'hsl(var(--muted-foreground))' }}
                    activeDot={{ r: 3.5, fill: 'hsl(var(--muted-foreground))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
        </div>
      </DashboardLayout>
    </TooltipProvider>
  );
};

export default Dashboard;