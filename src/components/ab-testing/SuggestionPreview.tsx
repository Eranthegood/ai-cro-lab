import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Monitor, Smartphone, ArrowLeft, Wand2, Code, Loader2 } from 'lucide-react';
import { ScrapedSiteData } from "@/services/scrapingService";
import { toast } from "@/hooks/use-toast";

interface SuggestionPreviewProps {
  suggestion: any;
  scrapedData: ScrapedSiteData;
  onBackToSuggestions: () => void;
  onStartVibeCoding: (initialModifications: any, suggestionContext: any) => void;
}

export const SuggestionPreview: React.FC<SuggestionPreviewProps> = ({
  suggestion,
  scrapedData,
  onBackToSuggestions,
  onStartVibeCoding
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [isApplyingModifications, setIsApplyingModifications] = useState(false);
  const [modificationsApplied, setModificationsApplied] = useState(false);

  useEffect(() => {
    if (scrapedData && iframeRef.current) {
      setupPreview();
    }
  }, [scrapedData]);

  const setupPreview = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const fullHTML = buildPreviewHTML();
    iframe.srcdoc = fullHTML;
    iframe.onload = () => {
      setIsLoaded(true);
      // Auto-apply suggestion modifications after a brief delay
      setTimeout(() => {
        applySuggestionModifications();
      }, 1000);
    };
  };

  const buildPreviewHTML = () => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${scrapedData.htmlStructure.title}</title>
    <style>
        ${scrapedData.css}
        
        /* Preview Enhancement Styles */
        body { 
            margin: 0; 
            padding: 20px; 
            min-height: 100vh; 
        }
        
        /* Disable interactions for preview */
        a, button, form, input { 
            pointer-events: none !important; 
        }
        
        /* Highlight modified elements */
        .suggestion-modified {
            position: relative;
            animation: highlight-pulse 2s ease-in-out infinite;
        }
        
        .suggestion-modified::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            border: 2px solid #3B82F6;
            border-radius: 4px;
            opacity: 0.5;
            pointer-events: none;
            z-index: 1000;
        }
        
        @keyframes highlight-pulse {
            0%, 100% { box-shadow: 0 0 0 rgba(59, 130, 246, 0); }
            50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
        }
        
        /* Suggestion applied indicator */
        .suggestion-applied::after {
            content: '✨ Modified';
            position: absolute;
            top: -10px;
            right: -10px;
            background: #10B981;
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: bold;
            z-index: 1001;
        }
    </style>
</head>
<body>
    ${scrapedData.html}
    
    <script>
        window.applySuggestionModifications = function(modifications) {
            console.log('Applying suggestion modifications:', modifications);
            
            if (modifications.targetSelector) {
                const elements = document.querySelectorAll(modifications.targetSelector);
                console.log('Found elements:', elements.length);
                
                elements.forEach((element, index) => {
                    // Apply CSS modifications
                    if (modifications.cssModifications) {
                        Object.entries(modifications.cssModifications).forEach(([property, value]) => {
                            element.style[property] = value;
                        });
                    }
                    
                    // Apply text changes
                    if (modifications.textChanges) {
                        Object.entries(modifications.textChanges).forEach(([originalText, newText]) => {
                            if (element.textContent && element.textContent.includes(originalText)) {
                                element.textContent = element.textContent.replace(originalText, newText);
                            } else if (element.textContent) {
                                element.textContent = newText;
                            }
                        });
                    }
                    
                    // Add new elements if specified
                    if (modifications.newElements && index === 0) {
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = modifications.newElements;
                        while (tempDiv.firstChild) {
                            element.appendChild(tempDiv.firstChild);
                        }
                    }
                    
                    // Add visual indicators
                    element.classList.add('suggestion-modified', 'suggestion-applied');
                });
                
                return elements.length;
            }
            
            return 0;
        };
        
        window.addEventListener('message', function(event) {
            if (event.data.type === 'applySuggestion') {
                const count = window.applySuggestionModifications(event.data.modifications);
                window.parent.postMessage({
                    type: 'suggestionApplied',
                    success: count > 0,
                    modifiedCount: count
                }, '*');
            }
        });
    </script>
