import { useState } from "react";
import { 
  Settings, 
  X, 
  Plus, 
  Trash2,
  Eye,
  TrendingUp,
  Clock,
  Users,
  CheckSquare,
  Square
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JourneyStep } from "../../pages/JourneyMapper";

interface ConfigModalProps {
  step: JourneyStep;
  onUpdate: (updates: Partial<JourneyStep>) => void;
  onClose: () => void;
}

const dataSources = [
  { id: "ga", name: "Google Analytics", connected: true },
  { id: "contentsquare", name: "Contentsquare", connected: true },
  { id: "hotjar", name: "Hotjar Heatmaps", connected: false },
  { id: "abtests", name: "A/B Test Results", connected: false },
  { id: "mixpanel", name: "Mixpanel", connected: false },
  { id: "amplitude", name: "Amplitude", connected: false }
];

export const ConfigModal = ({ step, onUpdate, onClose }: ConfigModalProps) => {
  const [formData, setFormData] = useState({
    title: step.title,
    pages: step.data.pages?.join(", ") || "",
    conversionRate: step.data.conversionRate || 0,
    averageTime: step.data.averageTime || "",
    trafficVolume: step.data.trafficVolume || 0,
    dataSources: step.data.dataSources || [],
    insights: step.data.insights || ""
  });

  const handleSave = () => {
    onUpdate({
      title: formData.title,
      data: {
        ...step.data,
        pages: formData.pages.split(",").map(p => p.trim()).filter(Boolean),
        conversionRate: formData.conversionRate,
        averageTime: formData.averageTime,
        trafficVolume: formData.trafficVolume,
        dataSources: formData.dataSources,
        insights: formData.insights
      }
    });
  };

  const toggleDataSource = (sourceId: string, sourceName: string) => {
    const isSelected = formData.dataSources.includes(sourceName);
    setFormData(prev => ({
      ...prev,
      dataSources: isSelected
        ? prev.dataSources.filter(ds => ds !== sourceName)
        : [...prev.dataSources, sourceName]
    }));
  };

  // Generate mock AI insights based on the data
  const generateInsights = () => {
    const insights = [
      `Conversion rate of ${formData.conversionRate}% is ${formData.conversionRate > 50 ? 'above' : 'below'} industry average`,
      `Average time of ${formData.averageTime} suggests ${formData.averageTime.includes('m') ? 'high engagement' : 'quick decisions'}`,
      `Traffic volume indicates ${formData.trafficVolume > 5000 ? 'high-performing' : 'optimization opportunity'} funnel step`
    ];
    
    setFormData(prev => ({
      ...prev,
      insights: insights[Math.floor(Math.random() * insights.length)]
    }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configure: {step.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">📝 Step Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Step Name</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter step name"
                />
              </div>

              <div>
                <Label htmlFor="pages">Pages Involved</Label>
                <Input
                  id="pages"
                  value={formData.pages}
                  onChange={(e) => setFormData(prev => ({ ...prev, pages: e.target.value }))}
                  placeholder="/category, /product, /search, /filter"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Comma-separated list of page URLs
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Current Data */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">📊 Current Performance Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="conversion">Conversion Rate (%)</Label>
                  <Input
                    id="conversion"
                    type="number"
                    value={formData.conversionRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, conversionRate: Number(e.target.value) }))}
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <Label htmlFor="time">Average Time</Label>
                  <Input
                    id="time"
                    value={formData.averageTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, averageTime: e.target.value }))}
                    placeholder="2m 34s"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="traffic">Traffic Volume (visitors/month)</Label>
                <Input
                  id="traffic"
                  type="number"
                  value={formData.trafficVolume}
                  onChange={(e) => setFormData(prev => ({ ...prev, trafficVolume: Number(e.target.value) }))}
                  min="0"
                />
              </div>

              {/* Visual metrics preview */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <TrendingUp className={`h-6 w-6 mx-auto mb-1 ${
                    formData.conversionRate >= 70 ? 'text-green-500' : 
                    formData.conversionRate >= 40 ? 'text-orange-500' : 'text-red-500'
                  }`} />
                  <div className="text-lg font-bold">{formData.conversionRate}%</div>
                  <div className="text-xs text-muted-foreground">Conversion</div>
                </div>
                <div className="text-center">
                  <Clock className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                  <div className="text-lg font-bold">{formData.averageTime || "N/A"}</div>
                  <div className="text-xs text-muted-foreground">Avg Time</div>
                </div>
                <div className="text-center">
                  <Users className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                  <div className="text-lg font-bold">{(formData.trafficVolume / 1000).toFixed(1)}k</div>
                  <div className="text-xs text-muted-foreground">Traffic</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Sources */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">🔗 Data Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {dataSources.map((source) => {
                  const isSelected = formData.dataSources.includes(source.name);
                  const isConnected = source.connected;
                  
                  return (
                    <button
                      key={source.id}
                      onClick={() => isConnected && toggleDataSource(source.id, source.name)}
                      disabled={!isConnected}
                      className={`flex items-center gap-2 p-3 text-left rounded-lg border transition-colors ${
                        isConnected 
                          ? (isSelected 
                              ? 'bg-primary/10 border-primary text-primary' 
                              : 'hover:bg-muted border-border'
                            )
                          : 'opacity-50 cursor-not-allowed border-border'
                      }`}
                    >
                      {isSelected ? (
                        <CheckSquare className="h-4 w-4 text-primary" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                      <div className="flex-1">
                        <div className="text-sm font-medium">{source.name}</div>
                        <Badge 
                          variant={isConnected ? "secondary" : "outline"} 
                          className="text-xs mt-1"
                        >
                          {isConnected ? "Connected" : "Not Connected"}
                        </Badge>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  💡 AI Insights
                </span>
                <Button variant="outline" size="sm" onClick={generateInsights}>
                  <Plus className="h-4 w-4 mr-1" />
                  Generate
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.insights}
                onChange={(e) => setFormData(prev => ({ ...prev, insights: e.target.value }))}
                placeholder="AI-generated insights will appear here..."
                className="min-h-[80px]"
              />
              {formData.insights && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    💡 <strong>Insight:</strong> {formData.insights}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={handleSave} className="flex-1">
              Save Changes
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};