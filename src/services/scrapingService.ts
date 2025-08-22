export interface ScrapedSiteData {
  url: string;
  html: string;
  css: string;
  js?: string;
  assets: {
    images: string[];
    stylesheets: string[];
    scripts: string[];
  };
  htmlStructure: {
    title: string;
    headings: Array<{ level: number; text: string; id?: string }>;
    paragraphs: string[];
    links: Array<{ href: string; text: string }>;
    forms: Array<{ action?: string; method?: string; fields: string[] }>;
  };
  cssClasses: string[];
  interactiveElements: TargetableElement[];
  brandColors: string[];
  typography: {
    fontFamilies: string[];
    headingStyles: Array<{ selector: string; size: string; weight: string }>;
  };
  targetableElements: TargetableElement[];
}

export interface TargetableElement {
  type: 'button' | 'link' | 'heading' | 'text' | 'form' | 'image' | 'section';
  selector: string;
  text: string;
  position: { x: number; y: number; width: number; height: number };
  styles: {
    backgroundColor?: string;
    color?: string;
    fontSize?: string;
    fontWeight?: string;
    borderRadius?: string;
    padding?: string;
    margin?: string;
    textDecoration?: string;
  };
  isVisible: boolean;
  clickable: boolean;
  croId: string; // Unique ID for CRO editing
}

export interface ScrapingOptions {
  includeStyles: boolean;
  includeScripts: boolean;
  analyzeContent: boolean;
  generateSelectors: boolean;
}

class ScrapingService {
  async scrapeSite(url: string, options: ScrapingOptions = {
    includeStyles: true,
    includeScripts: false,
    analyzeContent: true,
    generateSelectors: true
  }): Promise<ScrapedSiteData> {
    try {
      console.log('🔍 Starting enhanced scraping with Firecrawl for:', url);
      
      // Use Supabase Edge Function with Firecrawl
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase.functions.invoke('scrape-site-enhanced', {
        body: {
          url,
          options
        }
      });

      if (error) {
        console.error('❌ Firecrawl scraping function error:', error);
        
        // Check if it's a fallback scenario
        if (error.message?.includes('fallbackToClassic')) {
          console.log('🔄 Falling back to Classic mode as requested');
          throw new Error('FALLBACK_TO_CLASSIC');
        }
        
        throw new Error(error.message || 'Firecrawl scraping failed');
      }

      if (!data?.success) {
        console.error('❌ Firecrawl scraping failed:', data?.error);
        
        if (data?.fallbackToClassic) {
          console.log('🔄 Firecrawl recommended fallback to Classic mode');
          throw new Error('FALLBACK_TO_CLASSIC');
        }
        
        throw new Error(data?.error || 'Failed to scrape site with Firecrawl');
      }

      console.log('✅ Firecrawl scraping successful!', {
        url: data.scrapedData.url,
        headings: data.scrapedData.htmlStructure?.headings?.length || 0,
        targetableElements: data.scrapedData.targetableElements?.length || 0,
        htmlLength: data.scrapedData.html?.length || 0
      });

      return this.enhanceScrapedData(data.scrapedData);
      
    } catch (error) {
      console.error('💥 Enhanced scraping failed:', error);
      
      // Don't fallback for specific errors - let the UI handle it
      if (error.message === 'FALLBACK_TO_CLASSIC') {
        throw error;
      }
      
      // For other errors, try basic fallback
      console.log('🔧 Attempting basic fallback scraping...');
      return this.fallbackScraping(url);
    }
  }

  private enhanceScrapedData(rawData: any): ScrapedSiteData {
    // Process and enhance the scraped data
    const targetableElements = this.generateTargetableElements(rawData);
    
    return {
      ...rawData,
      targetableElements,
      interactiveElements: targetableElements.filter(el => el.clickable),
      brandColors: this.extractBrandColors(rawData.css),
      typography: this.analyzeTypography(rawData.css),
      cssClasses: this.extractCSSClasses(rawData.css)
    };
  }

  private generateTargetableElements(data: any): TargetableElement[] {
    const elements: TargetableElement[] = [];
    let croIdCounter = 0;

    // Generate targetable elements from HTML structure
    if (data.htmlStructure) {
      // Add headings
      data.htmlStructure.headings?.forEach((heading: any, index: number) => {
        elements.push({
          type: 'heading',
          selector: `h${heading.level}:nth-of-type(${index + 1})`,
          text: heading.text,
          position: { x: 0, y: 0, width: 0, height: 0 }, // Will be updated by live preview
          styles: {
            fontSize: this.getHeadingSize(heading.level),
            fontWeight: 'bold'
          },
          isVisible: true,
          clickable: false,
          croId: `cro-element-${croIdCounter++}`
        });
      });

      // Add interactive elements (buttons, links)
      const buttonSelectors = [
        'button', 
        '[role="button"]', 
        '.btn', 
        '.button',
        'input[type="submit"]',
        'input[type="button"]',
        '.cta',
        '.call-to-action'
      ];

      buttonSelectors.forEach(selector => {
        elements.push({
          type: 'button',
          selector,
          text: 'Interactive Element',
          position: { x: 0, y: 0, width: 0, height: 0 },
          styles: {
            backgroundColor: '#007bff',
            color: '#ffffff',
            borderRadius: '4px',
            padding: '8px 16px'
          },
          isVisible: true,
          clickable: true,
          croId: `cro-element-${croIdCounter++}`
        });
      });

      // Add links
      data.htmlStructure.links?.forEach((link: any, index: number) => {
        if (link.text && link.text.trim()) {
          elements.push({
            type: 'link',
            selector: `a:nth-of-type(${index + 1})`,
            text: link.text,
            position: { x: 0, y: 0, width: 0, height: 0 },
            styles: {
              color: '#007bff',
              textDecoration: 'underline'
            },
            isVisible: true,
            clickable: true,
            croId: `cro-element-${croIdCounter++}`
          });
        }
      });
    }

    return elements;
  }

