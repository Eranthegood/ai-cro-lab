import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, RefreshCw, Users, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLoops } from '@/hooks/useLoops';
import { toast } from 'sonner';

interface WaitlistEntry {
  id: string;
  email: string;
  referral_source: string | null;
  created_at: string;
  company_size: string | null;
  role: string | null;
  current_tools: string[] | null;
}

interface SyncStats {
  total: number;
  success: number;
  errors: number;
  current: number;
}

const WaitlistSyncToLoops = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [syncStats, setSyncStats] = useState<SyncStats>({ total: 0, success: 0, errors: 0, current: 0 });
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  
  const { createContact } = useLoops();

  const handleExportCSV = async () => {
    try {
      // Récupérer toutes les entrées de la waitlist
      const { data: waitlistEntries, error } = await supabase
        .from('waitlist')
        .select('id, email, referral_source, created_at, company_size, role, current_tools')
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      if (!waitlistEntries || waitlistEntries.length === 0) {
        toast.error('Aucune entrée dans la waitlist');
        return;
      }

      // Convertir en CSV
      const csvHeaders = ['Email', 'Source', 'Date d\'inscription', 'Taille entreprise', 'Rôle', 'Outils actuels'];
      const csvRows = waitlistEntries.map(entry => [
        entry.email,
        entry.referral_source || '',
        new Date(entry.created_at).toLocaleDateString('fr-FR'),
        entry.company_size || '',
        entry.role || '',
        entry.current_tools?.join(', ') || ''
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n');

      // Créer et télécharger le fichier
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `waitlist_export_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      toast.success(`Export CSV terminé (${waitlistEntries.length} entrées)`);
    } catch (error: any) {
      console.error('Erreur lors de l\'export CSV:', error);
      toast.error('Erreur lors de l\'export CSV');
    }
  };

  const handleSyncWaitlist = async () => {
    setIsLoading(true);
    setErrorMessages([]);
    setIsComplete(false);
    setSyncStats({ total: 0, success: 0, errors: 0, current: 0 });

    try {
      // Récupérer toutes les entrées de la waitlist
      const { data: waitlistEntries, error } = await supabase
        .from('waitlist')
        .select('id, email, referral_source, created_at, company_size, role, current_tools')
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      if (!waitlistEntries || waitlistEntries.length === 0) {
        toast.error('Aucune entrée dans la waitlist');
        return;
      }

      const total = waitlistEntries.length;
      setSyncStats(prev => ({ ...prev, total }));

      // Synchroniser chaque entrée avec Loops
      for (let i = 0; i < waitlistEntries.length; i++) {
        const entry = waitlistEntries[i];
        setSyncStats(prev => ({ ...prev, current: i + 1 }));

        try {
          await createContact({
            email: entry.email.toLowerCase(),
            source: entry.referral_source || 'waitlist',
            subscribed: true,
            userGroup: 'waitlist_members',
            companySize: entry.company_size,
            role: entry.role,
            currentTools: entry.current_tools?.[0] // Take first item from array
          });

          setSyncStats(prev => ({ ...prev, success: prev.success + 1 }));
          
          // Petite pause pour éviter de surcharger l'API
          if (i < waitlistEntries.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (contactError: any) {
          console.error(`Erreur pour ${entry.email}:`, contactError);
          setSyncStats(prev => ({ ...prev, errors: prev.errors + 1 }));
          setErrorMessages(prev => [...prev, `${entry.email}: ${contactError.message || 'Erreur inconnue'}`]);
        }
      }

      setIsComplete(true);
      toast.success(`Synchronisation terminée: ${syncStats.success + 1} succès, ${syncStats.errors} erreurs`);

    } catch (error: any) {
      console.error('Erreur lors de la synchronisation:', error);
      toast.error('Erreur lors de la récupération de la waitlist');
      setErrorMessages(['Erreur lors de la récupération de la waitlist: ' + error.message]);
    } finally {
      setIsLoading(false);
    }
  };

  const progressPercentage = syncStats.total > 0 ? (syncStats.current / syncStats.total) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Synchroniser la Waitlist avec Loops
        </CardTitle>
        <CardDescription>
          Envoyez toutes les entrées existantes de votre waitlist vers Loops pour les ajouter à votre liste de contacts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isLoading && !isComplete && (
          <div className="space-y-2">
            <Button onClick={handleSyncWaitlist} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Démarrer la synchronisation
            </Button>
            <Button onClick={handleExportCSV} variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Exporter en CSV
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progression</span>
                <span>{syncStats.current} / {syncStats.total}</span>
              </div>
              <Progress value={progressPercentage} className="w-full" />
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-600">{syncStats.success}</div>
                <div className="text-sm text-muted-foreground">Succès</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-red-600">{syncStats.errors}</div>
                <div className="text-sm text-muted-foreground">Erreurs</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-blue-600">{syncStats.total}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
            </div>
          </div>
        )}

        {isComplete && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              Synchronisation terminée ! {syncStats.success} contacts ajoutés avec succès
              {syncStats.errors > 0 && `, ${syncStats.errors} erreurs rencontrées`}.
            </AlertDescription>
          </Alert>
        )}

        {errorMessages.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <div className="font-medium">Erreurs rencontrées:</div>
                <div className="text-sm max-h-32 overflow-y-auto">
                  {errorMessages.map((error, index) => (
                    <div key={index} className="truncate">{error}</div>
                  ))}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {isComplete && (
          <Button 
            onClick={() => {
              setIsComplete(false);
              setSyncStats({ total: 0, success: 0, errors: 0, current: 0 });
              setErrorMessages([]);
            }}
            variant="outline"
            className="w-full"
          >
            Nouvelle synchronisation
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default WaitlistSyncToLoops;