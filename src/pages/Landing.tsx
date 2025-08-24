import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Share, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Landing = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('waitlist')
        .insert({
          email: email.toLowerCase(),
          referral_source: 'direct',
          user_agent: navigator.userAgent
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already registered",
            description: "This email is already on our waitlist!",
          });
        } else {
          throw error;
        }
      } else {
        setIsSubmitted(true);
        toast({
          title: "Welcome to the waitlist!",
          description: "You'll be among the first to know when we launch.",
        });
      }
    } catch (error) {
      console.error('Error adding to waitlist:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Automated AB test Workflow',
      text: 'From Data to Ready to Launch AB test in 1 clicks. Join the waitlist!',
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied!",
          description: "Share this link with others.",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-2xl text-center space-y-8">
        {/* Main title */}
        <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
          Automated AB test Workflow
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
          From Data to Ready to Launch AB test in 1 clicks
        </p>
        
        {/* Pain Points Section */}
        <div className="w-full max-w-4xl mx-auto mt-16 mb-12">
          <div className="grid gap-8 md:gap-6">
            {/* Velocity Crisis */}
            <div className="text-left p-6 rounded-lg border bg-card">
              <h3 className="text-lg font-semibold text-destructive mb-3 flex items-center">
                🚀 CRISE DE VÉLOCITÉ
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 2-3 semaines de l'insight au test en ligne (devrait être 2-3 jours)</li>
                <li>• 15h/semaine perdues en analyses manuelles vs travail stratégique</li>
                <li>• Faible vélocité de test = faible taux d'apprentissage = désavantage concurrentiel</li>
              </ul>
            </div>

            {/* Operational Chaos */}
            <div className="text-left p-6 rounded-lg border bg-card">
              <h3 className="text-lg font-semibold text-destructive mb-3 flex items-center">
                🔧 CHAOS OPÉRATIONNEL
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Jongler entre 8-12 outils différents quotidiennement (CS → Excel → Linear → AB Tasty...)</li>
                <li>• Équipes dev surchargées, tests CRO déprioritisés</li>
                <li>• Fragmentation des outils tue l'élan et crée des erreurs</li>
              </ul>
            </div>

            {/* Analysis Paralysis */}
            <div className="text-left p-6 rounded-lg border bg-card">
              <h3 className="text-lg font-semibold text-destructive mb-3 flex items-center">
                📊 PARALYSIE ANALYTIQUE
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Gouffre temporel pour s'assurer de cibler les bons problèmes</li>
                <li>• Apprentissages des tests précédents perdus dans les spreadsheets</li>
                <li>• Tests non soutenus par une base de données quali + quanti solide</li>
              </ul>
            </div>

            {/* Organizational Pressure */}
            <div className="text-left p-6 rounded-lg border bg-card">
              <h3 className="text-lg font-semibold text-destructive mb-3 flex items-center">
                🏢 PRESSION ORGANISATIONNELLE
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Pression ROI constante du leadership sur chaque test</li>
                <li>• Difficile de justifier la valeur du programme de tests</li>
                <li>• L'AB testing devrait accélérer les décisions, pas les ralentir</li>
              </ul>
            </div>

            {/* Scale Limitations */}
            <div className="text-left p-6 rounded-lg border bg-card">
              <h3 className="text-lg font-semibold text-destructive mb-3 flex items-center">
                📈 LIMITES D'ÉCHELLE
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Processus manuels qui ne s'adaptent pas à la croissance de l'entreprise</li>
                <li>• Expertise CRO concentrée sur 1-2 personnes (goulot d'étranglement)</li>
                <li>• Problèmes de conformité de marque avec les itérations de tests rapides</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Email form */}
        <form onSubmit={handleEmailSubmit} className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting || isSubmitted}
              className="flex-1"
              required
            />
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isSubmitting || isSubmitted}
                className="whitespace-nowrap"
              >
                {isSubmitting ? (
                  "Joining..."
                ) : isSubmitted ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Joined!
                  </>
                ) : (
                  "Wait-list for early adopter"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleShare}
                title="Share this page"
              >
                <Share className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </form>
        
        {/* Beta benefits message */}
        <p className="text-sm text-muted-foreground">
          Beta testers will have lifetime benefits
        </p>
      </div>
    </div>
  );
};

export default Landing;