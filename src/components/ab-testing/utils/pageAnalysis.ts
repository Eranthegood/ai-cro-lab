// Utility functions for page analysis and context extraction

export function determinePageType(url: string): string {
  if (!url) return 'unknown';
  
  const path = new URL(url).pathname.toLowerCase();
  
  if (path === '/' || path === '/home') return 'homepage';
  if (path.includes('/product') || path.includes('/item') || path.includes('/p/')) return 'product';
  if (path.includes('/checkout') || path.includes('/cart') || path.includes('/payment')) return 'checkout';
  if (path.includes('/login') || path.includes('/signin') || path.includes('/auth')) return 'login';
  if (path.includes('/signup') || path.includes('/register') || path.includes('/join')) return 'signup';
  if (path.includes('/pricing') || path.includes('/plans')) return 'pricing';
  if (path.includes('/contact') || path.includes('/support')) return 'contact';
  if (path.includes('/about') || path.includes('/company')) return 'about';
  if (path.includes('/blog') || path.includes('/news') || path.includes('/article')) return 'content';
  if (path.includes('/category') || path.includes('/collection') || path.includes('/shop')) return 'category';
  if (path.includes('/search') || path.includes('/results')) return 'search';
  
  return 'other';
}

export function extractBrandFromUrl(url: string): string {
  if (!url) return 'unknown';
  
  try {
    const domain = new URL(url).hostname.toLowerCase();
    
    // Remove common prefixes
    const cleanDomain = domain.replace(/^(www\.|m\.|mobile\.|app\.)/, '');
    
    // Extract brand name (first part before TLD)
    const parts = cleanDomain.split('.');
    if (parts.length >= 2) {
      const brandPart = parts[0];
      
      // Common brand mapping
      const brandMap: Record<string, string> = {
        'amazon': 'Amazon',
        'shopify': 'Shopify Store',
        'google': 'Google',
        'facebook': 'Facebook',
        'instagram': 'Instagram',
        'linkedin': 'LinkedIn',
        'twitter': 'Twitter',
        'youtube': 'YouTube',
        'netflix': 'Netflix',
        'airbnb': 'Airbnb',
        'uber': 'Uber',
        'spotify': 'Spotify',
        'apple': 'Apple',
        'microsoft': 'Microsoft',
        'salesforce': 'Salesforce',
        'hubspot': 'HubSpot',
        'stripe': 'Stripe',
        'paypal': 'PayPal',
        'zoom': 'Zoom',
        'slack': 'Slack',
        'notion': 'Notion',
        'figma': 'Figma',
        'github': 'GitHub',
        'gitlab': 'GitLab'
      };
      
      return brandMap[brandPart] || capitalizeFirst(brandPart);
    }
    
    return capitalizeFirst(cleanDomain);
  } catch {
    return 'unknown';
  }
}

export function extractIndustryFromUrl(url: string): string {
  if (!url) return 'general';
  
  try {
    const domain = new URL(url).hostname.toLowerCase();
    const path = new URL(url).pathname.toLowerCase();
    
    // Industry keywords mapping
    const industryKeywords: Record<string, string[]> = {
      'ecommerce': ['shop', 'store', 'buy', 'cart', 'product', 'retail', 'fashion', 'clothing', 'electronics'],
      'saas': ['app', 'software', 'platform', 'tool', 'dashboard', 'api', 'cloud', 'service'],
      'finance': ['bank', 'finance', 'loan', 'credit', 'payment', 'invest', 'trading', 'crypto', 'fintech'],
      'healthcare': ['health', 'medical', 'doctor', 'clinic', 'hospital', 'wellness', 'fitness', 'pharma'],
      'education': ['edu', 'school', 'university', 'course', 'learn', 'training', 'academy', 'tutorial'],
      'media': ['news', 'blog', 'media', 'magazine', 'publisher', 'content', 'streaming', 'video'],
      'real_estate': ['real', 'estate', 'property', 'home', 'house', 'rent', 'mortgage', 'realtor'],
      'travel': ['travel', 'hotel', 'flight', 'booking', 'vacation', 'trip', 'tour', 'airline'],
      'food': ['food', 'restaurant', 'recipe', 'delivery', 'dining', 'kitchen', 'chef', 'meal'],
      'automotive': ['car', 'auto', 'vehicle', 'drive', 'motor', 'dealer', 'parts', 'repair'],
      'nonprofit': ['org', 'nonprofit', 'charity', 'donation', 'foundation', 'volunteer', 'cause'],
      'government': ['gov', 'government', 'city', 'state', 'federal', 'public', 'official'],
      'gaming': ['game', 'gaming', 'play', 'entertainment', 'casino', 'sport', 'bet'],
      'legal': ['law', 'legal', 'attorney', 'lawyer', 'court', 'justice', 'firm']
    };
    
    const fullText = (domain + ' ' + path).toLowerCase();
    
    for (const [industry, keywords] of Object.entries(industryKeywords)) {
      if (keywords.some(keyword => fullText.includes(keyword))) {
        return industry;
      }
    }
    
    // Check TLD for specific industries
    if (domain.endsWith('.edu')) return 'education';
    if (domain.endsWith('.gov')) return 'government';
    if (domain.endsWith('.org')) return 'nonprofit';
    
    return 'general';
  } catch {
    return 'general';
  }
}

export function analyzeCompetitiveLandscape(url: string): {
  competitors: string[];
  marketPosition: string;
  differentiators: string[];
} {
  const industry = extractIndustryFromUrl(url);
  
  const competitiveData: Record<string, any> = {
    'ecommerce': {
      competitors: ['Amazon', 'Shopify stores', 'Direct-to-consumer brands'],
      marketPosition: 'Crowded market with high competition for attention',
      differentiators: ['Unique product curation', 'Superior customer service', 'Brand storytelling']
    },
    'saas': {
      competitors: ['Established platforms', 'Newer startups', 'Enterprise solutions'],
      marketPosition: 'Feature-rich environment with high switching costs',
      differentiators: ['Ease of use', 'Integration capabilities', 'Pricing model']
    },
    'finance': {
      competitors: ['Traditional banks', 'Fintech startups', 'Credit unions'],
      marketPosition: 'Trust-sensitive market with regulatory constraints',
      differentiators: ['Security features', 'Transparent pricing', 'Customer support']
    },
    'healthcare': {
      competitors: ['Healthcare providers', 'Telemedicine platforms', 'Wellness apps'],
      marketPosition: 'Highly regulated with emphasis on trust and credibility',
      differentiators: ['Proven outcomes', 'Ease of access', 'Professional credentials']
    }
  };
  
  return competitiveData[industry] || {
    competitors: ['Market leaders', 'Niche players', 'New entrants'],
    marketPosition: 'Competitive landscape with various player types',
    differentiators: ['Value proposition', 'User experience', 'Pricing strategy']
  };
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}