import React, { useState } from 'react';
import { Upload, Brain, AlertCircle, FileText, BarChart3, Mouse, CheckSquare, Square } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSimpleVault } from "@/hooks/useSimpleVault";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";
import { toast } from "@/hooks/use-toast";
import { determinePageType, extractBrandFromUrl, extractIndustryFromUrl } from "./utils/pageAnalysis";

interface ABTestCreatorProps {
  onDataUploaded: (data: any) => void;
}

export const ABTestCreator = ({ onDataUploaded }: ABTestCreatorProps) => {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const { files, uploading, uploadFile } = useSimpleVault();
  const [pageUrl, setPageUrl] = useState('');
  const [goalType, setGoalType] = useState('conversion');
  const [useVaultKnowledge, setUseVaultKnowledge] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [businessContext, setBusinessContext] = useState('');
  const [currentPain, setCurrentPain] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    for (const file of Array.from(selectedFiles)) {
      try {
        // Validate file type
        const validTypes = ['.csv', '.json', '.xlsx', '.pdf'];
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        
        if (!validTypes.includes(fileExtension)) {
          toast({
            title: "Type de fichier non supporté",
            description: `Le fichier ${file.name} n'est pas supporté. Formats acceptés: CSV, JSON, Excel, PDF`,
            variant: "destructive",
          });
          continue;
        }

        await uploadFile(file);
        toast({
          title: "Fichier uploadé",
          description: `${file.name} a été ajouté à votre Knowledge Vault`,
        });
      } catch (error: any) {
        console.error('Upload failed:', error);
        toast({
          title: "Erreur d'upload",
          description: error.message || "Impossible d'uploader le fichier",
          variant: "destructive",
        });
      }
    }
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const selectAllFiles = () => {
    setSelectedFiles(files.map(file => file.id));
  };

  const clearFileSelection = () => {
    setSelectedFiles([]);
  };

  const handleAnalyze = async () => {
    if (!pageUrl.trim()) {
      toast({
        title: "URL requise",
        description: "Veuillez entrer l'URL de la page à analyser",
        variant: "destructive",
      });
      return;
    }

    if (!currentWorkspace || !user) {
      toast({
        title: "Erreur d'authentification",
        description: "Workspace ou utilisateur non détecté",
        variant: "destructive",
      });
      return;
    }

    // Filter selected files if vault knowledge is enabled
    const filesToAnalyze = useVaultKnowledge && selectedFiles.length > 0 
      ? files.filter(file => selectedFiles.includes(file.id))
      : useVaultKnowledge 
        ? files 
        : [];

    setIsAnalyzing(true);

    try {
      const analysisData = {
        pageUrl,
        goalType,
        businessContext,
        currentPain,
        useVaultKnowledge,
        selectedFiles: filesToAnalyze,
        context: {
          pageType: determinePageType(pageUrl),
          brand: extractBrandFromUrl(pageUrl),
          industry: extractIndustryFromUrl(pageUrl)
        },
        workspace: currentWorkspace,
        user: user,
        timestamp: Date.now(),
        iterationCount: 0
      };

      // Simulate analysis processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      onDataUploaded(analysisData);
      
      toast({
        title: "Analyse terminée",
        description: `Vos données ont été analysées avec succès${
          useVaultKnowledge && selectedFiles.length > 0 
            ? ` (${selectedFiles.length} fichiers sélectionnés)` 
            : useVaultKnowledge 
              ? ` (${files.length} fichiers de la vault)` 
              : ''
        }`,
      });
    } catch (error: any) {
      console.error('Analysis failed:', error);
      toast({
        title: "Erreur d'analyse",
        description: error.message || "Impossible d'analyser les données",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Upload vos données
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload Area */}
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              accept=".csv,.json,.xlsx,.pdf,.png,.jpg,.jpeg"
              disabled={uploading}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  {uploading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  ) : (
                    <Upload className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div>
                  <p className="text-lg font-medium">
                    {uploading ? 'Upload en cours...' : 'Glissez vos fichiers ici'}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    ou cliquez pour sélectionner
                  </p>
                </div>
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <BarChart3 className="h-3 w-3" />
                    <span>Analytics</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mouse className="h-3 w-3" />
                    <span>Heatmaps</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    <span>User Research</span>
                  </div>
                </div>
              </div>
            </label>
          </div>

          {/* Knowledge Vault Integration */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="use-vault"
              checked={useVaultKnowledge}
              onCheckedChange={(checked) => setUseVaultKnowledge(checked as boolean)}
            />
            <Label htmlFor="use-vault" className="flex items-center gap-2 cursor-pointer">
              <Brain className="h-4 w-4 text-primary" />
              Utiliser l'intelligence du Knowledge Vault
            </Label>
          </div>
          
          {useVaultKnowledge && files.length > 0 && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  Sélection des fichiers à analyser
                </CardTitle>
                <div className="flex items-center gap-2 text-sm">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={selectAllFiles}
                    className="h-7 text-xs"
                  >
                    Tout sélectionner ({files.length})
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearFileSelection}
                    className="h-7 text-xs"
                  >
                    Tout désélectionner
                  </Button>
                  <span className="text-muted-foreground">
                    {selectedFiles.length > 0 
                      ? `${selectedFiles.length} fichier(s) sélectionné(s)`
                      : 'Aucune sélection = toute la vault sera analysée'
                    }
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                  {files.map((file) => (
                    <div 
                      key={file.id} 
                      className="flex items-center gap-3 p-3 bg-background rounded-lg border hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => toggleFileSelection(file.id)}
                    >
                      <div className="flex-shrink-0">
                        {selectedFiles.includes(file.id) ? (
                          <CheckSquare className="h-4 w-4 text-primary" />
                        ) : (
                          <Square className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.file_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {file.file_type} • {(file.file_size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {useVaultKnowledge && files.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Aucun fichier trouvé dans votre Knowledge Vault. Uploadez des fichiers pour utiliser l'intelligence de la vault.
              </AlertDescription>
            </Alert>
          )}
          
          {useVaultKnowledge && files.length > 0 && (
            <Alert>
              <Brain className="h-4 w-4" />
              <AlertDescription>
                {selectedFiles.length > 0 
                  ? `L'IA analysera les ${selectedFiles.length} fichiers sélectionnés pour des recommandations personnalisées.`
                  : `L'IA analysera tous les ${files.length} fichiers de votre vault pour des recommandations personnalisées.`
                }
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Configuration Section */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration du test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="page-url">URL de la page *</Label>
              <Input
                id="page-url"
                value={pageUrl}
                onChange={(e) => setPageUrl(e.target.value)}
                placeholder="https://example.com/checkout"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="goal-type">Objectif principal</Label>
              <Select value={goalType} onValueChange={setGoalType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conversion">🎯 Augmenter le taux de conversion</SelectItem>
                  <SelectItem value="cart">🛒 Réduire l'abandon de panier</SelectItem>
                  <SelectItem value="form">📝 Améliorer la completion de formulaires</SelectItem>
                  <SelectItem value="ctr">👆 Augmenter le taux de clic</SelectItem>
                  <SelectItem value="engagement">⏱️ Améliorer l'engagement</SelectItem>
                  <SelectItem value="revenue">💰 Augmenter le chiffre d'affaires</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="business-context">Contexte business (optionnel)</Label>
            <Textarea
              id="business-context"
              value={businessContext}
              onChange={(e) => setBusinessContext(e.target.value)}
              placeholder="Décrivez votre business, vos utilisateurs, votre marché..."
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="current-pain">Problème actuel (optionnel)</Label>
            <Textarea
              id="current-pain"
              value={currentPain}
              onChange={(e) => setCurrentPain(e.target.value)}
              placeholder="Quel problème spécifique voulez-vous résoudre avec ce test ?"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleAnalyze}
          disabled={!pageUrl.trim() || isAnalyzing}
          size="lg"
          className="min-w-[200px]"
        >
          {isAnalyzing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Analyse en cours...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Analyser & Générer
            </>
          )}
        </Button>
      </div>
    </div>
  );
};