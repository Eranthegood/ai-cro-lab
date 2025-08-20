import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  FileText, 
  Database, 
  BarChart3, 
  Eye, 
  Brain,
  TrendingUp,
  Calendar,
  Filter
} from 'lucide-react';
import { useKnowledgeVault } from '@/hooks/useKnowledgeVault';
import { cn } from '@/lib/utils';

interface DataExplorationPanelProps {
  className?: string;
  onQuerySuggestion?: (query: string) => void;
}

export const DataExplorationPanel = ({ className, onQuerySuggestion }: DataExplorationPanelProps) => {
  const { getFiles, progress } = useKnowledgeVault();
  const [files, setFiles] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [filteredFiles, setFilteredFiles] = useState<any[]>([]);

  useEffect(() => {
    const fetchFiles = async () => {
      const { files: allFiles } = await getFiles();
      setFiles(allFiles);
    };
    fetchFiles();
  }, [getFiles]);

  useEffect(() => {
    let filtered = files;

    // Filter by section
    if (selectedSection !== 'all') {
      filtered = filtered.filter(file => file.config_section === selectedSection);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(file => 
        file.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.config_section.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredFiles(filtered);
  }, [files, searchQuery, selectedSection]);

  const generateContextualSuggestions = (file: any) => {
    const suggestions = [];
    const fileName = file.file_name.toLowerCase();

    if (fileName.includes('real') && fileName.includes('24-25')) {
      suggestions.push(
        "Quel est le CVR d'hier ?",
        "Analyse l'évolution du CVR sur les 7 derniers jours",
        "Compare les performances web vs app",
        "Identifie les tendances de conversion"
      );
    }

    if (file.config_section === 'behavioral') {
      suggestions.push(
        "Analyse les comportements utilisateurs",
        "Identifie les points de friction",
        "Quels sont les parcours les plus performants ?"
      );
    }

    if (file.config_section === 'visual') {
      suggestions.push(
        "Analyse les éléments visuels",
        "Suggestions d'amélioration UX/UI",
        "Impact des visuels sur la conversion"
      );
    }

    if (file.config_section === 'predictive') {
      suggestions.push(
        "Prédictions basées sur ces données",
        "Tendances futures identifiées",
        "Recommandations d'optimisation"
      );
    }

    return suggestions.slice(0, 3);
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'repository': return <Database className="h-4 w-4" />;
      case 'behavioral': return <TrendingUp className="h-4 w-4" />;
      case 'visual': return <Eye className="h-4 w-4" />;
      case 'predictive': return <Brain className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getSectionColor = (section: string) => {
    switch (section) {
      case 'repository': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'behavioral': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'visual': return 'bg-purple-500/10 text-purple-700 border-purple-200';
      case 'predictive': return 'bg-orange-500/10 text-orange-700 border-orange-200';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${Math.round(bytes / (1024 * 1024))} MB`;
  };

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Exploration des Données
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher dans les fichiers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchQuery('')}
            disabled={!searchQuery}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4">
        <Tabs value={selectedSection} onValueChange={setSelectedSection} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="repository">Data</TabsTrigger>
            <TabsTrigger value="behavioral">Comportement</TabsTrigger>
            <TabsTrigger value="visual">Visuel</TabsTrigger>
            <TabsTrigger value="predictive">Prédictif</TabsTrigger>
          </TabsList>

          <div className="flex-1 mt-4">
            <ScrollArea className="h-full">
              <div className="space-y-3">
                {filteredFiles.length > 0 ? (
                  filteredFiles.map((file) => (
                    <Card key={file.id} className="border border-border/50 hover:border-border transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getSectionIcon(file.config_section)}
                              <h4 className="font-medium text-sm">{file.file_name}</h4>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="outline" className={getSectionColor(file.config_section)}>
                                {file.config_section}
                              </Badge>
                              <span>{formatFileSize(file.file_size)}</span>
                              <span>{file.file_type}</span>
                            </div>
                          </div>
                        </div>

                        {/* Contextual suggestions */}
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">Suggestions d'analyse :</p>
                          <div className="flex flex-wrap gap-1">
                            {generateContextualSuggestions(file).map((suggestion, idx) => (
                              <Button
                                key={idx}
                                variant="ghost"
                                size="sm"
                                className="h-auto py-1 px-2 text-xs hover:bg-primary/10"
                                onClick={() => onQuerySuggestion?.(suggestion)}
                              >
                                {suggestion}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Special handling for REAL 24-25 */}
                        {file.file_name.includes('REAL 24-25') && (
                          <div className="mt-3 p-2 bg-primary/5 rounded-lg">
                            <div className="flex items-center gap-1 mb-1">
                              <Calendar className="h-3 w-3 text-primary" />
                              <span className="text-xs font-medium text-primary">Données e-commerce temps réel</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              CVR quotidien, traffic, conversions, AOV par canal (web/app)
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">
                      {searchQuery 
                        ? `Aucun fichier trouvé pour "${searchQuery}"`
                        : "Aucun fichier dans cette section"
                      }
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </Tabs>

        {/* Progress summary */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="grid grid-cols-2 gap-4 text-xs">
            {progress.map((section) => (
              <div key={section.section} className="flex justify-between">
                <span className="capitalize text-muted-foreground">{section.section}:</span>
                <span className="font-medium">{section.completion_percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};