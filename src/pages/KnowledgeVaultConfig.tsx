import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Check, Upload, Lock, Brain, Target, Eye, BarChart, FileText, Palette, Users, TrendingUp, Zap, File, X } from "lucide-react";
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
import { useKnowledgeVault } from "@/hooks/useKnowledgeVault";
import { FileUploadCard } from "@/components/knowledge-vault/FileUploadCard";
import { toast } from "@/hooks/use-toast";

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

// Composant pour afficher les fichiers uploadés
const UploadedFilesList = ({ 
  files, 
  onDelete,
  section,
  onFileDeleted
}: { 
  files: any[];
  onDelete: (fileId: string, storagePath: string) => Promise<void>;
  section: string;
  onFileDeleted?: (section: string) => void;
}) => {
  if (!files || files.length === 0) {
    return null;
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDelete = async (fileId: string, storagePath: string) => {
    try {
      await onDelete(fileId, storagePath);
      onFileDeleted?.(section);
      toast({
        title: "Fichier supprimé",
        description: "Le fichier a été retiré du Knowledge Vault.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer le fichier.",
      });
    }
  };

  return (
    <div className="mt-4 space-y-2">
      <h5 className="text-sm font-medium text-muted-foreground">Fichiers uploadés :</h5>
      <div className="space-y-2">
        {files.map((file) => (
          <div key={file.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
            <div className="flex items-center space-x-3">
              <File className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium truncate max-w-[200px]" title={file.file_name}>
                  {file.file_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.file_size)} • {new Date(file.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                {file.file_type.split('/')[1]?.toUpperCase() || 'FILE'}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(file.id, file.storage_path)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const KnowledgeVaultConfig = () => {
  const [expandedSections, setExpandedSections] = useState<string[]>(["business"]);
  const { 
    configurations, 
    progress, 
    totalProgress, 
    loading, 
    uploading, 
    updateConfiguration,
    uploadFile,
    getFiles,
    deleteFile 
  } = useKnowledgeVault();

  const [formData, setFormData] = useState({
    companyDescription: "",
    industry: "",
    revenueRange: "",
    targetAudience: [],
    businessModel: "",
    challenges: ""
  });

  const [sectionFiles, setSectionFiles] = useState<Record<string, any[]>>({});

  // Load existing configurations
  useEffect(() => {
    if (configurations.business?.config_data) {
      setFormData(prev => ({
        ...prev,
        ...configurations.business.config_data
      }));
    }
  }, [configurations]);

  // Load files for each section
  useEffect(() => {
    const loadFiles = async () => {
      const sections = ['business', 'visual', 'behavioral', 'predictive', 'repository'];
      const filesData: Record<string, any[]> = {};
      
      for (const section of sections) {
        const { files } = await getFiles(section);
        filesData[section] = files;
      }
      
      setSectionFiles(filesData);
    };
    
    loadFiles();
  }, [getFiles]);

  // Convert progress array to object for easier access
  const sectionProgress = progress.reduce((acc, item) => {
    acc[item.section] = item.completion_percentage;
    return acc;
  }, {} as Record<string, number>);

  // Fonction pour recharger les fichiers après suppression ou ajout
  const handleFileUpdated = async (section: string) => {
    const { files } = await getFiles(section);
    setSectionFiles(prev => ({
      ...prev,
      [section]: files
    }));
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const updateSectionProgress = async (sectionId: string, configData: any, points: number) => {
    await updateConfiguration(sectionId, configData, points);
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
                  Configure Your Knowledge Vault
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
                         formData={formData}
                         setFormData={setFormData}
                         updateConfiguration={updateConfiguration}
                         sectionFiles={sectionFiles.business || []}
                         uploadFile={uploadFile}
                         deleteFile={deleteFile}
                         uploading={uploading}
                       />
                     )}
                     {section.id === "visual" && (
                       <VisualIntelligenceSection 
                         sectionFiles={sectionFiles.visual || []}
                         uploadFile={uploadFile}
                         deleteFile={deleteFile}
                         uploading={uploading}
                       />
                     )}
                     {section.id === "behavioral" && (
                       <BehavioralIntelligenceSection 
                         sectionFiles={sectionFiles.behavioral || []}
                         uploadFile={uploadFile}
                         deleteFile={deleteFile}
                         uploading={uploading}
                         onFileUpdated={handleFileUpdated}
                       />
                     )}
                     {section.id === "predictive" && (
                       <PredictiveIntelligenceSection 
                         sectionFiles={sectionFiles.predictive || []}
                         uploadFile={uploadFile}
                         deleteFile={deleteFile}
                         uploading={uploading}
                         onFileUpdated={handleFileUpdated}
                       />
                     )}
                     {section.id === "repository" && (
                       <KnowledgeRepositorySection 
                         sectionFiles={sectionFiles.repository || []}
                         uploadFile={uploadFile}
                         deleteFile={deleteFile}
                         uploading={uploading}
                         onFileUpdated={handleFileUpdated}
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
                Complete configuration: {Math.round(totalProgress)}% • {5 - Object.values(sectionProgress).filter(v => v > 0).length} sections remaining
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">Save Draft</Button>
              <Button disabled={totalProgress < 80} className="px-8">
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
const BusinessFoundationSection = ({ 
  formData, 
  setFormData, 
  updateConfiguration,
  sectionFiles,
  uploadFile,
  deleteFile,
  uploading 
}: { 
  formData: any;
  setFormData: (data: any) => void;
  updateConfiguration: (section: string, data: any, score: number) => Promise<any>;
  sectionFiles: any[];
  uploadFile: (file: File, section: string) => Promise<any>;
  deleteFile: (id: string, path: string) => Promise<any>;
  uploading: boolean;
}) => {
  const [progress, setProgress] = useState(0);

  const handleSave = async () => {
    const score = calculateBusinessScore(formData);
    await updateConfiguration('business', formData, score);
    setProgress(score);
  };

  const calculateBusinessScore = (data: any) => {
    let score = 0;
    if (data.companyDescription?.length > 50) score += 3;
    if (data.industry) score += 2;
    if (data.revenueRange) score += 2;
    if (data.businessModel) score += 2;
    if (data.challenges?.length > 100) score += 8;
    return Math.min(score, 20);
  };
  
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
                value={formData.companyDescription || ""}
                onChange={(e) => setFormData({ ...formData, companyDescription: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">+3 points for detailed description (50+ characters)</p>
            </div>

            <div>
              <Label htmlFor="industry">Industry Vertical</Label>
              <Select value={formData.industry || ""} onValueChange={(value) => setFormData({ ...formData, industry: value })}>
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
              <Select value={formData.revenueRange || ""} onValueChange={(value) => setFormData({ ...formData, revenueRange: value })}>
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
              <Select value={formData.businessModel || ""} onValueChange={(value) => setFormData({ ...formData, businessModel: value })}>
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
          value={formData.challenges || ""}
          onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
        />
        <p className="text-xs text-muted-foreground mt-1">+8 points for comprehensive challenge description</p>
      </div>

      <div className="flex justify-end mt-6">
        <Button onClick={handleSave} disabled={uploading}>
          Save Business Configuration
        </Button>
      </div>
    </div>
  );
};

const VisualIntelligenceSection = ({ 
  sectionFiles,
  uploadFile,
  deleteFile,
  uploading 
}: { 
  sectionFiles: any[];
  uploadFile: (file: File, section: string) => Promise<any>;
  deleteFile: (id: string, path: string) => Promise<any>;
  uploading: boolean;
}) => {
  const handleFileUpload = async (file: File) => {
    await uploadFile(file, 'visual');
  };

  const handleFileDelete = async (fileData: any) => {
    await deleteFile(fileData.id, fileData.storage_path);
  };
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
          ].map((upload, index) => {
            const existingFile = sectionFiles.find(f => f.file_name.includes(upload.name.toLowerCase().replace(/[^a-z]/g, '')));
            return (
              <FileUploadCard
                key={index}
                title={upload.name}
                description={upload.description}
                points={upload.points}
                acceptedTypes={['image/*']}
                onFileUpload={handleFileUpload}
                isUploading={uploading}
                uploadedFile={existingFile}
                onRemoveFile={existingFile ? () => handleFileDelete(existingFile) : undefined}
              />
            );
          })}
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
            <div className="mt-2">
              <FileUploadCard
                title="Brand Guidelines"
                description="Upload brand guidelines, style guide, or design system documentation"
                points={2}
                acceptedTypes={['.pdf', '.doc', '.docx', 'image/*', '.csv', '.xlsx', '.xls']}
                onFileUpload={handleFileUpload}
                isUploading={uploading}
                uploadedFile={sectionFiles.find(f => f.file_name.toLowerCase().includes('style') || f.file_name.toLowerCase().includes('brand') || f.file_name.toLowerCase().includes('guideline'))}
                onRemoveFile={() => {
                  const styleFile = sectionFiles.find(f => f.file_name.toLowerCase().includes('style') || f.file_name.toLowerCase().includes('brand') || f.file_name.toLowerCase().includes('guideline'));
                  if (styleFile) handleFileDelete(styleFile);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BehavioralIntelligenceSection = ({ 
  sectionFiles,
  uploadFile,
  deleteFile,
  uploading,
  onFileUpdated
}: { 
  sectionFiles: any[];
  uploadFile: (file: File, section: string) => Promise<any>;
  deleteFile: (id: string, path: string) => Promise<any>;
  uploading: boolean;
  onFileUpdated?: (section: string) => void;
}) => {
  const handleFileUpload = async (file: File) => {
    await uploadFile(file, 'behavioral');
    onFileUpdated?.('behavioral');
  };

  const handleFileDelete = async (fileData: any) => {
    await deleteFile(fileData.id, fileData.storage_path);
  };
  return (
    <div className="space-y-6 py-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Analytics Data (12 points)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: "Contentsquare Export", format: "CSV/JSON", points: 3, uploadId: "contentsquare-upload" },
            { name: "Google Analytics 4", format: "Data Export", points: 3, uploadId: "ga4-upload" },
            { name: "Heatmap Data", format: "Hotjar/Fullstory", points: 3, uploadId: "heatmap-upload" },
            { name: "Funnel Analysis", format: "CSV/Excel", points: 3, uploadId: "funnel-upload" }
          ].map((upload, index) => (
            <div key={index}>
              <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => document.getElementById(upload.uploadId)?.click()}>
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
              <input
                id={upload.uploadId}
                type="file"
                multiple
                className="hidden"
                accept=".csv,.xlsx,.xls,.json,.pdf,.txt,image/*"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files) {
                    Array.from(files).forEach(file => handleFileUpload(file));
                  }
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Customer Intelligence (8 points)</h3>
        <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="font-semibold mb-2">Upload Customer Data</h4>
            <p className="text-muted-foreground mb-4">
              Customer personas, feedback, journey maps, support tickets, user research
            </p>
            <Button variant="outline" onClick={() => document.getElementById('customer-upload')?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
            <input
              id="customer-upload"
              type="file"
              multiple
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.md,.csv,.xlsx,.xls,.json,image/*"
              onChange={(e) => {
                const files = e.target.files;
                if (files) {
                  Array.from(files).forEach(file => handleFileUpload(file));
                }
              }}
            />
            <p className="text-xs text-muted-foreground mt-2">+8 points for comprehensive customer intelligence</p>
          </CardContent>
        </Card>
        <UploadedFilesList 
          files={sectionFiles} 
          onDelete={deleteFile}
          section="behavioral"
          onFileDeleted={onFileUpdated}
        />
      </div>
    </div>
  );
};

const PredictiveIntelligenceSection = ({ 
  sectionFiles,
  uploadFile,
  deleteFile,
  uploading,
  onFileUpdated
}: { 
  sectionFiles: any[];
  uploadFile: (file: File, section: string) => Promise<any>;
  deleteFile: (id: string, path: string) => Promise<any>;
  uploading: boolean;
  onFileUpdated?: (section: string) => void;
}) => {
  const handleFileUpload = async (file: File) => {
    await uploadFile(file, 'predictive');
    onFileUpdated?.('predictive');
  };

  const handleFileDelete = async (fileData: any) => {
    await deleteFile(fileData.id, fileData.storage_path);
  };
  return (
    <div className="space-y-6 py-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Historical Performance (12 points)</h3>
        <div className="space-y-4">
          {[
            { name: "A/B Test History", description: "Upload wins/losses, test results", points: 4, uploadId: "abtest-upload" },
            { name: "Seasonal Performance", description: "Yearly trends and patterns", points: 3, uploadId: "seasonal-upload" },
            { name: "Campaign Performance", description: "Marketing campaign results", points: 3, uploadId: "campaign-upload" },
            { name: "Conversion Evolution", description: "Historical conversion rate data", points: 2, uploadId: "conversion-upload" }
          ].map((item, index) => (
            <div key={index}>
              <Card className="border-l-4 border-l-primary/30">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">+{item.points} points</Badge>
                      <Button variant="outline" size="sm" onClick={() => document.getElementById(item.uploadId)?.click()}>
                        Upload
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <input
                id={item.uploadId}
                type="file"
                multiple
                className="hidden"
                accept=".csv,.xlsx,.xls,.pdf,.doc,.docx,.txt,.md,.json,image/*"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files) {
                    Array.from(files).forEach(file => handleFileUpload(file));
                  }
                }}
              />
            </div>
          ))}
        </div>
        <UploadedFilesList 
          files={sectionFiles} 
          onDelete={deleteFile}
          section="predictive"
          onFileDeleted={onFileUpdated}
        />
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

const KnowledgeRepositorySection = ({ 
  sectionFiles,
  uploadFile,
  deleteFile,
  uploading,
  onFileUpdated
}: { 
  sectionFiles: any[];
  uploadFile: (file: File, section: string) => Promise<any>;
  deleteFile: (id: string, path: string) => Promise<any>;
  uploading: boolean;
  onFileUpdated?: (section: string) => void;
}) => {
  const handleFileUpload = async (file: File) => {
    await uploadFile(file, 'repository');
    onFileUpdated?.('repository');
  };
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
              <Button onClick={() => document.getElementById('strategy-upload')?.click()} className="mb-2">
                <Upload className="h-4 w-4 mr-2" />
                Upload Strategy Documents
              </Button>
              <input
                id="strategy-upload"
                type="file"
                multiple
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.md,.csv,.xlsx,.xls,image/*"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files) {
                    Array.from(files).forEach(file => handleFileUpload(file));
                  }
                }}
              />
                <p className="text-xs text-muted-foreground">+5 points for comprehensive strategy docs</p>
              </CardContent>
            </Card>
            <UploadedFilesList 
              files={sectionFiles} 
              onDelete={deleteFile}
              section="repository"
              onFileDeleted={onFileUpdated}
            />
          </TabsContent>

          <TabsContent value="research" className="space-y-4">
            <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
              <CardContent className="p-8 text-center">
                <BarChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Research & Insights</h4>
                <p className="text-muted-foreground mb-4">
                  User research reports, market research, conversion audits, UX studies, industry reports
                </p>
                <Button onClick={() => document.getElementById('research-upload')?.click()} className="mb-2">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Research Files
                </Button>
                <input
                  id="research-upload"
                  type="file"
                  multiple
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.md,.csv,.xlsx,.xls,image/*"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files) {
                      Array.from(files).forEach(file => handleFileUpload(file));
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">+5 points for research documentation</p>
              </CardContent>
            </Card>
            <UploadedFilesList 
              files={sectionFiles} 
              onDelete={deleteFile}
              section="repository"
              onFileDeleted={onFileUpdated}
            />
          </TabsContent>

          <TabsContent value="technical" className="space-y-4">
            <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
              <CardContent className="p-8 text-center">
                <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Technical Documentation</h4>
                <p className="text-muted-foreground mb-4">
                  API docs, technical specs, development guidelines, integration docs, performance reports
                </p>
                <Button onClick={() => document.getElementById('technical-upload')?.click()} className="mb-2">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Technical Docs
                </Button>
                <input
                  id="technical-upload"
                  type="file"
                  multiple
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.md,.csv,.xlsx,.xls,image/*"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files) {
                      Array.from(files).forEach(file => handleFileUpload(file));
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">+5 points for technical context</p>
              </CardContent>
            </Card>
            <UploadedFilesList 
              files={sectionFiles} 
              onDelete={deleteFile}
              section="repository"
              onFileDeleted={onFileUpdated}
            />
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
              <CardContent className="p-8 text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Performance Data</h4>
                <p className="text-muted-foreground mb-4">
                  Monthly reports, KPI dashboards, financial reports, growth metrics, campaign results
                </p>
                <Button onClick={() => document.getElementById('performance-upload')?.click()} className="mb-2">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Performance Data
                </Button>
                <input
                  id="performance-upload"
                  type="file"
                  multiple
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.md,.csv,.xlsx,.xls,image/*"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files) {
                      Array.from(files).forEach(file => handleFileUpload(file));
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">+5 points for performance insights</p>
              </CardContent>
            </Card>
            <UploadedFilesList 
              files={sectionFiles} 
              onDelete={deleteFile}
              section="repository"
              onFileDeleted={onFileUpdated}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default KnowledgeVaultConfig;