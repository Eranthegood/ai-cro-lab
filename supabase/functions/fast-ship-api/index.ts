import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FastShipRequest {
  service: string;
  data: any;
}

interface FastShipResponse {
  success: boolean;
  data?: any;
  error?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Récupérer le secret depuis les variables d'environnement
    const fastShipApiKey = Deno.env.get('FAST_SHIP_API_KEY');
    
    if (!fastShipApiKey) {
      console.error('FAST_SHIP_API_KEY secret not found');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'API key not configured' 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { service, data }: FastShipRequest = await req.json();

    console.log(`📦 Fast Ship API call for service: ${service}`);

    // Exemple d'appel à l'API Fast Ship (adaptez selon leur documentation)
    const fastShipResponse = await fetch(`https://api.fastship.com/v1/${service}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${fastShipApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!fastShipResponse.ok) {
      const errorText = await fastShipResponse.text();
      console.error('Fast Ship API error:', errorText);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Fast Ship API error: ${fastShipResponse.status}` 
        }),
        {
          status: fastShipResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const responseData = await fastShipResponse.json();
    
    console.log('✅ Fast Ship API call successful');

    const result: FastShipResponse = {
      success: true,
      data: responseData
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in fast-ship-api function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);