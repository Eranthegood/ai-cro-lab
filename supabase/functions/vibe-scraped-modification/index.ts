import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VibeRequest {
  prompt: string;
  selectedElement: {
    type: string;
    selector: string;
    text: string;
    croId: string;
    computedStyles?: Record<string, string>;
  };
  scrapedData: {
    url: string;
    brandColors: string[];
    typography: {
      fontFamilies: string[];
    };
    cssClasses: string[];
  };
  conversationHistory: Array<{
    type: 'user' | 'assistant';
    content: string;
    elementId?: string;
    timestamp: number;
  }>;
  currentModifications: Array<{
    id: string;
    prompt: string;
    elementId: string;
    modifications: Record<string, string>;
    timestamp: number;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!anthropicApiKey) {
      console.error('ANTHROPIC_API_KEY not found');
      return new Response(
        JSON.stringify({ success: false, error: 'AI service not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const requestData: VibeRequest = await req.json();
    console.log('Vibe modification request:', {
      prompt: requestData.prompt,
      elementType: requestData.selectedElement.type,
      elementText: requestData.selectedElement.text.substring(0, 50)
    });

    // Build enhanced prompt with scraped context
    const enhancedPrompt = buildVibePrompt(requestData);
    
    console.log('Sending request to Anthropic API');
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anthropicApiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: enhancedPrompt
          }
        ]
      })
    });

    if (!response.ok) {
      console.error('Anthropic API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log('Received response from Anthropic API');

    if (!aiResponse.content || !aiResponse.content[0]) {
      throw new Error('Invalid response from AI service');
    }

    const aiContent = aiResponse.content[0].text;
    console.log('AI response content length:', aiContent.length);

    // Parse the AI response to extract CSS modifications
    const parsedResult = parseVibeResponse(aiContent);
    
    console.log('Parsed modifications:', parsedResult);

    return new Response(
      JSON.stringify({
        success: true,
        modifications: parsedResult.modifications,
        explanation: parsedResult.explanation,
        aiResponse: aiContent
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Vibe modification error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to process Vibe modification'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function buildVibePrompt(data: VibeRequest): string {
  const { prompt, selectedElement, scrapedData, conversationHistory, currentModifications } = data;
  
  return `
VIBE CODING REQUEST: Apply natural language modification to scraped website element

WEBSITE CONTEXT:
- URL: ${scrapedData.url}
- Brand Colors: ${scrapedData.brandColors.slice(0, 5).join(', ')}
- Typography: ${scrapedData.typography.fontFamilies.slice(0, 3).join(', ')}
- Available CSS Classes: ${scrapedData.cssClasses.slice(0, 10).join(', ')}

SELECTED ELEMENT:
- Type: ${selectedElement.type}
- Current Text: "${selectedElement.text}"
- CSS Selector: ${selectedElement.selector}
- Current Styles: ${JSON.stringify(selectedElement.computedStyles || {}, null, 2)}

USER REQUEST: "${prompt}"

CONVERSATION HISTORY:
${conversationHistory.map(msg => 
  `${msg.type.toUpperCase()}: ${msg.content}`
).join('\n')}

PREVIOUS MODIFICATIONS:
${currentModifications.map(mod => 
  `- ${mod.prompt} → ${JSON.stringify(mod.modifications)}`
).join('\n')}

TASK: Generate CSS modifications and explanation for the user's request.

RESPONSE FORMAT (JSON):
{
  "modifications": {
    "backgroundColor": "value",
    "color": "value",
    "fontSize": "value",
    "fontWeight": "value",
    "borderRadius": "value",
    "padding": "value",
    "margin": "value",
    "textContent": "new text content if changed",
    // Only include properties that need to change
  },
  "explanation": "Clear explanation of what was changed and why"
}

IMPORTANT GUIDELINES:
1. Only include CSS properties that need to change
2. Use valid CSS values (include units like px, rem, %, etc.)
3. For colors, use hex, rgb, or named colors
4. For textContent, only include if the user wants to change text
5. Be mindful of the website's existing brand colors and typography
6. Make modifications that enhance rather than clash with the design
7. Consider accessibility (contrast, readability)

EXAMPLES:
- "Make this button larger and green" → {"fontSize": "18px", "padding": "12px 24px", "backgroundColor": "#28a745"}
- "Change text to 'Buy Now'" → {"textContent": "Buy Now"}
- "Add subtle shadow and round corners" → {"boxShadow": "0 2px 4px rgba(0,0,0,0.1)", "borderRadius": "8px"}
- "Make text bold and darker" → {"fontWeight": "bold", "color": "#333333"}

Generate modifications for: "${prompt}"
  `;
}

function parseVibeResponse(aiResponse: string): {
  modifications: Record<string, string>;
  explanation: string;
} {
  try {
    // Try to extract JSON from the response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const jsonStr = jsonMatch[0];
      const parsed = JSON.parse(jsonStr);
      
      return {
        modifications: parsed.modifications || {},
        explanation: parsed.explanation || "Changes applied successfully!"
      };
    }
    
    // Fallback: parse structured response
    const modifications: Record<string, string> = {};
    let explanation = "Changes applied based on your request.";
    
    // Extract common CSS properties
    const cssProps = [
      'backgroundColor', 'color', 'fontSize', 'fontWeight', 
      'borderRadius', 'padding', 'margin', 'textContent',
      'border', 'boxShadow', 'opacity', 'transform'
    ];
    
    for (const prop of cssProps) {
      const regex = new RegExp(`"${prop}":\\s*"([^"]*)"`, 'i');
      const match = aiResponse.match(regex);
      if (match) {
        modifications[prop] = match[1];
      }
    }
    
    // Extract explanation
    const explanationMatch = aiResponse.match(/"explanation":\s*"([^"]*)"/i);
    if (explanationMatch) {
      explanation = explanationMatch[1];
    }
    
    return { modifications, explanation };
    
  } catch (error) {
    console.error('Error parsing AI response:', error);
    
    // Emergency fallback - basic parsing
    const modifications: Record<string, string> = {};
    
    // Look for common patterns in the response
    if (aiResponse.toLowerCase().includes('green') || aiResponse.toLowerCase().includes('#28a745')) {
      modifications.backgroundColor = '#28a745';
    }
    if (aiResponse.toLowerCase().includes('larger') || aiResponse.toLowerCase().includes('bigger')) {
      modifications.fontSize = '18px';
      modifications.padding = '12px 24px';
    }
    if (aiResponse.toLowerCase().includes('bold')) {
      modifications.fontWeight = 'bold';
    }
    if (aiResponse.toLowerCase().includes('round')) {
      modifications.borderRadius = '8px';
    }
    if (aiResponse.toLowerCase().includes('shadow')) {
      modifications.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    }
    
    return {
      modifications,
      explanation: "Applied basic modifications based on your request."
    };
  }
}