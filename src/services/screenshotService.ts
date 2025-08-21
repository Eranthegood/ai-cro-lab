export interface ScreenshotResult {
  imageUrl: string;
  visualAnalysis: {
    colors: string[];
    elements: ElementInfo[];
    layout: LayoutInfo;
    performance: PerformanceInfo;
  };
  metadata: {
    timestamp: number;
    url: string;
    viewport: { width: number; height: number; };
    deviceType: 'desktop' | 'mobile';
  };
}

export interface ElementInfo {
  type: 'button' | 'form' | 'image' | 'text' | 'link' | 'input';
  selector: string;
  text?: string;
  position: { x: number; y: number; width: number; height: number; };
  styles: {
    backgroundColor?: string;
    color?: string;
    fontSize?: string;
    borderRadius?: string;
  };
  isVisible: boolean;
  clickable: boolean;
}

export interface LayoutInfo {
  hasHeader: boolean;
  hasFooter: boolean;
  hasSidebar: boolean;
  contentWidth: number;
  scrollHeight: number;
  viewportHeight: number;
}

export interface PerformanceInfo {
  loadTime: number;
  imageCount: number;
  largestContentfulPaint?: number;
}

class ScreenshotService {
  private readonly SCREENSHOT_API_URL = 'https://api.screenshotapi.net/screenshot';
  private readonly FALLBACK_SERVICE = 'https://api.urlbox.io/v1';
  
  async captureScreenshot(
    url: string, 
    options: {
      width?: number;
      height?: number;
      device?: 'desktop' | 'mobile';
      fullPage?: boolean;
      delay?: number;
    } = {}
  ): Promise<ScreenshotResult> {
    const {
      width = 1920,
      height = 1080,
      device = 'desktop',
      fullPage = true,
      delay = 2000
    } = options;

    try {
      // Use screenshot API with visual analysis
      const response = await this.captureWithAnalysis(url, {
        width,
        height,
        device,
        fullPage,
        delay
      });

      return response;
    } catch (error) {
      console.error('Screenshot capture failed:', error);
      // Fallback to simple screenshot without analysis
      return this.generateFallbackScreenshot(url, { width, height, device });
    }
  }

  private async captureWithAnalysis(
    url: string,
    options: any
  ): Promise<ScreenshotResult> {
    // Simulate screenshot API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock visual analysis based on URL patterns
    const visualAnalysis = this.analyzeUrlPatterns(url);
    
    const screenshotUrl = `https://via.placeholder.com/${options.width}x${options.height}/f8f9fa/6c757d?text=Screenshot+of+${encodeURIComponent(new URL(url).hostname)}`;
    
    return {
      imageUrl: screenshotUrl,
      visualAnalysis,
      metadata: {
        timestamp: Date.now(),
        url,
        viewport: { width: options.width, height: options.height },
        deviceType: options.device
      }
    };
  }

  private analyzeUrlPatterns(url: string): ScreenshotResult['visualAnalysis'] {
    const domain = new URL(url).hostname.toLowerCase();
    const path = new URL(url).pathname.toLowerCase();
    
    // Smart analysis based on URL patterns
    let colors = ['#ffffff', '#000000', '#f8f9fa'];
    let elements: ElementInfo[] = [];
    
    // E-commerce detection
    if (domain.includes('shop') || path.includes('product') || path.includes('cart') || 
        domain.includes('decathlon') || domain.includes('amazon')) {
      colors = ['#ff6b35', '#28a745', '#007bff', '#ffffff'];
      elements = [
        {
          type: 'button',
          selector: '.add-to-cart, .btn-primary, [data-testid="add-to-cart"]',
          text: 'Add to Cart',
          position: { x: 50, y: 300, width: 200, height: 50 },
          styles: {
            backgroundColor: '#ff6b35',
            color: '#ffffff',
            fontSize: '16px',
            borderRadius: '8px'
          },
          isVisible: true,
          clickable: true
        },
        {
          type: 'button',
          selector: '.checkout-btn, .proceed-checkout',
          text: 'Checkout',
          position: { x: 300, y: 350, width: 150, height: 45 },
          styles: {
            backgroundColor: '#28a745',
            color: '#ffffff',
            fontSize: '14px',
            borderRadius: '6px'
          },
          isVisible: true,
          clickable: true
        }
      ];
    }
    
    // SaaS/App detection
    else if (domain.includes('app') || path.includes('dashboard') || path.includes('login')) {
      colors = ['#667eea', '#764ba2', '#f093fb'];
      elements = [
        {
          type: 'button',
          selector: '.cta-button, .sign-up, .get-started',
          text: 'Get Started',
          position: { x: 100, y: 200, width: 180, height: 48 },
          styles: {
            backgroundColor: '#667eea',
            color: '#ffffff',
            fontSize: '16px',
            borderRadius: '12px'
          },
          isVisible: true,
          clickable: true
        }
      ];
    }
    
    // Finance detection
    else if (domain.includes('bank') || domain.includes('finance') || path.includes('invest')) {
      colors = ['#1e3a8a', '#059669', '#dc2626'];
      elements = [
        {
          type: 'button',
          selector: '.apply-now, .contact-btn',
          text: 'Apply Now',
          position: { x: 80, y: 250, width: 160, height: 44 },
          styles: {
            backgroundColor: '#1e3a8a',
            color: '#ffffff',
            fontSize: '15px',
            borderRadius: '4px'
          },
          isVisible: true,
          clickable: true
        }
      ];
    }

    return {
      colors,
      elements,
      layout: {
        hasHeader: true,
        hasFooter: true,
        hasSidebar: path.includes('dashboard'),
        contentWidth: 1200,
        scrollHeight: 2400,
        viewportHeight: 1080
      },
      performance: {
        loadTime: Math.random() * 3000 + 1000,
        imageCount: Math.floor(Math.random() * 20) + 5,
        largestContentfulPaint: Math.random() * 2000 + 500
      }
    };
  }

  private async generateFallbackScreenshot(
    url: string,
    options: any
  ): Promise<ScreenshotResult> {
    const hostname = new URL(url).hostname;
    const screenshotUrl = `https://via.placeholder.com/${options.width}x${options.height}/e2e8f0/64748b?text=Fallback+Screenshot+${encodeURIComponent(hostname)}`;
    
    return {
      imageUrl: screenshotUrl,
      visualAnalysis: {
        colors: ['#e2e8f0', '#64748b'],
        elements: [],
        layout: {
          hasHeader: true,
          hasFooter: false,
          hasSidebar: false,
          contentWidth: 1200,
          scrollHeight: 1080,
          viewportHeight: 1080
        },
        performance: {
          loadTime: 2000,
          imageCount: 0
        }
      },
      metadata: {
        timestamp: Date.now(),
        url,
        viewport: { width: options.width, height: options.height },
        deviceType: options.device
      }
    };
  }

  async analyzeExistingScreenshot(imageUrl: string): Promise<ScreenshotResult['visualAnalysis']> {
    // Simulate image analysis
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      colors: ['#ffffff', '#000000', '#007bff'],
      elements: [],
      layout: {
        hasHeader: true,
        hasFooter: true,
        hasSidebar: false,
        contentWidth: 1200,
        scrollHeight: 2000,
        viewportHeight: 1080
      },
      performance: {
        loadTime: 1500,
        imageCount: 8
      }
    };
  }
}

export const screenshotService = new ScreenshotService();