import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScrapingOptions {
  includeStyles: boolean;
  includeScripts: boolean;
  analyzeContent: boolean;
  generateSelectors: boolean;
}

interface ScrapedSiteData {
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
  targetableElements: Array<{
    type: string;
    selector: string;
    text: string;
    croId: string;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, options = {} } = await req.json();
    console.log('Scraping request for:', url, 'with options:', options);

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate URL
    let targetUrl: URL;
    try {
      targetUrl = new URL(url);
      if (!targetUrl.protocol.startsWith('http')) {
        throw new Error('Invalid protocol');
      }
    } catch (error) {
      console.error('Invalid URL:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid URL format' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Use AllOrigins as CORS proxy for scraping
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    
    console.log('Fetching content from:', proxyUrl);
    
    const response = await fetch(proxyUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CRO-Intelligence-Bot/1.0)'
      }
    });

    if (!response.ok) {
      console.error('Fetch failed:', response.status, response.statusText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const proxyData = await response.json();
    const html = proxyData.contents;

    if (!html) {
      throw new Error('No content received from proxy');
    }

    console.log('HTML content received, length:', html.length);

    // Parse and analyze the HTML content
    const scrapedData = await parseAndAnalyzeHTML(html, url, options);
    
    console.log('Analysis complete:', {
      headings: scrapedData.htmlStructure.headings.length,
      links: scrapedData.htmlStructure.links.length,
      targetable: scrapedData.targetableElements.length,
      cssClasses: scrapedData.cssClasses.length
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        scrapedData 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Scraping error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to scrape website'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function parseAndAnalyzeHTML(html: string, url: string, options: ScrapingOptions): Promise<ScrapedSiteData> {
  // Basic HTML parsing using regex patterns
  const title = extractTitle(html);
  const headings = extractHeadings(html);
  const paragraphs = extractParagraphs(html);
  const links = extractLinks(html, url);
  const forms = extractForms(html);
  
  // Extract CSS
  const css = extractCSS(html, url);
  const cssClasses = extractCSSClasses(css);
  
  // Extract assets
  const assets = extractAssets(html, url);
  
  // Generate targetable elements
  const targetableElements = generateTargetableElements(html);
  
  // Clean HTML for preview
  const cleanedHTML = cleanHTMLForPreview(html);

  return {
    url,
    html: cleanedHTML,
    css,
    assets,
    htmlStructure: {
      title,
      headings,
      paragraphs: paragraphs.slice(0, 10), // Limit to first 10 paragraphs
      links: links.slice(0, 20), // Limit to first 20 links
      forms
    },
    cssClasses,
    targetableElements
  };
}

function extractTitle(html: string): string {
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return titleMatch ? titleMatch[1].trim() : 'Untitled Page';
}

function extractHeadings(html: string): Array<{ level: number; text: string; id?: string }> {
  const headings: Array<{ level: number; text: string; id?: string }> = [];
  const headingRegex = /<h([1-6])[^>]*(?:id="([^"]*)")?[^>]*>([^<]*)<\/h[1-6]>/gi;
  
  let match;
  while ((match = headingRegex.exec(html)) !== null) {
    headings.push({
      level: parseInt(match[1]),
      text: match[3].trim(),
      id: match[2] || undefined
    });
  }
  
  return headings.slice(0, 15); // Limit to first 15 headings
}

function extractParagraphs(html: string): string[] {
  const paragraphs: string[] = [];
  const pRegex = /<p[^>]*>([^<]*(?:<[^/][^>]*>[^<]*<\/[^>]*>[^<]*)*)<\/p>/gi;
  
  let match;
  while ((match = pRegex.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]*>/g, '').trim();
    if (text.length > 10) {
      paragraphs.push(text);
    }
  }
  
  return paragraphs;
}

function extractLinks(html: string, baseUrl: string): Array<{ href: string; text: string }> {
  const links: Array<{ href: string; text: string }> = [];
  const linkRegex = /<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/gi;
  
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    const text = match[2].trim();
    
    if (text && href && !href.startsWith('javascript:')) {
      links.push({
        href: href.startsWith('http') ? href : new URL(href, baseUrl).toString(),
        text
      });
    }
  }
  
  return links;
}

function extractForms(html: string): Array<{ action?: string; method?: string; fields: string[] }> {
  const forms: Array<{ action?: string; method?: string; fields: string[] }> = [];
  const formRegex = /<form[^>]*(?:action="([^"]*)")?[^>]*(?:method="([^"]*)")?[^>]*>(.*?)<\/form>/gis;
  
  let match;
  while ((match = formRegex.exec(html)) !== null) {
    const action = match[1];
    const method = match[2];
    const formContent = match[3];
    
    // Extract input fields
    const fields: string[] = [];
    const inputRegex = /<input[^>]*name="([^"]*)"[^>]*>/gi;
    const selectRegex = /<select[^>]*name="([^"]*)"[^>]*>/gi;
    const textareaRegex = /<textarea[^>]*name="([^"]*)"[^>]*>/gi;
    
    let inputMatch;
    while ((inputMatch = inputRegex.exec(formContent)) !== null) {
      fields.push(inputMatch[1]);
    }
    while ((inputMatch = selectRegex.exec(formContent)) !== null) {
      fields.push(inputMatch[1]);
    }
    while ((inputMatch = textareaRegex.exec(formContent)) !== null) {
      fields.push(inputMatch[1]);
    }
    
    forms.push({ action, method, fields });
  }
  
  return forms;
}

