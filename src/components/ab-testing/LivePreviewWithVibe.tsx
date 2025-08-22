import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrapedSiteData, TargetableElement } from "@/services/scrapingService";
import { Monitor, Smartphone, Wand2, Send, RotateCcw, Code, Loader2, Sparkles } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface LivePreviewWithVibeProps {
  scrapedData: ScrapedSiteData;
  onCodeGenerated: (code: string) => void;
  // Extended for suggestion integration
  initialModifications?: any;
  suggestionContext?: {
    title: string;
    approach: string;
    description: string;
    reasoning: string;
  };
}

interface SelectedElement extends TargetableElement {
  computedStyles?: Record<string, string>;
  tagName?: string;
}

interface VibeModification {
  id: string;
  prompt: string;
  elementId: string;
  modifications: Record<string, string>;
  timestamp: number;
}

export const LivePreviewWithVibe: React.FC<LivePreviewWithVibeProps> = ({
  scrapedData,
  onCodeGenerated,
  initialModifications,
  suggestionContext
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [vibePrompt, setVibePrompt] = useState('');
  const [isProcessingVibe, setIsProcessingVibe] = useState(false);
  const [modifications, setModifications] = useState<VibeModification[]>([]);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [conversationHistory, setConversationHistory] = useState<Array<{
    type: 'user' | 'assistant';
    content: string;
    elementId?: string;
    timestamp: number;
  }>>([]);

  useEffect(() => {
    if (scrapedData && iframeRef.current) {
      setupLivePreview();
    }
  }, [scrapedData]);

  useEffect(() => {
    // Apply initial modifications from suggestion if provided
    if (initialModifications && isLoaded && iframeRef.current?.contentWindow) {
      setTimeout(() => {
        iframeRef.current!.contentWindow!.postMessage({
          type: 'applyModifications',
          elementId: 'suggestion-initial',
          modifications: initialModifications.cssModifications || initialModifications
        }, '*');
        
        // Add suggestion context to conversation history
        if (suggestionContext) {
          setConversationHistory([{
            type: 'assistant',
            content: `Applied suggestion: "${suggestionContext.title}". ${suggestionContext.reasoning}`,
            timestamp: Date.now()
          }]);
        }
      }, 1000);
    }
  }, [initialModifications, suggestionContext, isLoaded]);

  useEffect(() => {
    // Listen for element selection from iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'elementSelected') {
        const elementData = scrapedData.targetableElements.find(
          el => el.croId === event.data.elementId.split('-')[0] + '-' + event.data.elementId.split('-')[1]
        );
        
        if (elementData) {
          setSelectedElement({
            ...elementData,
            computedStyles: event.data.styles
          });
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [scrapedData.targetableElements]);

  const setupLivePreview = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const fullHTML = scrapedData.html.includes('<!DOCTYPE html') 
      ? scrapedData.html 
      : buildCompleteHTML();
    
    iframe.srcdoc = fullHTML;
    iframe.onload = () => {
      setIsLoaded(true);
      toast({
        title: "Live Preview Ready",
        description: "Click any element to start editing with Vibe Coding",
      });
    };
  };

  const buildCompleteHTML = () => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${scrapedData.htmlStructure.title}</title>
    <style>
        ${scrapedData.css}
        
        /* CRO Editor Styles */
        .cro-editable {
            position: relative;
            transition: all 0.2s ease;
        }
        .cro-editable:hover {
            outline: 2px solid rgba(59, 130, 246, 0.8) !important;
            cursor: pointer;
        }
        .cro-selected {
            outline: 2px solid #3B82F6 !important;
            background-color: rgba(59, 130, 246, 0.1) !important;
        }
        
        /* Prevent external navigation */
        a { pointer-events: none; }
        form { pointer-events: none; }
        
        /* Ensure visibility */
        body { min-height: 100vh; padding: 20px; }
    </style>
</head>
<body>
    ${scrapedData.html}
    
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const targetableElements = ${JSON.stringify(scrapedData.targetableElements)};
            
            targetableElements.forEach((elementData, index) => {
                const elements = document.querySelectorAll(elementData.selector);
                elements.forEach((element, subIndex) => {
                    element.classList.add('cro-editable');
                    element.dataset.croId = elementData.croId + '-' + subIndex;
                    
                    element.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        document.querySelectorAll('.cro-selected').forEach(el => {
                            el.classList.remove('cro-selected');
                        });
                        
                        this.classList.add('cro-selected');
                        
                        window.parent.postMessage({
                            type: 'elementSelected',
                            elementId: this.dataset.croId,
                            tagName: this.tagName,
                            textContent: this.textContent?.trim() || '',
                            selector: elementData.selector,
                            styles: {
                                backgroundColor: window.getComputedStyle(this).backgroundColor,
                                color: window.getComputedStyle(this).color,
                                fontSize: window.getComputedStyle(this).fontSize,
                                fontWeight: window.getComputedStyle(this).fontWeight,
                                borderRadius: window.getComputedStyle(this).borderRadius,
                                padding: window.getComputedStyle(this).padding,
                                margin: window.getComputedStyle(this).margin
                            }
                        }, '*');
                    });
                });
            });
        });
        
        window.addEventListener('message', function(event) {
            if (event.data.type === 'applyModifications') {
                const { elementId, modifications } = event.data;
                const element = document.querySelector('[data-cro-id="' + elementId + '"]');
                if (element) {
                    Object.entries(modifications).forEach(([property, value]) => {
                        if (property === 'textContent') {
                            element.textContent = value;
                        } else {
                            element.style[property] = value;
                        }
                    });
                }
            }
        });
    </script>
