import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Package, Send } from 'lucide-react';

interface FastShipResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export const FastShipExample = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [service, setService] = useState('tracking');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleFastShipCall = async () => {
    if (!trackingNumber.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un numéro de suivi",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      console.log('📦 Calling Fast Ship API...');
      
      const { data, error } = await supabase.functions.invoke<FastShipResponse>('fast-ship-api', {
        body: {
          service: service,
          data: {
            tracking_number: trackingNumber,
            additional_params: {
              format: 'json',
              include_events: true
            }
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Erreur API Fast Ship');
      }

      setResult(data.data);
      
      toast({
        title: "Succès",
        description: "Données récupérées avec succès",
      });

    } catch (error: any) {
      console.error('Error calling Fast Ship API:', error);
      
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'appel API",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Fast Ship API - Exemple avec Secret
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Service</label>
              <select 
                value={service} 
                onChange={(e) => setService(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="tracking">Tracking</option>
                <option value="shipping-rates">Tarifs d'expédition</option>
                <option value="pickup">Collecte</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Numéro de suivi</label>
              <Input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Ex: FSH123456789"
              />
            </div>
          </div>

          <Button 
            onClick={handleFastShipCall}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Appel en cours...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Appeler Fast Ship API
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Résultat de l'API</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>ℹ️ Comment ça fonctionne</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• L'API key <code>FAST_SHIP_API_KEY</code> est stockée de manière sécurisée dans Supabase</p>
          <p>• L'edge function utilise <code>verify_jwt = true</code> pour sécuriser l'accès</p>
          <p>• Les appels sont faits côté serveur pour protéger l'API key</p>
          <p>• Gestion complète des erreurs et logging pour le débogage</p>
        </CardContent>
      </Card>
    </div>
  );
};