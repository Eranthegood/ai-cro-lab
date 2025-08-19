import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, ArrowRight, CheckCircle, Rocket, Upload, Building, Target } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Link } from "react-router-dom";
import { useNotifications } from "@/context/NotificationContext";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const { updateStatuses } = useNotifications();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    companyDescription: '',
    targetAudience: '',
    businessGoals: ''
  });
  
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

  // Update notification statuses when component mounts or metrics change
  useEffect(() => {
    updateStatuses(freshnessStatus, knowledgeStatus);
  }, [freshnessStatus.status, knowledgeStatus.status, updateStatuses]);

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

        {/* Onboarding CTA */}
        <div className="mb-12">
          <Card className="border border-border/50 bg-gradient-to-r from-background to-muted/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="p-2 rounded-lg bg-primary/5 border border-primary/10">
                    <Rocket className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-1">
                      Enrichissez votre IA
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Importez vos données pour des insights personnalisés
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => setIsOnboardingOpen(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2"
                >
                  Launch AB Test
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
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

        {/* Onboarding Modal */}
        <Dialog open={isOnboardingOpen} onOpenChange={setIsOnboardingOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Building className="h-5 w-5 text-primary" />
                Configuration de votre entreprise - Étape {onboardingStep}/3
              </DialogTitle>
              <DialogDescription>
                Aidez-nous à personnaliser l'IA selon votre entreprise pour de meilleurs résultats
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-6">
              {onboardingStep === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Nom de l'entreprise *</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      placeholder="Ex: TechCorp Solutions"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Secteur d'activité *</Label>
                    <Input
                      id="industry"
                      value={formData.industry}
                      onChange={(e) => setFormData({...formData, industry: e.target.value})}
                      placeholder="Ex: SaaS, E-commerce, Fintech..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyDescription">Description de l'entreprise</Label>
                    <Textarea
                      id="companyDescription"
                      value={formData.companyDescription}
                      onChange={(e) => setFormData({...formData, companyDescription: e.target.value})}
                      placeholder="Décrivez brièvement votre entreprise, vos produits/services..."
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {onboardingStep === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="targetAudience">Audience cible *</Label>
                    <Textarea
                      id="targetAudience"
                      value={formData.targetAudience}
                      onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                      placeholder="Décrivez votre audience principale : démographie, besoins, comportements..."
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessGoals">Objectifs business *</Label>
                    <Textarea
                      id="businessGoals"
                      value={formData.businessGoals}
                      onChange={(e) => setFormData({...formData, businessGoals: e.target.value})}
                      placeholder="Quels sont vos principaux objectifs ? (conversion, engagement, rétention...)"
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {onboardingStep === 3 && (
                <div className="space-y-6 text-center">
                  <div className="p-8 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Importez vos données (Optionnel)</h3>
                    <p className="text-muted-foreground mb-4">
                      Glissez-déposez vos fichiers ou cliquez pour les sélectionner
                    </p>
                    <Button variant="outline">
                      Choisir des fichiers
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Formats acceptés : CSV, JSON, PDF, DOCX
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-6 border-t">
              {onboardingStep > 1 && (
                <Button 
                  variant="outline" 
                  onClick={() => setOnboardingStep(onboardingStep - 1)}
                >
                  Précédent
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                {onboardingStep < 3 ? (
                  <Button 
                    onClick={() => setOnboardingStep(onboardingStep + 1)}
                    disabled={
                      (onboardingStep === 1 && (!formData.companyName || !formData.industry)) ||
                      (onboardingStep === 2 && (!formData.targetAudience || !formData.businessGoals))
                    }
                  >
                    Suivant
                  </Button>
                ) : (
                  <Button 
                    onClick={() => {
                      setIsOnboardingOpen(false);
                      setOnboardingStep(1);
                      // Ici on pourrait sauvegarder les données et rediriger vers Knowledge Vault
                    }}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Rocket className="w-4 h-4 mr-2" />
                    Lancer mon premier test A/B
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        </div>
        </DashboardLayout>
    </TooltipProvider>
  );
};

export default Dashboard;