</body>
</html>
    `;
  };

  const handleVibePrompt = async () => {
    if (!vibePrompt.trim() || !selectedElement) {
      toast({
        title: "Missing Information",
        description: "Please select an element and enter a prompt",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingVibe(true);
    
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Add user message to conversation
      const userMessage = {
        type: 'user' as const,
        content: vibePrompt,
        elementId: selectedElement.croId,
        timestamp: Date.now()
      };
      setConversationHistory(prev => [...prev, userMessage]);

      const { data, error } = await supabase.functions.invoke('vibe-scraped-modification', {
        body: {
          prompt: vibePrompt,
          selectedElement,
          scrapedData,
          conversationHistory,
          currentModifications: modifications
        }
      });

      if (error) throw error;

      if (data.success) {
        const newModification: VibeModification = {
          id: `mod-${Date.now()}`,
          prompt: vibePrompt,
          elementId: selectedElement.croId,
          modifications: data.modifications,
          timestamp: Date.now()
        };

        setModifications(prev => [...prev, newModification]);

        // Apply modifications to iframe
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage({
            type: 'applyModifications',
            elementId: selectedElement.croId,
            modifications: data.modifications
          }, '*');
        }

        // Add assistant response to conversation
        const assistantMessage = {
          type: 'assistant' as const,
          content: data.explanation || "Changes applied successfully!",
          elementId: selectedElement.croId,
          timestamp: Date.now()
        };
        setConversationHistory(prev => [...prev, assistantMessage]);

        toast({
          title: "Vibe Coding Applied!",
          description: data.explanation || "Your changes have been applied to the preview",
        });

        setVibePrompt('');
      } else {
        throw new Error(data.error || 'Failed to process Vibe prompt');
      }
    } catch (error: any) {
      console.error('Vibe coding failed:', error);
      toast({
        title: "Vibe Coding Failed",
        description: error.message || "Unable to process your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingVibe(false);
    }
  };

  const resetModifications = () => {
    setModifications([]);
    setConversationHistory([]);
    setupLivePreview(); // Reload original preview
    toast({
      title: "Preview Reset",
      description: "All modifications have been cleared",
    });
  };

  const generateFinalCode = () => {
    const css = modifications.map(mod => {
      return `/* ${mod.prompt} */\n${selectedElement?.selector} {\n${
        Object.entries(mod.modifications)
          .filter(([key]) => key !== 'textContent')
          .map(([key, value]) => `  ${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`)
          .join('\n')
      }\n}`;
    }).join('\n\n');

    const html = modifications.some(mod => mod.modifications.textContent) 
      ? `<!-- Text modifications -->\n${modifications
          .filter(mod => mod.modifications.textContent)
          .map(mod => `<!-- ${mod.prompt}: Change "${selectedElement?.text}" to "${mod.modifications.textContent}" -->`)
          .join('\n')}`
      : '';

    const finalCode = `${html ? html + '\n\n' : ''}${css}`;
    onCodeGenerated(finalCode);
    
    toast({
      title: "Code Generated!",
      description: "Your Vibe Coding changes have been converted to CSS code",
    });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Live Preview - 2 columns */}
      <div className="xl:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              Live Preview with Vibe Coding
              {suggestionContext && (
                <Badge variant="secondary" className="ml-2">
                  Based on: {suggestionContext.title}
                </Badge>
              )}
            </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={previewDevice === 'desktop' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewDevice('desktop')}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={previewDevice === 'mobile' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewDevice('mobile')}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={resetModifications}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {selectedElement && (
              <Badge variant="secondary" className="w-fit">
                {selectedElement.tagName} selected: "{selectedElement.text.substring(0, 30)}..."
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            <div className="relative">
              <iframe
                ref={iframeRef}
                className={`w-full border rounded-lg transition-all duration-300 ${
                  previewDevice === 'desktop' ? 'h-96' : 'h-[600px] max-w-sm mx-auto'
                }`}
                sandbox="allow-scripts allow-same-origin"
                title="Live Preview with Vibe Coding"
              />
              
              {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">Loading live preview...</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vibe Coding Panel - 1 column */}
      <div className="space-y-6">
        {/* Vibe Prompt */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Vibe Coding
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedElement ? (
              <div className="text-center text-muted-foreground py-8">
                <Wand2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm">Click an element in the preview to start Vibe Coding</p>
              </div>
            ) : (
              <>
                <div className="p-3 bg-primary/5 rounded-lg">
                  <p className="text-sm font-medium">Selected Element:</p>
                  <p className="text-xs text-muted-foreground">{selectedElement.tagName} - "{selectedElement.text}"</p>
                </div>
                
                <Textarea
                  value={vibePrompt}
                  onChange={(e) => setVibePrompt(e.target.value)}
                  placeholder="Describe how you want to modify this element...&#10;&#10;Examples:&#10;• 'Make this button larger and green'&#10;• 'Change the text to be more compelling'&#10;• 'Add a subtle shadow and round the corners'"
                  rows={4}
                  disabled={isProcessingVibe}
                />
                
                <Button 
                  onClick={handleVibePrompt}
                  disabled={isProcessingVibe || !vibePrompt.trim()}
                  className="w-full"
                >
                  {isProcessingVibe ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Apply Vibe Coding
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Conversation History */}
        {conversationHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Conversation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {conversationHistory.map((message, index) => (
                  <div key={index} className={`p-2 rounded-lg text-sm ${
                    message.type === 'user' 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <p className="font-medium text-xs mb-1">
                      {message.type === 'user' ? 'You' : 'AI'}
                    </p>
                    <p>{message.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modifications History */}
        {modifications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                Changes Applied
                <Button variant="outline" size="sm" onClick={generateFinalCode}>
                  <Code className="h-4 w-4 mr-2" />
                  Generate Code
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {modifications.map((mod, index) => (
                  <div key={mod.id} className="p-2 bg-success/10 rounded-lg">
                    <p className="text-xs text-success font-medium">#{index + 1}</p>
                    <p className="text-sm">{mod.prompt}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};