  private getHeadingSize(level: number): string {
    const sizes = {
      1: '2rem',
      2: '1.5rem',
      3: '1.25rem',
      4: '1.125rem',
      5: '1rem',
      6: '0.875rem'
    };
    return sizes[level as keyof typeof sizes] || '1rem';
  }

  private extractBrandColors(css: string): string[] {
    const colorRegex = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})|rgb\([^)]+\)|rgba\([^)]+\)/g;
    const colors = css.match(colorRegex) || [];
    
    // Remove duplicates and common colors
    const uniqueColors = [...new Set(colors)];
    const filteredColors = uniqueColors.filter(color => 
      !['#ffffff', '#fff', '#000000', '#000', 'rgb(255,255,255)', 'rgb(0,0,0)'].includes(color.toLowerCase())
    );
    
    return filteredColors.slice(0, 8); // Return top 8 brand colors
  }

  private analyzeTypography(css: string): ScrapedSiteData['typography'] {
    const fontFamilyRegex = /font-family:\s*([^;]+)/g;
    const families = new Set<string>();
    
    let match;
    while ((match = fontFamilyRegex.exec(css)) !== null) {
      families.add(match[1].trim().replace(/['"]/g, ''));
    }

    const headingStyles = [
      { selector: 'h1', size: '2rem', weight: 'bold' },
      { selector: 'h2', size: '1.5rem', weight: 'bold' },
      { selector: 'h3', size: '1.25rem', weight: 'semi-bold' },
    ];

    return {
      fontFamilies: Array.from(families).slice(0, 5),
      headingStyles
    };
  }

  private extractCSSClasses(css: string): string[] {
    const classRegex = /\.([a-zA-Z][\w-]*)/g;
    const classes = new Set<string>();
    
    let match;
    while ((match = classRegex.exec(css)) !== null) {
      classes.add(match[1]);
    }

    return Array.from(classes).slice(0, 100); // Return top 100 classes
  }

  private async fallbackScraping(url: string): Promise<ScrapedSiteData> {
    // Fallback when scraping fails - generate basic structure
    const domain = new URL(url).hostname;
    
    return {
      url,
      html: `<html><head><title>${domain}</title></head><body><h1>Site Preview Unavailable</h1><p>Unable to scrape ${url}. This is a fallback preview.</p><button class="cta-button">Sample Button</button></body></html>`,
      css: `.cta-button { background: #007bff; color: white; padding: 12px 24px; border: none; border-radius: 4px; }`,
      assets: { images: [], stylesheets: [], scripts: [] },
      htmlStructure: {
        title: domain,
        headings: [{ level: 1, text: 'Site Preview Unavailable' }],
        paragraphs: [`Unable to scrape ${url}. This is a fallback preview.`],
        links: [],
        forms: []
      },
      cssClasses: ['cta-button'],
      interactiveElements: [{
        type: 'button',
        selector: '.cta-button',
        text: 'Sample Button',
        position: { x: 0, y: 100, width: 150, height: 40 },
        styles: {
          backgroundColor: '#007bff',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '4px'
        },
        isVisible: true,
        clickable: true,
        croId: 'cro-element-0'
      }],
      brandColors: ['#007bff'],
      typography: {
        fontFamilies: ['sans-serif'],
        headingStyles: [{ selector: 'h1', size: '2rem', weight: 'bold' }]
      },
      targetableElements: [{
        type: 'button',
        selector: '.cta-button',
        text: 'Sample Button',
        position: { x: 0, y: 100, width: 150, height: 40 },
        styles: {
          backgroundColor: '#007bff',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '4px'
        },
        isVisible: true,
        clickable: true,
        croId: 'cro-element-0'
      }]
    };
  }

  buildCompleteHTML(scrapedData: ScrapedSiteData): string {
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
        // Make elements selectable and editable
        document.addEventListener('DOMContentLoaded', function() {
            const targetableElements = ${JSON.stringify(scrapedData.targetableElements)};
            
            targetableElements.forEach((elementData, index) => {
                const elements = document.querySelectorAll(elementData.selector);
                elements.forEach((element, subIndex) => {
                    element.classList.add('cro-editable');
                    element.dataset.croId = elementData.croId + '-' + subIndex;
                    element.dataset.originalText = element.textContent || '';
                    
                    element.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Clear previous selection
                        document.querySelectorAll('.cro-selected').forEach(el => {
                            el.classList.remove('cro-selected');
                        });
                        
                        // Select current element
                        this.classList.add('cro-selected');
                        
                        // Notify parent window
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
        
        // Listen for modifications from parent
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
  }
}

export const scrapingService = new ScrapingService();