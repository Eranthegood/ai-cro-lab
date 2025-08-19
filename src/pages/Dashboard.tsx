import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Database, 
  TrendingUp, 
  FileText, 
  Brain,
  Zap,
  Calendar,
  ArrowRight
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Link } from "react-router-dom";

const Dashboard = () => {
  // Mock data - in real app this would come from Supabase
  const knowledgeFreshness = {
    lastUpdate: "2 hours ago",
    score: 92,
    trend: "+5%"
  };

  const knowledgeScore = {
    current: 847,
    total: 1000,
    quality: "Excellent"
  };

  const velocityRate = {
    testsLast30Days: 23,
    avgTimeToGenerate: "2.3s",
    improvement: "+18%"
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="border-b border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Overview</h1>
            <p className="text-muted-foreground mt-1">
              Key metrics for your CRO intelligence platform
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button asChild>
              <Link to="/dashboard/analysis">
                <FileText className="w-4 h-4 mr-2" />
                New Analysis
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Key Metrics - Clean 3-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Knowledge Freshness Score */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Knowledge Freshness
              </CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{knowledgeFreshness.score}%</div>
              <p className="text-xs text-muted-foreground mb-2">
                Last update: {knowledgeFreshness.lastUpdate}
              </p>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-success h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${knowledgeFreshness.score}%` }}
                ></div>
              </div>
              <p className="text-xs text-success flex items-center mt-2">
                <TrendingUp className="w-3 h-3 mr-1" />
                {knowledgeFreshness.trend} this week
              </p>
            </CardContent>
          </Card>

          {/* Knowledge Score */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Knowledge Score
              </CardTitle>
              <Brain className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {knowledgeScore.current}/{knowledgeScore.total}
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                AI context quality: {knowledgeScore.quality}
              </p>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(knowledgeScore.current / knowledgeScore.total) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* 30-Day Velocity Rate */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Velocity Rate (30d)
              </CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{velocityRate.testsLast30Days}</div>
              <p className="text-xs text-muted-foreground mb-2">
                Avg generation time: {velocityRate.avgTimeToGenerate}
              </p>
              <p className="text-xs text-success flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                {velocityRate.improvement} vs last month
              </p>
            </CardContent>
          </Card>

        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Data Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Latest upload</span>
                  <span className="text-sm font-medium">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Processing status</span>
                  <span className="text-sm font-medium text-success">Complete</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active models</span>
                  <span className="text-sm font-medium">3</span>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                  <Link to="/dashboard/analysis">
                    Upload New Data <ArrowRight className="w-3 h-3 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                Knowledge Base
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total documents</span>
                  <span className="text-sm font-medium">247</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Processed</span>
                  <span className="text-sm font-medium text-success">95%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Quality score</span>
                  <span className="text-sm font-medium">{knowledgeScore.quality}</span>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                  <Link to="/dashboard/knowledge">
                    Manage Knowledge <ArrowRight className="w-3 h-3 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;