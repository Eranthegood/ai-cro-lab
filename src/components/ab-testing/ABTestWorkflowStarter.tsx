import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Upload, Globe, Target, Database, FileText, Zap } from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";
import { toast } from "@/hooks/use-toast";
import { VaultFileSelector } from "./VaultFileSelector";

interface ABTestWorkflowStarterProps {
  onStartWorkflow: (data: WorkflowData) => void;
}

export interface WorkflowData {
  pageUrl: string;
  goalType: string;
  businessContext: string;
  currentPain: string;
  useVaultKnowledge: boolean;
  selectedVaultFiles: any[];
  uploadedFiles: File[];
  analysisMode: 'enhanced';
}

export const ABTestWorkflowStarter: React.FC<ABTestWorkflowStarterProps> = ({ 
  onStartWorkflow 
}) => {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  
  // Form state
  const [pageUrl, setPageUrl] = useState('');
  const [goalType, setGoalType] = useState('conversion');
  const [businessContext, setBusinessContext] = useState('');
  const [currentPain, setCurrentPain] = useState('');
  
  // Vault state
  const [useVaultKnowledge, setUseVaultKnowledge] = useState(false);
  const [selectedVaultFiles, setSelectedVaultFiles] = useState<any[]>([]);
  
  // Upload state
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  // UI state
  const [isValidating, setIsValidating] = useState(false);

  const validateUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol.startsWith('http');
    } catch {
      return false;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
    
    toast({
      title: "Fichiers ajoutés",
      description: `${files.length} fichier(s) ajouté(s) pour l'analyse`,
    });
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleStartWorkflow = async () => {
    // Validation
    if (!pageUrl.trim()) {
      toast({
        title: "URL Requise",
        description: "Veuillez entrer l'URL du site web à analyser",
        variant: "destructive",
      });
      return;
    }

    if (!validateUrl(pageUrl)) {
      toast({
        title: "URL Invalide",
        description: "Veuillez entrer une URL valide (ex: https://example.com)",
        variant: "destructive",
      });
      return;
    }

    if (!currentWorkspace || !user) {
      toast({
        title: "Erreur d'Authentification",
        description: "Assurez-vous d'être connecté et d'avoir sélectionné un workspace",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);

    try {
      const workflowData: WorkflowData = {
        pageUrl: pageUrl.trim(),
        goalType,
        businessContext: businessContext.trim(),
        currentPain: currentPain.trim(),
        useVaultKnowledge,
        selectedVaultFiles,
        uploadedFiles,
        analysisMode: 'enhanced'
      };

      onStartWorkflow(workflowData);
      
    } catch (error: any) {
      console.error('Workflow start error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de démarrer l'analyse",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Générateur de Tests A/B</h2>
        <p className="text-muted-foreground">
          Analysez votre site web et générez des suggestions de tests A/B basées sur l'IA
        </p>
      </div>

      {/* Step 1: Website Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            1. Analyse du Site Web
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="page-url">URL du Site Web *</Label>
              <Input
                id="page-url"
                value={pageUrl}
                onChange={(e) => setPageUrl(e.target.value)}
                placeholder="https://example.com"
                required
                disabled={isValidating}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="goal-type">Objectif d'Optimisation</Label>
              <Select value={goalType} onValueChange={setGoalType} disabled={isValidating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conversion">🎯 Augmenter le Taux de Conversion</SelectItem>
                  <SelectItem value="cart">🛒 Réduire l'Abandon de Panier</SelectItem>
                  <SelectItem value="form">📝 Améliorer la Complétion de Formulaires</SelectItem>
                  <SelectItem value="ctr">👆 Augmenter le Taux de Clic</SelectItem>
                  <SelectItem value="engagement">⏱️ Améliorer l'Engagement</SelectItem>
                  <SelectItem value="revenue">💰 Augmenter le Chiffre d'Affaires</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="business-context">Contexte Business (Optionnel)</Label>
              <Input
                id="business-context"
                value={businessContext}
                onChange={(e) => setBusinessContext(e.target.value)}
                placeholder="Ex: E-commerce mode, SaaS B2B..."
                disabled={isValidating}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="current-pain">Problème Actuel (Optionnel)</Label>
              <Input
                id="current-pain"
                value={currentPain}
                onChange={(e) => setCurrentPain(e.target.value)}
                placeholder="Ex: Taux de conversion faible..."
                disabled={isValidating}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Data Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            2. Données d'Analyse (Optionnel)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Upload de Fichiers</Label>
            <Input
              id="file-upload"
              type="file"
              multiple
              onChange={handleFileUpload}
              accept=".csv,.xlsx,.json,.txt,.pdf"
              disabled={isValidating}
            />
            <p className="text-sm text-muted-foreground">
              Analytics, heatmaps, feedback utilisateur, études de marché...
            </p>
          </div>

          {/* Uploaded Files Display */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <Label>Fichiers Uploadés ({uploadedFiles.length})</Label>
              <div className="flex flex-wrap gap-2">
                {uploadedFiles.map((file, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="flex items-center gap-1"
                  >
                    <FileText className="h-3 w-3" />
                    {file.name}
                    <button
                      onClick={() => removeUploadedFile(index)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 3: Knowledge Vault */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            3. Knowledge Vault
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="use-vault"
              checked={useVaultKnowledge}
              onCheckedChange={setUseVaultKnowledge}
              disabled={isValidating}
            />
            <Label htmlFor="use-vault">Utiliser les données du Knowledge Vault</Label>
          </div>

          {useVaultKnowledge && (
            <VaultFileSelector
              selectedFiles={selectedVaultFiles}
              onFilesChange={setSelectedVaultFiles}
            />
          )}
        </CardContent>
      </Card>

      {/* Action Button */}
      <div className="flex justify-center">
        <Button 
          onClick={handleStartWorkflow}
          disabled={isValidating || !pageUrl.trim()}
          size="lg"
          className="px-8"
        >
          {isValidating ? (
            <>
              <Zap className="h-4 w-4 mr-2 animate-pulse" />
              Validation en cours...
            </>
          ) : (
            <>
              <Target className="h-4 w-4 mr-2" />
              Démarrer l'Analyse A/B
            </>
          )}
        </Button>
      </div>

      {/* Features Summary */}
      <div className="flex flex-wrap justify-center gap-2">
        <Badge variant="secondary">🔥 Firecrawl Scraping</Badge>
        <Badge variant="secondary">🧠 Analyse IA Claude</Badge>
        <Badge variant="secondary">📊 9 Suggestions Personnalisées</Badge>
        <Badge variant="secondary">🎨 Preview Interactive</Badge>
        <Badge variant="secondary">✨ Vibe Coding</Badge>
        <Badge variant="secondary">💻 Génération de Code</Badge>
      </div>
    </div>
  );
};