import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LoopsContact {
  email: string;
  firstName?: string;
  lastName?: string;
  source?: string;
  subscribed?: boolean;
  userGroup?: string;
  userId?: string;
}

interface LoopsTransactionalEmail {
  transactionalId: string;
  email: string;
  dataVariables?: Record<string, any>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...data } = await req.json();
    const apiKey = Deno.env.get("LOOPS_API_KEY");
    
    if (!apiKey) {
      throw new Error("LOOPS_API_KEY not configured");
    }

    const baseUrl = "https://app.loops.so/api/v1";
    const headers = {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };

    console.log(`Processing Loops action: ${action}`, { data });

    let response;

    switch (action) {
      case "createContact": {
        const contactData: LoopsContact = data;
        response = await fetch(`${baseUrl}/contacts/create`, {
          method: "POST",
          headers,
          body: JSON.stringify(contactData),
        });
        break;
      }

      case "updateContact": {
        const { email, ...updateData } = data;
        response = await fetch(`${baseUrl}/contacts/update`, {
          method: "PUT",
          headers,
          body: JSON.stringify({ email, ...updateData }),
        });
        break;
      }

      case "deleteContact": {
        const { email } = data;
        response = await fetch(`${baseUrl}/contacts/delete`, {
          method: "POST",
          headers,
          body: JSON.stringify({ email }),
        });
        break;
      }

      case "getContact": {
        const { email } = data;
        response = await fetch(`${baseUrl}/contacts/find?email=${encodeURIComponent(email)}`, {
          method: "GET",
          headers,
        });
        break;
      }

      case "sendTransactionalEmail": {
        const emailData: LoopsTransactionalEmail = data;
        response = await fetch(`${baseUrl}/transactional`, {
          method: "POST",
          headers,
          body: JSON.stringify(emailData),
        });
        break;
      }

      case "addToList": {
        const { email, listId } = data;
        response = await fetch(`${baseUrl}/contacts/lists/${listId}`, {
          method: "POST",
          headers,
          body: JSON.stringify({ email }),
        });
        break;
      }

      case "removeFromList": {
        const { email, listId } = data;
        response = await fetch(`${baseUrl}/contacts/lists/${listId}/remove`, {
          method: "POST",
          headers,
          body: JSON.stringify({ email }),
        });
        break;
      }

      case "getLists": {
        response = await fetch(`${baseUrl}/lists`, {
          method: "GET",
          headers,
        });
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const responseData = await response.json();
    
    if (!response.ok) {
      console.error(`Loops API error for action ${action}:`, responseData);
      throw new Error(responseData.message || `Loops API error: ${response.status}`);
    }

    console.log(`Successfully processed Loops action: ${action}`, responseData);

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in loops-integration function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
};

serve(handler);