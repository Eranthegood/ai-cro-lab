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
        
        {/* Pain Points Section */}
        <div className="w-full max-w-4xl mx-auto mt-16 space-y-8">
          <div className="grid gap-8 md:gap-6">
            {/* Velocity Crisis */}
            <div className="text-left p-6 rounded-lg border bg-card">
              <h3 className="text-lg font-semibold text-destructive mb-3 flex items-center">
                🚀 VELOCITY CRISIS
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 2-3 weeks from insight to live test (should be 2-3 days)</li>
                <li>• 15h/week wasted on manual analysis vs strategic work</li>
                <li>• Low testing velocity = low learning rate = competitive disadvantage</li>
              </ul>
            </div>

            {/* Operational Chaos */}
            <div className="text-left p-6 rounded-lg border bg-card">
              <h3 className="text-lg font-semibold text-destructive mb-3 flex items-center">
                🔧 OPERATIONAL CHAOS
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Juggling 8-12 different tools daily (CS → Excel → Linear → AB Tasty...)</li>
                <li>• Dev teams overloaded, CRO tests deprioritized</li>
                <li>• Tool fragmentation kills momentum and creates errors</li>
              </ul>
            </div>

            {/* Analysis Paralysis */}
            <div className="text-left p-6 rounded-lg border bg-card">
              <h3 className="text-lg font-semibold text-destructive mb-3 flex items-center">
                📊 ANALYSIS PARALYSIS
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Massive time sink ensuring you're targeting the right issues</li>
                <li>• Previous test learnings get lost in spreadsheets</li>
                <li>• Tests not backed by proper qual + quant data foundation</li>
              </ul>
            </div>

            {/* Organizational Pressure */}
            <div className="text-left p-6 rounded-lg border bg-card">
              <h3 className="text-lg font-semibold text-destructive mb-3 flex items-center">
                🏢 ORGANIZATIONAL PRESSURE
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Constant ROI pressure from leadership on every test</li>
                <li>• Hard to justify testing program value</li>
                <li>• AB testing should drive decisions, not slow them down</li>
              </ul>
            </div>

            {/* Scale Limitations */}
            <div className="text-left p-6 rounded-lg border bg-card">
              <h3 className="text-lg font-semibold text-destructive mb-3 flex items-center">
                📈 SCALE LIMITATIONS
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Manual processes don't scale with company growth</li>
                <li>• CRO expertise concentrated in 1-2 people (bottleneck)</li>
                <li>• Brand compliance issues with rapid test iterations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;