function extractCSS(html: string, baseUrl: string): string {
  let css = '';
  
  // Extract inline styles
  const styleRegex = /<style[^>]*>(.*?)<\/style>/gis;
  let match;
  while ((match = styleRegex.exec(html)) !== null) {
    css += match[1] + '\n';
  }
  
  // Note: We can't fetch external stylesheets due to CORS limitations
  // This is a basic implementation that only captures inline styles
  
  return css;
}

function extractCSSClasses(css: string): string[] {
  const classRegex = /\.([a-zA-Z][\w-]*)/g;
  const classes = new Set<string>();
  
  let match;
  while ((match = classRegex.exec(css)) !== null) {
    classes.add(match[1]);
  }
  
  return Array.from(classes).slice(0, 100);
}

function extractAssets(html: string, baseUrl: string): {
  images: string[];
  stylesheets: string[];
  scripts: string[];
} {
  const images: string[] = [];
  const stylesheets: string[] = [];
  const scripts: string[] = [];
  
  // Extract images
  const imgRegex = /<img[^>]*src="([^"]*)"[^>]*>/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    const src = match[1];
    if (src) {
      images.push(src.startsWith('http') ? src : new URL(src, baseUrl).toString());
    }
  }
  
  // Extract stylesheets
  const cssRegex = /<link[^>]*rel="stylesheet"[^>]*href="([^"]*)"[^>]*>/gi;
  while ((match = cssRegex.exec(html)) !== null) {
    const href = match[1];
    if (href) {
      stylesheets.push(href.startsWith('http') ? href : new URL(href, baseUrl).toString());
    }
  }
  
  // Extract scripts
  const scriptRegex = /<script[^>]*src="([^"]*)"[^>]*>/gi;
  while ((match = scriptRegex.exec(html)) !== null) {
    const src = match[1];
    if (src) {
      scripts.push(src.startsWith('http') ? src : new URL(src, baseUrl).toString());
    }
  }
  
  return {
    images: images.slice(0, 20),
    stylesheets: stylesheets.slice(0, 10),
    scripts: scripts.slice(0, 10)
  };
}

function generateTargetableElements(html: string): Array<{
  type: string;
  selector: string;
  text: string;
  croId: string;
}> {
  const elements: Array<{
    type: string;
    selector: string;
    text: string;
    croId: string;
  }> = [];
  
  let croIdCounter = 0;
  
  // Extract buttons
  const buttonRegex = /<button[^>]*(?:class="([^"]*)")?[^>]*>([^<]*)<\/button>/gi;
  let match;
  while ((match = buttonRegex.exec(html)) !== null) {
    const className = match[1];
    const text = match[2].trim();
    elements.push({
      type: 'button',
      selector: className ? `.${className.split(' ')[0]}` : 'button',
      text: text || 'Button',
      croId: `cro-element-${croIdCounter++}`
    });
  }
  
  // Extract input buttons
  const inputButtonRegex = /<input[^>]*type="(?:submit|button)"[^>]*(?:value="([^"]*)")?[^>]*>/gi;
  while ((match = inputButtonRegex.exec(html)) !== null) {
    const value = match[1];
    elements.push({
      type: 'button',
      selector: 'input[type="submit"], input[type="button"]',
      text: value || 'Submit',
      croId: `cro-element-${croIdCounter++}`
    });
  }
  
  // Extract headings
  const headingRegex = /<h([1-6])[^>]*(?:class="([^"]*)")?[^>]*>([^<]*)<\/h[1-6]>/gi;
  while ((match = headingRegex.exec(html)) !== null) {
    const level = match[1];
    const className = match[2];
    const text = match[3].trim();
    elements.push({
      type: 'heading',
      selector: className ? `.${className.split(' ')[0]}` : `h${level}`,
      text: text || `Heading ${level}`,
      croId: `cro-element-${croIdCounter++}`
    });
  }
  
  // Extract links
  const linkRegex = /<a[^>]*(?:class="([^"]*)")?[^>]*>([^<]*)<\/a>/gi;
  while ((match = linkRegex.exec(html)) !== null) {
    const className = match[1];
    const text = match[2].trim();
    if (text && text.length > 2) {
      elements.push({
        type: 'link',
        selector: className ? `.${className.split(' ')[0]}` : 'a',
        text: text || 'Link',
        croId: `cro-element-${croIdCounter++}`
      });
    }
  }
  
  return elements.slice(0, 30); // Limit to first 30 elements
}

function cleanHTMLForPreview(html: string): string {
  return html
    // Remove problematic scripts
    .replace(/<script[^>]*>.*?<\/script>/gis, '')
    // Disable forms
    .replace(/<form[^>]*>/gi, '<div class="cro-disabled-form">')
    .replace(/<\/form>/gi, '</div>')
    // Disable navigation
    .replace(/href="(?!#)/g, 'data-href="')
    // Remove external targets
    .replace(/target="_blank"/g, '')
    // Remove event handlers
    .replace(/on\w+="[^"]*"/gi, '');
}