</body>
</html>
    `;
  };

  const applySuggestionModifications = async () => {
    if (!suggestion.preview_data && !suggestion.previewData) {
      toast({
        title: "No Preview Data",
        description: "This suggestion doesn't include preview modifications",
        variant: "destructive",
      });
      return;
    }

    setIsApplyingModifications(true);

    try {
      // Extract preview data from suggestion
      const previewData = suggestion.preview_data || suggestion.previewData || {};
      
      // Convert text-based modifications to structured format
      let modifications = {};
      
      if (typeof previewData === 'string') {
        // Try to parse if it's a JSON string
        try {
          modifications = JSON.parse(previewData);
        } catch {
          // Fallback: create basic modifications based on suggestion content
          modifications = createFallbackModifications();
        }
      } else {
        modifications = previewData;
      }

      // Send modifications to iframe
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: 'applySuggestion',
          modifications
        }, '*');
      }

      // Listen for completion
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'suggestionApplied') {
          setModificationsApplied(event.data.success);
          setIsApplyingModifications(false);
          
          if (event.data.success) {
            toast({
              title: "Suggestion Applied!",
              description: `Modified ${event.data.modifiedCount} element(s) according to the suggestion`,
            });
          } else {
            toast({
              title: "Application Failed",
              description: "Could not apply modifications. Using fallback approach.",
              variant: "destructive",
            });
          }
          
          window.removeEventListener('message', handleMessage);
        }
      };

      window.addEventListener('message', handleMessage);
      
      // Timeout fallback
      setTimeout(() => {
        setIsApplyingModifications(false);
        window.removeEventListener('message', handleMessage);
      }, 5000);

    } catch (error) {
      console.error('Failed to apply suggestion modifications:', error);
      setIsApplyingModifications(false);
      toast({
        title: "Application Error",
        description: "Failed to apply suggestion modifications",
        variant: "destructive",
      });
    }
  };

  const createFallbackModifications = () => {
    // Create basic modifications based on suggestion approach
    const approach = suggestion.approach || suggestion.category;
    
    if (approach === 'Technical UX') {
      return {
        targetSelector: 'button, .btn, [type="submit"]',
        cssModifications: {
          borderRadius: '8px',
          padding: '12px 24px',
          fontWeight: '600',
          transform: 'scale(1.02)'
        }
      };
    } else if (approach === 'Psychology') {
      return {
        targetSelector: '.price, .cta, h1, h2',
        cssModifications: {
          color: '#DC2626',
          fontWeight: 'bold'
        },
        newElements: '<div style="background: #FEF2F2; border: 1px solid #FECACA; padding: 8px; margin: 10px 0; border-radius: 4px; color: #991B1B; font-size: 14px;">🔥 Limited time offer!</div>'
      };
    } else {
      return {
        targetSelector: '.logo, .brand, h1',
        cssModifications: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent'
        }
      };
    }
  };

  const handleStartVibeCoding = () => {
    const initialModifications = suggestion.preview_data || suggestion.previewData || createFallbackModifications();
    const suggestionContext = {
      title: suggestion.title,
      approach: suggestion.approach,
      description: suggestion.solution_description || suggestion.solution,
      reasoning: suggestion.psychology_insight || suggestion.psychologyInsight
    };

    onStartVibeCoding(initialModifications, suggestionContext);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBackToSuggestions}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Suggestions
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{suggestion.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">{suggestion.approach}</Badge>
                <Badge variant="outline">{suggestion.code_complexity || suggestion.difficulty || 'Medium'}</Badge>
                {modificationsApplied && (
                  <Badge className="bg-success text-success-foreground">
                    ✨ Applied
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <Button onClick={handleStartVibeCoding} className="bg-primary">
            <Wand2 className="h-4 w-4 mr-2" />
            Continue with Vibe Coding
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Preview - 2 columns */}
          <div className="xl:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-primary" />
                    Suggestion Preview
                    {isApplyingModifications && (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
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
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <iframe
                    ref={iframeRef}
                    className={`w-full border rounded-lg transition-all duration-300 ${
                      previewDevice === 'desktop' ? 'h-96' : 'h-[600px] max-w-sm mx-auto'
                    }`}
                    sandbox="allow-scripts allow-same-origin"
                    title="Suggestion Preview"
                  />
                  
                  {!isLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                        <p className="text-sm text-muted-foreground">Loading preview...</p>
                      </div>
                    </div>
                  )}
                  
                  {isApplyingModifications && (
                    <div className="absolute inset-0 bg-black/10 rounded-lg flex items-center justify-center">
                      <div className="bg-white p-4 rounded-lg shadow-lg">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                        <p className="text-sm font-medium">Applying suggestion...</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Suggestion Details - 1 column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Suggestion Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">🎯 Problem Detected</h4>
                  <p className="text-sm text-muted-foreground">
                    {suggestion.problem_detected || suggestion.problem || 'Analysis in progress'}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">💡 Solution</h4>
                  <p className="text-sm text-muted-foreground">
                    {suggestion.solution_description || 
                     (typeof suggestion.solution === 'object' ? suggestion.solution.approach : suggestion.solution) ||
                     'Solution details being generated'}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">🧠 Psychology Insight</h4>
                  <p className="text-sm text-muted-foreground">
                    {suggestion.psychology_insight || 
                     (typeof suggestion.solution === 'object' ? suggestion.solution.psychological_rationale : suggestion.psychologyInsight) ||
                     'Behavioral analysis pending'}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">📈 Expected Impact</h4>
                  <p className="text-sm text-muted-foreground">
                    {suggestion.expected_impact || suggestion.expectedImpact || 'Impact analysis pending'}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">⚙️ Implementation</h4>
                  <p className="text-sm text-muted-foreground">
                    {suggestion.implementation_method || 'Implementation details available in Vibe Coding phase'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    The suggestion has been applied to the preview above. You can now:
                  </p>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      Review the visual changes in the preview
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      Continue with Vibe Coding for refinements
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      Generate final implementation code
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};