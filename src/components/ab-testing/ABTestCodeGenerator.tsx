import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Code, Smartphone, Monitor, Play, Download, MessageCircle, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface ABTestCodeGeneratorProps {
  suggestion: any;
  data: any;
  onCodeGenerated: (code: string) => void;
  onBack: () => void;
}

export const ABTestCodeGenerator = ({ suggestion, data, onCodeGenerated, onBack }: ABTestCodeGeneratorProps) => {
  const [selectedPlatform, setSelectedPlatform] = useState('ab-tasty');
  const [isPreviewMobile, setIsPreviewMobile] = useState(false);
  const [currentCSS, setCurrentCSS] = useState(suggestion.implementation.code);
  const [messages, setMessages] = useState<Array<{type: 'user' | 'ai'; content: string; timestamp: string}>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isGeneratingVariation, setIsGeneratingVariation] = useState(false);

  const platforms = {
    'ab-tasty': {
      name: 'AB Tasty',
      logo: '🅰️',
      code: suggestion.implementation.code,
      setup: suggestion.implementation.setup
    },
    'optimizely': {
      name: 'Optimizely',
      logo: '🔵',
      code: suggestion.implementation.code.replace('!important', ''),
      setup: [
        "Créer une nouvelle expérience dans Optimizely",
        "Sélectionner l'élément cible avec le sélecteur visuel",
        "Appliquer les styles CSS dans l'éditeur",
        "Configurer l'audience et la répartition de trafic"
      ]
    },
    'vwo': {
      name: 'Visual Website Optimizer',
      logo: '🟡',
      code: suggestion.implementation.code,
      setup: [
        "Créer un nouveau test A/B dans VWO",
        "Utiliser l'éditeur visuel pour identifier l'élément",
        "Injecter le CSS personnalisé",
        "Définir les objectifs de conversion"
      ]
    },
    'google-optimize': {
      name: 'Google Optimize',
      logo: '🔍',
      code: suggestion.implementation.code.replace(/!important/g, ''),
      setup: [
        "Créer une expérience dans Google Optimize",
        "Lier avec Google Analytics",
        "Utiliser l'éditeur de variantes",
        "Configurer les objectifs de conversion"
      ]
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "Code copié",
        description: "Le code a été copié dans votre presse-papiers",
      });
    } catch (error) {
      toast({
        title: "Erreur de copie",
        description: "Impossible de copier le code automatiquement",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      type: 'user' as const,
      content: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsGeneratingVariation(true);

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    let aiResponse = '';
    let newCSS = currentCSS;
    const lowerInput = inputMessage.toLowerCase();
    
    if (lowerInput.includes('vert') || lowerInput.includes('green')) {
      newCSS = currentCSS.replace(/#FF6B35/g, '#28a745').replace(/#F7931E/g, '#20c997');
      aiResponse = "✅ Couleur changée en vert ! J'ai appliqué un vert professionnel (#28a745) qui inspire confiance et sécurité.";
    } else if (lowerInput.includes('plus gros') || lowerInput.includes('bigger') || lowerInput.includes('larger')) {
      newCSS = currentCSS.replace(/18px/g, '22px').replace(/16px 32px/g, '20px 40px');
      aiResponse = "✅ Taille augmentée ! Le bouton est maintenant plus visible avec une police de 22px et plus de padding.";
    } else if (lowerInput.includes('shadow') || lowerInput.includes('ombre')) {
      if (!currentCSS.includes('box-shadow')) {
        newCSS = currentCSS.replace(/}$/m, '  box-shadow: 0 6px 20px rgba(0,0,0,0.15) !important;\n}');
      }
      aiResponse = "✅ Ombre ajoutée ! Le bouton a maintenant plus de profondeur et se détache mieux du fond.";
    } else if (lowerInput.includes('arrondi') || lowerInput.includes('rounded')) {
      newCSS = currentCSS.replace(/border-radius: \d+px/g, 'border-radius: 25px');
      aiResponse = "✅ Coins plus arrondis ! Le bouton a maintenant un style plus moderne et doux.";
    } else if (lowerInput.includes('animation') || lowerInput.includes('hover')) {
      if (!currentCSS.includes('transform')) {
        newCSS = currentCSS.replace(/transition: all [^;]+;/g, 'transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;');
        newCSS = newCSS.replace(/:hover \{[^}]+\}/g, 
          `:hover {
  transform: translateY(-3px) scale(1.02) !important;
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4) !important;
}`);
      }
      aiResponse = "✅ Animation améliorée ! Le bouton a maintenant un effet de survol plus engageant avec une transition fluide.";
    } else {
      aiResponse = "✅ Modification appliquée ! J'ai interprété votre demande et adapté le design en conséquence.";
    }

    setCurrentCSS(newCSS);
    
    const aiMessage = {
      type: 'ai' as const,
      content: aiResponse,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsGeneratingVariation(false);
  };

  const renderPreview = () => {
    const containerStyle = isPreviewMobile ? 
      { width: '375px', height: '200px', margin: '0 auto', border: '2px solid #e5e7eb', borderRadius: '20px', padding: '20px', backgroundColor: '#f8f9fa' } :
      { width: '100%', height: '200px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' };

    return (
      <div style={containerStyle}>
        <style dangerouslySetInnerHTML={{ __html: currentCSS }} />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <button className="cta-button" style={{ cursor: 'pointer' }}>
            {suggestion.title.includes('checkout') ? 'CONTINUER VERS LE PAIEMENT' : 
             suggestion.title.includes('cart') ? 'AJOUTER AU PANIER' :
             'COMMENCER MAINTENANT'}
          </button>
        </div>
      </div>
    );
  };

  const generateImplementationGuide = () => {
    const platform = platforms[selectedPlatform as keyof typeof platforms];
    return {
      ...platform,
      code: selectedPlatform === 'ab-tasty' ? currentCSS : 
            selectedPlatform === 'optimizely' ? currentCSS.replace(/!important/g, '') :
            currentCSS
    };
  };

  useEffect(() => {
    onCodeGenerated(currentCSS);
  }, [currentCSS, onCodeGenerated]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Générateur de code AB Test</h2>
          <p className="text-muted-foreground mt-1">{suggestion.title}</p>
        </div>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux suggestions
        </Button>
      </div>

      {/* Test Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            Aperçu du test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Impact attendu:</span>
              <div className="text-lg font-bold text-green-600">{suggestion.expectedImpact}</div>
            </div>
            <div>
              <span className="font-medium">Confiance:</span>
              <div className="text-lg font-bold">{suggestion.confidence}%</div>
            </div>
            <div>
              <span className="font-medium">Difficulté:</span>
              <Badge className="ml-2">{suggestion.difficulty}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Preview Panel */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Aperçu en temps réel</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant={!isPreviewMobile ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsPreviewMobile(false)}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={isPreviewMobile ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsPreviewMobile(true)}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* A/B Comparison */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm font-medium mb-2">Version A (Contrôle)</p>
                <div className="border border-muted rounded-lg p-4 bg-muted/20">
                  <button className="bg-gray-400 text-white px-4 py-2 rounded text-sm">
                    Version originale
                  </button>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium mb-2 text-primary">Version B (Test)</p>
                <div className="border-2 border-primary rounded-lg p-4 bg-primary/5">
                  {renderPreview()}
                </div>
              </div>
            </div>

            {/* AI Chat Interface */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Modifier avec l'IA
              </h4>
              
              <div className="border rounded-lg">
                <div className="h-64 overflow-y-auto p-3 bg-muted/20">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Décrivez vos modifications</p>
                      <p className="text-xs mt-1">Ex: "Plus vert", "Plus gros", "Ajouter une ombre"</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((message, index) => (
                        <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-2 rounded-lg text-sm ${
                            message.type === 'user' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-background border'
                          }`}>
                            <p>{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
                          </div>
                        </div>
                      ))}
                      {isGeneratingVariation && (
                        <div className="flex justify-start">
                          <div className="bg-background border p-2 rounded-lg text-sm">
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                              <span>L'IA travaille sur votre modification...</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="p-3 border-t flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Décrivez votre modification..."
                    disabled={isGeneratingVariation}
                  />
                  <Button 
                    size="sm" 
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isGeneratingVariation}
                  >
                    <Zap className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Code Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Code d'implémentation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <TabsList className="grid grid-cols-2 lg:grid-cols-4">
                {Object.entries(platforms).map(([key, platform]) => (
                  <TabsTrigger key={key} value={key} className="text-xs">
                    <span className="mr-1">{platform.logo}</span>
                    {platform.name.split(' ')[0]}
                  </TabsTrigger>
                ))}
              </TabsList>

              {Object.entries(platforms).map(([key, platform]) => (
                <TabsContent key={key} value={key} className="space-y-4">
                  {/* CSS Code */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Code CSS</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyCode(generateImplementationGuide().code)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copier
                      </Button>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-gray-300 text-sm">
                        <code>{generateImplementationGuide().code}</code>
                      </pre>
                    </div>
                  </div>

                  {/* Setup Instructions */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Guide d'implémentation</Label>
                    <div className="space-y-2">
                      {generateImplementationGuide().setup.map((step, index) => (
                        <div key={index} className="flex items-start gap-3 text-sm">
                          <Badge variant="outline" className="min-w-[24px] h-6 flex items-center justify-center text-xs">
                            {index + 1}
                          </Badge>
                          <span className="text-muted-foreground">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Download Button */}
                  <Button className="w-full" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger le guide complet ({platform.name})
                  </Button>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Metrics & Tracking */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Métriques et suivi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium mb-2">Métrique principale</h4>
              <p className="text-sm text-muted-foreground">{suggestion.metrics.primary}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Métriques secondaires</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {suggestion.metrics.secondary.map((metric: string, index: number) => (
                  <li key={index}>• {metric}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Durée recommandée</h4>
              <p className="text-sm text-muted-foreground">2-4 semaines minimum</p>
              <p className="text-xs text-muted-foreground mt-1">
                Jusqu'à significativité statistique (95% de confiance)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};