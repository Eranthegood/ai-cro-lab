import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialiser le client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Récupération du dernier lead...')
    
    // Récupérer le dernier lead
    const { data: lastLead, error: fetchError } = await supabase
      .from('waitlist')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (fetchError) {
      throw new Error(`Erreur lors de la récupération du lead: ${fetchError.message}`)
    }

    if (!lastLead) {
      return new Response(
        JSON.stringify({ error: 'Aucun lead trouvé dans la waitlist' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Lead trouvé:', lastLead.email)

    // Appeler l'edge function loops-integration
    const { data: loopsResult, error: loopsError } = await supabase.functions.invoke(
      'loops-integration',
      {
        body: {
          action: 'createContact',
          email: lastLead.email.toLowerCase(),
          source: lastLead.referral_source || 'waitlist',
          subscribed: true,
          userGroup: 'waitlist_members',
          companySize: lastLead.company_size,
          role: lastLead.role,
          currentTools: lastLead.current_tools?.join(', ') || ''
        }
      }
    )

    if (loopsError) {
      console.error('Erreur Loops:', loopsError)
      throw new Error(`Erreur lors de l'envoi à Loops: ${loopsError.message}`)
    }

    console.log('Lead envoyé avec succès à Loops:', loopsResult)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Lead ${lastLead.email} envoyé avec succès à Loops`,
        leadData: lastLead,
        loopsResult: loopsResult
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error: any) {
    console.error('Erreur dans test-loops-lead:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Erreur lors du test d\'envoi du lead vers Loops'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})