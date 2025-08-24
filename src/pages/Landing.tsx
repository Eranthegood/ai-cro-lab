import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Share, CheckCircle, ArrowRight, Zap, Target, BarChart3, Users, Clock } from 'lucide-react';
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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-subtle" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            {/* Main title */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-tight tracking-tight">
                Automated AB test
                <span className="block gradient-primary bg-clip-text text-transparent">
                  Workflow
                </span>
              </h1>
              
              {/* Subtitle */}
              <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                From Data to Ready to Launch AB test in 1 click
              </p>
            </div>
            
            {/* CTA Section */}
            <div className="space-y-6">
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                  <div className="flex-1">
                    <Input
                      type="email"
                      placeholder="Enter your work email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting || isSubmitted}
                      className="h-12 text-base shadow-professional border-input/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                  <div className="flex gap-2 sm:flex-shrink-0">
                    <Button
                      type="submit"
                      disabled={isSubmitting || isSubmitted}
                      size="lg"
                      className="flex-1 sm:flex-none h-12 px-8 text-base font-semibold shadow-professional hover:shadow-elevated transition-all duration-200"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                          Joining...
                        </>
                      ) : isSubmitted ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Joined!
                        </>
                      ) : (
                        <>
                          Get Early Access
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={handleShare}
                      title="Share this page"
                      className="h-12 w-12 shadow-professional hover:shadow-elevated transition-all duration-200"
                    >
                      <Share className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </form>
              
              {/* Beta benefits message */}
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Beta testers</strong> get lifetime benefits and priority access
              </p>
            </div>
          </div>
        </div>
      </div>
        
      {/* Pain Points Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              The Reality of AB Testing Today
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Enterprise teams are struggling with outdated workflows that slow down innovation
            </p>
          </div>
          
          <div className="grid gap-6 md:gap-8 lg:grid-cols-2">
            {/* Velocity Crisis */}
            <div className="group p-6 lg:p-8 rounded-2xl border border-border bg-card gradient-card shadow-professional hover:shadow-elevated transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-destructive" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                    VELOCITY CRISIS
                  </h3>
                  <ul className="space-y-2.5 text-sm text-muted-foreground leading-relaxed">
                    <li className="flex items-start"><span className="text-destructive mr-2 font-semibold">•</span>2-3 weeks from insight to live test (should be 2-3 days)</li>
                    <li className="flex items-start"><span className="text-destructive mr-2 font-semibold">•</span>15h/week wasted on manual analysis vs strategic work</li>
                    <li className="flex items-start"><span className="text-destructive mr-2 font-semibold">•</span>Low testing velocity = low learning rate = competitive disadvantage</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Operational Chaos */}
            <div className="group p-6 lg:p-8 rounded-2xl border border-border bg-card gradient-card shadow-professional hover:shadow-elevated transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-warning" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                    OPERATIONAL CHAOS
                  </h3>
                  <ul className="space-y-2.5 text-sm text-muted-foreground leading-relaxed">
                    <li className="flex items-start"><span className="text-warning mr-2 font-semibold">•</span>Juggling 8-12 different tools daily (CS → Excel → Linear → AB Tasty...)</li>
                    <li className="flex items-start"><span className="text-warning mr-2 font-semibold">•</span>Dev teams overloaded, CRO tests deprioritized</li>
                    <li className="flex items-start"><span className="text-warning mr-2 font-semibold">•</span>Tool fragmentation kills momentum and creates errors</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Analysis Paralysis */}
            <div className="group p-6 lg:p-8 rounded-2xl border border-border bg-card gradient-card shadow-professional hover:shadow-elevated transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-info" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                    ANALYSIS PARALYSIS
                  </h3>
                  <ul className="space-y-2.5 text-sm text-muted-foreground leading-relaxed">
                    <li className="flex items-start"><span className="text-info mr-2 font-semibold">•</span>Massive time sink ensuring you're targeting the right issues</li>
                    <li className="flex items-start"><span className="text-info mr-2 font-semibold">•</span>Previous test learnings get lost in spreadsheets</li>
                    <li className="flex items-start"><span className="text-info mr-2 font-semibold">•</span>Tests not backed by proper qual + quant data foundation</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Organizational Pressure */}
            <div className="group p-6 lg:p-8 rounded-2xl border border-border bg-card gradient-card shadow-professional hover:shadow-elevated transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                    ORGANIZATIONAL PRESSURE
                  </h3>
                  <ul className="space-y-2.5 text-sm text-muted-foreground leading-relaxed">
                    <li className="flex items-start"><span className="text-primary mr-2 font-semibold">•</span>Constant ROI pressure from leadership on every test</li>
                    <li className="flex items-start"><span className="text-primary mr-2 font-semibold">•</span>Hard to justify testing program value</li>
                    <li className="flex items-start"><span className="text-primary mr-2 font-semibold">•</span>AB testing should drive decisions, not slow them down</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Scale Limitations - Full width on larger screens */}
            <div className="group lg:col-span-2 p-6 lg:p-8 rounded-2xl border border-border bg-card gradient-card shadow-professional hover:shadow-elevated transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                    <Target className="w-6 h-6 text-success" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                    SCALE LIMITATIONS
                  </h3>
                  <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="flex items-start"><span className="text-success mr-2 font-semibold">•</span><span className="text-sm text-muted-foreground leading-relaxed">Manual processes don't scale with company growth</span></div>
                    <div className="flex items-start"><span className="text-success mr-2 font-semibold">•</span><span className="text-sm text-muted-foreground leading-relaxed">CRO expertise concentrated in 1-2 people (bottleneck)</span></div>
                    <div className="flex items-start"><span className="text-success mr-2 font-semibold">•</span><span className="text-sm text-muted-foreground leading-relaxed">Brand compliance issues with rapid test iterations</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;