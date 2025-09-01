import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const TestLoopsIntegration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testSendLastLead = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Appel de l\'edge function test-loops-lead...');
      
      const { data, error: functionError } = await supabase.functions.invoke(
        'test-loops-lead',
        {
          body: {}
        }
      );

      if (functionError) {
        throw new Error(functionError.message);
      }

      setResult(data);
      toast.success('Lead envoyé avec succès à Loops!');
      console.log('Résultat:', data);
      
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors du test';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Erreur:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          Test d'envoi Loops
        </CardTitle>
        <CardDescription>
          Envoyer le dernier lead de la waitlist vers Loops
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testSendLastLead} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Envoyer le dernier lead
            </>
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>{result.message}</p>
                {result.leadData && (
                  <div className="text-sm">
                    <p><strong>Email:</strong> {result.leadData.email}</p>
                    <p><strong>Source:</strong> {result.leadData.referral_source}</p>
                    <p><strong>Date:</strong> {new Date(result.leadData.created_at).toLocaleString('fr-FR')}</p>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default TestLoopsIntegration;