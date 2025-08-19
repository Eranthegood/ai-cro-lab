import { useState } from "react";
import { ChevronDown, ChevronRight, Check, Upload, Lock, Brain, Target, Eye, BarChart, FileText, Palette, Users, TrendingUp, Zap } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface Section {
  id: string;
  title: string;
  points: number;
  completed: number;
  icon: any;
  description: string;
}

const sections: Section[] = [
  {
    id: "business",
    title: "Business Foundation",
    points: 20,
    completed: 0,
    icon: Target,
    description: "Strategic context and business model understanding"
  },
  {
    id: "visual",
    title: "Visual Intelligence", 
    points: 20,
    completed: 0,
    icon: Eye,
    description: "Screenshots and design system analysis"
  },
  {
    id: "behavioral",
    title: "Behavioral Intelligence",
    points: 20,
    completed: 0,
    icon: Users,
    description: "User behavior and analytics data"
  },
  {
    id: "predictive",
    title: "Predictive Intelligence",
    points: 20,
    completed: 0,
    icon: TrendingUp,
    description: "Historical performance and strategic context"
  },
  {
    id: "repository",
    title: "Knowledge Repository",
    points: 20,
    completed: 0,
    icon: FileText,
    description: "Universal document vault for comprehensive context"
  }
];

const KnowledgeVaultConfig = () => {
  const [expandedSections, setExpandedSections] = useState<string[]>(["business"]);
  const [sectionProgress, setSectionProgress] = useState<Record<string, number>>({
    business: 0,
    visual: 0,
    behavioral: 0,
    predictive: 0,
    repository: 0
  });

  const [formData, setFormData] = useState({
    companyDescription: "",
    industry: "",
    revenueRange: "",
    targetAudience: [],
    businessModel: "",
    challenges: ""
  });

  const totalProgress = Object.values(sectionProgress).reduce((sum, val) => sum + val, 0);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const updateSectionProgress = (sectionId: string, points: number) => {
    setSectionProgress(prev => ({
      ...prev,
      [sectionId]: Math.min(points, sections.find(s => s.id === sectionId)?.points || 0)
    }));
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Header Section */}
        <div className="bg-background/80 backdrop-blur-sm border-b border-border p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-foreground">
                  🧠 Configure Your Knowledge Vault
                </h1>
                <p className="text-xl text-muted-foreground mt-2">
                  Achieve 100% Predictive Power - Feed Your AI Everything It Needs
                </p>
              </div>
            </div>

            {/* Progress Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="col-span-2">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Configuration Progress</h3>
                    <Badge variant={totalProgress === 100 ? "default" : "secondary"} className="text-lg px-3 py-1">
                      {totalProgress}%
                    </Badge>
                  </div>
                  <Progress value={totalProgress} className="h-3 mb-4" />
                  <div className="grid grid-cols-5 gap-2">
                    {sections.map((section) => (
                      <div key={section.id} className="text-center">
                        <div className={cn(
                          "h-2 rounded-full mb-2",
                          sectionProgress[section.id] === section.points 
                            ? "bg-green-500" 
                            : sectionProgress[section.id] > 0 
                              ? "bg-orange-500" 
                              : "bg-muted"
                        )} />
                        <span className="text-xs text-muted-foreground">
                          {sectionProgress[section.id]}/{section.points}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Lock className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-800 dark:text-green-200">
                      🔒 Digital Fortress
                    </span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    End-to-end encrypted, GDPR compliant. Your data never leaves our secure environment.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto p-8">
          <div className="space-y-6">
            {sections.map((section, index) => (
              <Card key={section.id} className="overflow-hidden">
                <CardHeader
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-lg",
                        sectionProgress[section.id] === section.points
                          ? "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400"
                          : "bg-primary/10 text-primary"
                      )}>
                        {sectionProgress[section.id] === section.points ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <section.icon className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-xl">
                          {section.title}
                          <Badge variant="outline" className="ml-3">
                            {section.points} points
                          </Badge>
                        </CardTitle>
                        <p className="text-muted-foreground">{section.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-semibold">
                          {sectionProgress[section.id]}/{section.points}
                        </div>
                        <Progress 
                          value={(sectionProgress[section.id] / section.points) * 100} 
                          className="w-20 h-2"
                        />
                      </div>
                      {expandedSections.includes(section.id) ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                {expandedSections.includes(section.id) && (
                  <CardContent className="border-t">
                    {section.id === "business" && (
                      <BusinessFoundationSection 
                        onProgressUpdate={(points) => updateSectionProgress("business", points)}
                      />
                    )}
                    {section.id === "visual" && (
                      <VisualIntelligenceSection 
                        onProgressUpdate={(points) => updateSectionProgress("visual", points)}
                      />
                    )}
                    {section.id === "behavioral" && (
                      <BehavioralIntelligenceSection 
                        onProgressUpdate={(points) => updateSectionProgress("behavioral", points)}
                      />
                    )}
                    {section.id === "predictive" && (
                      <PredictiveIntelligenceSection 
                        onProgressUpdate={(points) => updateSectionProgress("predictive", points)}
                      />
                    )}
                    {section.id === "repository" && (
                      <KnowledgeRepositorySection 
                        onProgressUpdate={(points) => updateSectionProgress("repository", points)}
                      />
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-8 p-6 bg-muted/50 rounded-lg">
            <div>
              <h3 className="font-semibold mb-1">Ready to unlock predictive insights?</h3>
              <p className="text-sm text-muted-foreground">
                Complete configuration: {totalProgress}% • {5 - Object.values(sectionProgress).filter(v => v > 0).length} sections remaining
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">Save Draft</Button>
              <Button disabled={totalProgress < 100} className="px-8">
                <Zap className="h-4 w-4 mr-2" />
                Activate AI Intelligence
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

// Section Components
const BusinessFoundationSection = ({ onProgressUpdate }: { onProgressUpdate: (points: number) => void }) => {
  const [progress, setProgress] = useState(0);
  
  return (
    <div className="space-y-6 py-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Business Context (12 points)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="company-description">Company Description</Label>
              <Textarea
                id="company-description"
                placeholder="E-commerce women's fashion, 25-45 audience, €89 AOV, 34% checkout abandonment, Q4 seasonal peak, mobile-first"
                className="min-h-[120px]"
                onChange={(e) => {
                  const newProgress = e.target.value.length > 50 ? progress + 3 : progress;
                  setProgress(newProgress);
                  onProgressUpdate(newProgress);
                }}
              />
              <p className="text-xs text-muted-foreground mt-1">+3 points for detailed description (50+ characters)</p>
            </div>

            <div>
              <Label htmlFor="industry">Industry Vertical</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                  <SelectItem value="saas">SaaS</SelectItem>
                  <SelectItem value="fintech">FinTech</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="travel">Travel & Hospitality</SelectItem>
                  <SelectItem value="fashion">Fashion & Retail</SelectItem>
                  <SelectItem value="food">Food & Beverage</SelectItem>
                  <SelectItem value="automotive">Automotive</SelectItem>
                  <SelectItem value="realestate">Real Estate</SelectItem>
                  <SelectItem value="media">Media & Entertainment</SelectItem>
                  <SelectItem value="nonprofit">Non-profit</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">+2 points</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="revenue-range">Revenue Range</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select revenue range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-1m">$0 - $1M</SelectItem>
                  <SelectItem value="1-10m">$1M - $10M</SelectItem>
                  <SelectItem value="10-50m">$10M - $50M</SelectItem>
                  <SelectItem value="50-100m">$50M - $100M</SelectItem>
                  <SelectItem value="100m+">$100M+</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">+2 points</p>
            </div>

            <div>
              <Label htmlFor="business-model">Business Model</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select business model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="b2c">B2C</SelectItem>
                  <SelectItem value="b2b">B2B</SelectItem>
                  <SelectItem value="marketplace">Marketplace</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
                  <SelectItem value="freemium">Freemium</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">+2 points</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Current Challenges (8 points)</h3>
        <Textarea
          placeholder="Primary CRO challenges, conversion rates, biggest pain points, competition pressure..."
          className="min-h-[100px]"
        />
        <p className="text-xs text-muted-foreground mt-1">+8 points for comprehensive challenge description</p>
      </div>
    </div>
  );
};

const VisualIntelligenceSection = ({ onProgressUpdate }: { onProgressUpdate: (points: number) => void }) => {
  return (
    <div className="space-y-6 py-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Screenshots Required (16 points)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: "Homepage (Mobile)", description: "Primary landing experience", points: 4 },
            { name: "Homepage (Desktop)", description: "Desktop comparison", points: 3 },
            { name: "Product/Service Page", description: "Core conversion page", points: 4 },
            { name: "Checkout/Signup Flow", description: "Critical conversion step", points: 3 },
            { name: "Mobile Critical Page", description: "Mobile-specific friction point", points: 2 }
          ].map((upload, index) => (
            <Card key={index} className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors cursor-pointer group">
              <CardContent className="p-6 text-center">
                <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary mx-auto mb-3" />
                <h4 className="font-semibold mb-1">{upload.name}</h4>
                <p className="text-sm text-muted-foreground mb-2">{upload.description}</p>
                <Badge variant="outline">+{upload.points} points</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Design System (4 points)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Brand Colors</Label>
            <div className="flex gap-2 mt-2">
              <Input type="color" className="w-16 h-10" defaultValue="#000000" />
              <Input type="color" className="w-16 h-10" defaultValue="#ffffff" />
              <Input type="color" className="w-16 h-10" defaultValue="#3b82f6" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">+2 points</p>
          </div>
          <div>
            <Label>Style Guide Upload</Label>
            <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors cursor-pointer mt-2">
              <CardContent className="p-4 text-center">
                <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm">Upload brand guidelines (PDF)</p>
                <p className="text-xs text-muted-foreground">+2 points</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const BehavioralIntelligenceSection = ({ onProgressUpdate }: { onProgressUpdate: (points: number) => void }) => {
  return (
    <div className="space-y-6 py-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Analytics Data (12 points)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: "Contentsquare Export", format: "CSV/JSON", points: 3 },
            { name: "Google Analytics 4", format: "Data Export", points: 3 },
            { name: "Heatmap Data", format: "Hotjar/Fullstory", points: 3 },
            { name: "Funnel Analysis", format: "CSV/Excel", points: 3 }
          ].map((upload, index) => (
            <Card key={index} className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BarChart className="h-8 w-8 text-primary" />
                  <div className="flex-1">
                    <h4 className="font-semibold">{upload.name}</h4>
                    <p className="text-sm text-muted-foreground">{upload.format}</p>
                  </div>
                  <Badge variant="outline">+{upload.points}pt</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Customer Intelligence (8 points)</h3>
        <Card className="border-2 border-dashed border-muted-foreground/25">
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="font-semibold mb-2">Upload Customer Data</h4>
            <p className="text-muted-foreground mb-4">
              Customer personas, feedback, journey maps, support tickets, user research
            </p>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
            <p className="text-xs text-muted-foreground mt-2">+8 points for comprehensive customer intelligence</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const PredictiveIntelligenceSection = ({ onProgressUpdate }: { onProgressUpdate: (points: number) => void }) => {
  return (
    <div className="space-y-6 py-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Historical Performance (12 points)</h3>
        <div className="space-y-4">
          {[
            { name: "A/B Test History", description: "Upload wins/losses, test results", points: 4 },
            { name: "Seasonal Performance", description: "Yearly trends and patterns", points: 3 },
            { name: "Campaign Performance", description: "Marketing campaign results", points: 3 },
            { name: "Conversion Evolution", description: "Historical conversion rate data", points: 2 }
          ].map((item, index) => (
            <Card key={index} className="border-l-4 border-l-primary/30">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">+{item.points} points</Badge>
                    <Button variant="outline" size="sm">Upload</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Strategic Context (8 points)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <Label>Current OKRs/KPIs</Label>
              <Textarea placeholder="Q4 objectives, key results, success metrics..." />
            </div>
            <div>
              <Label>Technical Constraints</Label>
              <Textarea placeholder="Platform limitations, development capacity..." />
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <Label>Budget Constraints</Label>
              <Input placeholder="Monthly CRO budget, resource allocation..." />
            </div>
            <div>
              <Label>Team Capacity</Label>
              <Input placeholder="Team size, skillsets, approval processes..." />
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">+8 points for complete strategic context</p>
      </div>
    </div>
  );
};

const KnowledgeRepositorySection = ({ onProgressUpdate }: { onProgressUpdate: (points: number) => void }) => {
  return (
    <div className="space-y-6 py-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Universal Document Vault</h3>
        <p className="text-muted-foreground mb-6">
          Like Claude's project documents - upload any files that provide context about your business, users, and optimization goals.
        </p>
        
        <Tabs defaultValue="strategy" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="strategy">📋 Strategy</TabsTrigger>
            <TabsTrigger value="research">📊 Research</TabsTrigger>
            <TabsTrigger value="technical">🛠️ Technical</TabsTrigger>
            <TabsTrigger value="performance">📈 Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="strategy" className="space-y-4">
            <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Strategy & Planning Documents</h4>
                <p className="text-muted-foreground mb-4">
                  Product roadmaps, business plans, marketing strategies, growth plans, competitive analysis
                </p>
                <Button className="mb-2">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Strategy Documents
                </Button>
                <p className="text-xs text-muted-foreground">+5 points for comprehensive strategy docs</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="research" className="space-y-4">
            <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
              <CardContent className="p-8 text-center">
                <BarChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Research & Insights</h4>
                <p className="text-muted-foreground mb-4">
                  User research reports, market research, conversion audits, UX studies, industry reports
                </p>
                <Button className="mb-2">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Research Files
                </Button>
                <p className="text-xs text-muted-foreground">+5 points for research documentation</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="technical" className="space-y-4">
            <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
              <CardContent className="p-8 text-center">
                <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Technical Documentation</h4>
                <p className="text-muted-foreground mb-4">
                  API docs, technical specs, development guidelines, integration docs, performance reports
                </p>
                <Button className="mb-2">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Technical Docs
                </Button>
                <p className="text-xs text-muted-foreground">+5 points for technical context</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
              <CardContent className="p-8 text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Performance Data</h4>
                <p className="text-muted-foreground mb-4">
                  Monthly reports, KPI dashboards, financial reports, growth metrics, campaign results
                </p>
                <Button className="mb-2">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Performance Data
                </Button>
                <p className="text-xs text-muted-foreground">+5 points for performance insights</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default KnowledgeVaultConfig;