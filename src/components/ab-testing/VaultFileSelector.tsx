import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Database, BarChart3, Eye, Loader2 } from 'lucide-react';
import { useKnowledgeVault } from "@/hooks/useKnowledgeVault";
import { useSimpleVault } from "@/hooks/useSimpleVault";

interface VaultFileSelectorProps {
  selectedFiles: any[];
  onFilesChange: (files: any[]) => void;
}

interface FileWithSection {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  created_at: string;
  config_section?: string;
}

export const VaultFileSelector: React.FC<VaultFileSelectorProps> = ({
  selectedFiles,
  onFilesChange
}) => {
  const { getFiles: getKnowledgeFiles, loading: knowledgeLoading } = useKnowledgeVault();
  const { files: simpleFiles, loading: simpleLoading } = useSimpleVault();
  
  const [sectionFiles, setSectionFiles] = useState<Record<string, FileWithSection[]>>({
    repository: [],
    behavioral: [],
    predictive: [],
    visual: []
  });

  // Load files from both vaults
  useEffect(() => {
    const loadFiles = async () => {
      try {
        // Load knowledge vault files by section
        const sections = ['repository', 'behavioral', 'predictive', 'visual'];
        const sectionData: Record<string, FileWithSection[]> = {};
        
        for (const section of sections) {
          const { files } = await getKnowledgeFiles(section);
          sectionData[section] = files.map(file => ({
            ...file,
            config_section: section
          }));
        }
        
        setSectionFiles(sectionData);
      } catch (error) {
        console.error('Error loading vault files:', error);
      }
    };

    loadFiles();
  }, [getKnowledgeFiles]);

  const isFileSelected = (fileId: string) => {
    return selectedFiles.some(f => f.id === fileId);
  };

  const toggleFileSelection = (file: FileWithSection) => {
    if (isFileSelected(file.id)) {
      onFilesChange(selectedFiles.filter(f => f.id !== file.id));
    } else {
      onFilesChange([...selectedFiles, file]);
    }
  };

  const selectAllInSection = (section: string) => {
    const sectionFilesList = section === 'simple' ? simpleFiles : sectionFiles[section];
    const newSelected = [...selectedFiles];
    
    sectionFilesList.forEach(file => {
      if (!isFileSelected(file.id)) {
        newSelected.push(file);
      }
    });
    
    onFilesChange(newSelected);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return <Eye className="h-4 w-4" />;
    if (fileType.includes('csv') || fileType.includes('excel')) return <BarChart3 className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const getSectionInfo = (section: string) => {
    switch (section) {
      case 'repository':
        return {
          icon: <Database className="h-4 w-4" />,
          title: 'Repository',
          desc: 'Documents généraux, guides, ressources'
        };
      case 'behavioral':
        return {
          icon: <BarChart3 className="h-4 w-4" />,
          title: 'Données Comportementales',
          desc: 'Analytics, heatmaps, parcours utilisateur'
        };
      case 'predictive':
        return {
          icon: <BarChart3 className="h-4 w-4" />,
          title: 'Données Prédictives',
          desc: 'Modèles ML, prédictions, tendances'
        };
      case 'visual':
        return {
          icon: <Eye className="h-4 w-4" />,
          title: 'Données Visuelles',
          desc: 'Screenshots, wireframes, designs'
        };
      case 'simple':
        return {
          icon: <FileText className="h-4 w-4" />,
          title: 'Fichiers Généraux',
          desc: 'Vault simple, tous types de fichiers'
        };
      default:
        return {
          icon: <FileText className="h-4 w-4" />,
          title: section,
          desc: ''
        };
    }
  };

  const FileList = ({ files, section }: { files: FileWithSection[], section: string }) => {
    if (files.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-8">
          <Database className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>Aucun fichier dans cette section</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {files.length} fichier(s) disponible(s)
          </p>
          <button
            onClick={() => selectAllInSection(section)}
            className="text-sm text-primary hover:underline"
          >
            Tout sélectionner
          </button>
        </div>

        {files.map((file) => (
          <Card key={file.id} className="hover:bg-muted/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={isFileSelected(file.id)}
                  onCheckedChange={() => toggleFileSelection(file)}
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getFileIcon(file.file_type)}
                    <p className="font-medium truncate">{file.file_name}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{formatFileSize(file.file_size)}</span>
                    <span>{new Date(file.created_at).toLocaleDateString('fr-FR')}</span>
                    {file.config_section && (
                      <Badge variant="outline" className="text-xs">
                        {getSectionInfo(file.config_section).title}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (knowledgeLoading || simpleLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Chargement des fichiers du vault...</p>
        </CardContent>
      </Card>
    );
  }

  const totalFiles = Object.values(sectionFiles).reduce((sum, files) => sum + files.length, 0) + simpleFiles.length;
  const totalSelected = selectedFiles.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Sélection de Fichiers du Vault</span>
          <Badge variant="secondary">
            {totalSelected} / {totalFiles} sélectionné(s)
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="repository" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="repository" className="text-xs">
              Repository ({sectionFiles.repository.length})
            </TabsTrigger>
            <TabsTrigger value="behavioral" className="text-xs">
              Comportemental ({sectionFiles.behavioral.length})
            </TabsTrigger>
            <TabsTrigger value="predictive" className="text-xs">
              Prédictif ({sectionFiles.predictive.length})
            </TabsTrigger>
            <TabsTrigger value="visual" className="text-xs">
              Visuel ({sectionFiles.visual.length})
            </TabsTrigger>
            <TabsTrigger value="simple" className="text-xs">
              Général ({simpleFiles.length})
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            {Object.entries(sectionFiles).map(([section, files]) => (
              <TabsContent key={section} value={section}>
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    {getSectionInfo(section).icon}
                    <h3 className="font-semibold">{getSectionInfo(section).title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getSectionInfo(section).desc}
                  </p>
                </div>

                <ScrollArea className="h-96">
                  <FileList files={files} section={section} />
                </ScrollArea>
              </TabsContent>
            ))}

            <TabsContent value="simple">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  {getSectionInfo('simple').icon}
                  <h3 className="font-semibold">{getSectionInfo('simple').title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {getSectionInfo('simple').desc}
                </p>
              </div>

              <ScrollArea className="h-96">
                <FileList files={simpleFiles as FileWithSection[]} section="simple" />
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};