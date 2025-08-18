import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TestTube, 
  Rocket, 
  Clock, 
  TrendingUp, 
  FileText, 
  Code, 
  ArrowRight,
  Star,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <DashboardLayout>
      {/* Header */}
      <div className="border-b border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, Sarah! Here's what's happening with your CRO initiatives.
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
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tests Generated
              </CardTitle>
              <TestTube className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">23</div>
              <p className="text-xs text-success flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Deployed
              </CardTitle>
              <Rocket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">18</div>
              <p className="text-xs text-success flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                78% deployment rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Time Saved
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">67h</div>
              <p className="text-xs text-muted-foreground">
                This month vs manual analysis
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Knowledge Score
              </CardTitle>
              <Star className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">847/1000</div>
              <p className="text-xs text-muted-foreground">
                AI context quality
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Current Analysis Section */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Analysis Model</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-success"></div>
                    <div>
                      <p className="font-medium">Expert CRO v1</p>
                      <p className="text-sm text-muted-foreground">87% accuracy • 94% satisfaction</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p>Performance this month:</p>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <span className="font-medium text-foreground">23</span> analyses
                    </div>
                    <div>
                      <span className="font-medium text-foreground">2.3s</span> avg time
                    </div>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to="/dashboard/settings">
                    Manage Models <ArrowRight className="w-3 h-3 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Knowledge Base Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Design System</span>
                    <span className="text-success">95% processed</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-success h-2 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Business Context</span>
                    <span className="text-success">87% processed</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-success h-2 rounded-full" style={{ width: '87%' }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>User Research</span>
                    <span className="text-yellow-600">23% processed</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '23%' }}></div>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to="/dashboard/knowledge">
                    Manage Knowledge <ArrowRight className="w-3 h-3 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link to="/dashboard/deployments">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 border border-border rounded-lg">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-success/10">
                  <CheckCircle className="w-4 h-4 text-success" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Checkout Button Enhancement</p>
                  <p className="text-sm text-muted-foreground">Test deployed to AB Tasty • +23% conversion</p>
                </div>
                <Badge variant="secondary" className="text-xs">Completed</Badge>
              </div>

              <div className="flex items-center space-x-4 p-3 border border-border rounded-lg">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                  <Code className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Navigation Simplification</p>
                  <p className="text-sm text-muted-foreground">Code generated for React • Ready for deployment</p>
                </div>
                <Badge variant="default" className="text-xs">Generated</Badge>
              </div>

              <div className="flex items-center space-x-4 p-3 border border-border rounded-lg">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-500/10">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Product Page Layout</p>
                  <p className="text-sm text-muted-foreground">Analysis in progress • Expert CRO v1 model</p>
                </div>
                <Badge variant="outline" className="text-xs">Analyzing</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;