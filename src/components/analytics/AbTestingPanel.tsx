import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Eye,
  Play,
  Pause,
  Settings,
  Download
} from "lucide-react";
import { useAllFlags, useTrackEvent } from "@/hooks/useLaunchDarkly";

const AbTestingPanel = () => {
  const flags = useAllFlags();
  const trackEvent = useTrackEvent();
  const [selectedTest, setSelectedTest] = useState<string | null>(null);

  // Mock A/B test data
  const activeTests = [
    {
      id: 'insights-layout-test',
      name: 'AI Insights Layout',
      description: 'Testing two different layouts for the AI Insights page',
      status: 'active',
      variants: {
        'variant-a': { name: 'Grid Layout', traffic: 50, conversions: 156, conversionRate: 23.4 },
        'variant-b': { name: 'Hero Layout', traffic: 50, conversions: 142, conversionRate: 21.3 }
      },
      totalParticipants: 2847,
      startDate: '2024-01-15',
      metrics: {
        primaryGoal: 'Feature Engagement',
        significance: 89.2,
        winner: 'variant-a'
      }
    }
  ];

  const handleTestAction = (action: string, testId: string) => {
    trackEvent('ab_test_action', {
      action,
      testId,
      timestamp: Date.now()
    });
  };

  const handleExportResults = (testId: string) => {
    trackEvent('ab_test_export', {
      testId,
      timestamp: Date.now()
    });
    
    // Mock CSV export
    const csvContent = 'Test,Variant,Traffic,Conversions,Rate\n' +
                     'AI Insights Layout,Grid Layout,50%,156,23.4%\n' +
                     'AI Insights Layout,Hero Layout,50%,142,21.3%';
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ab-test-results-${testId}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Tests</p>
                <p className="text-2xl font-bold">{activeTests.length}</p>
              </div>
              <Play className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Participants</p>
                <p className="text-2xl font-bold">2,847</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Conversion</p>
                <p className="text-2xl font-bold">22.4%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Significance</p>
                <p className="text-2xl font-bold">89.2%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Tests */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Active A/B Tests
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleTestAction('create_test', 'new')}
            >
              <Settings className="w-4 h-4 mr-2" />
              Create Test
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeTests.map((test) => (
              <Card key={test.id} className="border-l-4 border-l-success">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{test.name}</h3>
                      <p className="text-sm text-muted-foreground">{test.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {test.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Started {test.startDate}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          • {test.totalParticipants} participants
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleExportResults(test.id)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleTestAction('pause', test.id)}
                      >
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </Button>
                    </div>
                  </div>

                  {/* Variants Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(test.variants).map(([variantKey, variant]) => (
                      <div 
                        key={variantKey} 
                        className={`p-4 rounded-lg border-2 transition-all ${
                          test.metrics.winner === variantKey 
                            ? 'border-success bg-success/5' 
                            : 'border-border'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{variant.name}</h4>
                          {test.metrics.winner === variantKey && (
                            <Badge variant="secondary" className="bg-success text-success-foreground">
                              Winner
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Traffic Split</span>
                            <span className="text-sm font-medium">{variant.traffic}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Conversions</span>
                            <span className="text-sm font-medium">{variant.conversions}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Conv. Rate</span>
                            <span className="text-sm font-medium text-success">
                              {variant.conversionRate}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Test Metrics */}
                  <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span>Primary Goal: <strong>{test.metrics.primaryGoal}</strong></span>
                      <span>Statistical Significance: <strong className="text-success">{test.metrics.significance}%</strong></span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Feature Flags */}
      <Card>
        <CardHeader>
          <CardTitle>Current Feature Flags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(flags).length > 0 ? (
              Object.entries(flags).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="font-medium">{key}</span>
                  <Badge variant={value ? "default" : "secondary"}>
                    {String(value)}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No feature flags currently active
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AbTestingPanel;