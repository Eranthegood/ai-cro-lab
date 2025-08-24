import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Share, CheckCircle, ArrowRight, Zap, Target, BarChart3, Users, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Feature } from '@/components/ui/feature-with-advantages';

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
    <div className="min-h-screen bg-primary">
      {/* Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary-foreground/10 border border-primary-foreground/20">
              <div className="w-4 h-4 rounded-sm bg-primary-foreground transform rotate-45"></div>
            </div>
            <div className="text-primary-foreground font-semibold text-xl tracking-tight">
              Fast Ship
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            {/* Main headline */}
            <div className="space-y-4">
              <h1 className="text-[7rem] sm:text-[8.5rem] lg:text-[10.5rem] xl:text-[12.25rem] font-bold text-primary-foreground leading-tight tracking-tight">
                Make AB testing
                <span className="block text-muted-foreground">
                  boring.
                </span>
              </h1>
            </div>
            
            {/* Description */}
            <p className="text-lg sm:text-xl text-primary-foreground/80 leading-relaxed max-w-3xl mx-auto font-light">
              Automated Ab Test platform for teams to take control of every test—combining data analysis, hypothesis generation, and automated workflows to ship faster, de-risk every experiment, and build without guesswork.
            </p>
            
            {/* CTA Section */}
            <div className="space-y-6 pt-8">
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                  <div className="flex-1">
                    <Input
                      type="email"
                      placeholder="Enter your work email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting || isSubmitted}
                      className="h-14 text-base bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 focus:border-primary-foreground focus:ring-2 focus:ring-primary-foreground/20"
                      required
                    />
                  </div>
                  <div className="flex gap-2 sm:flex-shrink-0">
                    <Button
                      type="submit"
                      disabled={isSubmitting || isSubmitted}
                      size="lg"
                      className="flex-1 sm:flex-none h-14 px-8 text-base font-semibold bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-all duration-200"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                          Joining...
                        </>
                      ) : isSubmitted ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Joined!
                        </>
                      ) : (
                        "Join waitlist"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="lg"
                      onClick={handleShare}
                      title="Share this page"
                      className="h-14 w-14 text-primary-foreground hover:bg-primary-foreground/10 transition-all duration-200"
                    >
                      <Share className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </form>
              
              {/* Secondary CTA */}
              <div className="text-center">
                <p className="text-info font-medium text-lg cursor-pointer hover:underline">
                  Start building
                </p>
              </div>
              
              {/* Beta benefits message */}
              <p className="text-sm text-primary-foreground/60">
                <strong className="text-primary-foreground">Beta testers</strong> get lifetime benefits and priority access
              </p>
            </div>
          </div>
        </div>
      </div>
        
      {/* Pain Points Section */}
      <div className="bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                join if your pain points are :
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Enterprise teams are struggling with outdated workflows that slow down innovation
              </p>
            </div>
            
            <div className="space-y-8">
              {/* Analysis Paralysis Over Action */}
              <div className="border-l-4 border-destructive pl-6">
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Analysis Paralysis Over Action
                </h3>
                <p className="text-lg italic text-muted-foreground mb-3">
                  "We spend 80% of our time analyzing data and only 20% actually testing hypotheses"
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• 15+ hours weekly drowning in Contentsquare exports, heatmaps, and user session recordings</li>
                  <li>• Manual cross-referencing between analytics tools creates analysis bottlenecks</li>
                  <li>• Insights get lost in spreadsheets instead of becoming live tests</li>
                </ul>
              </div>

              {/* Fragmented Decision-Making Process */}
              <div className="border-l-4 border-warning pl-6">
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Fragmented Decision-Making Process
                </h3>
                <p className="text-lg italic text-muted-foreground mb-3">
                  "A/B testing drives every business decision, but our process is scattered across 8+ tools"
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• No centralized hub connecting insights → hypotheses → tests → results</li>
                  <li>• Research findings, test decks, analysis, and roadmaps live in different systems</li>
                  <li>• Teams work in silos: Analytics finds issues, PM creates hypotheses, Dev builds tests</li>
                </ul>
              </div>

              {/* Insight-to-Launch Velocity Crisis */}
              <div className="border-l-4 border-info pl-6">
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Insight-to-Launch Velocity Crisis
                </h3>
                <p className="text-lg italic text-muted-foreground mb-3">
                  "It takes 2-3 weeks to go from 'we found something interesting' to 'test is live'"
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Manual hypothesis creation from raw data insights</li>
                  <li>• Time-consuming test specification and design handoffs</li>
                  <li>• Too much complex feature test, unbalance risk / velocity matrix</li>
                </ul>
              </div>

              {/* Data Centralization Challenge */}
              <div className="border-l-4 border-primary pl-6">
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Data Centralization Challenge
                </h3>
                <p className="text-lg italic text-muted-foreground mb-3">
                  "Our best insights are trapped in isolated tools, preventing compound learning"
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Historical test results don't inform new hypothesis generation</li>
                  <li>• User research insights aren't systematically integrated into test planning</li>
                  <li>• No learning loop: each test starts from scratch instead of building on previous learnings</li>
                </ul>
              </div>

              {/* ROI Pressure vs. Professional Process */}
              <div className="border-l-4 border-success pl-6">
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  ROI Pressure vs. Professional Process
                </h3>
                <p className="text-lg italic text-muted-foreground mb-3">
                  "Leadership demands faster growth, but we lack the systematic process to scale CRO professionally"
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Ad-hoc testing approach limits velocity and learning</li>
                  <li>• No standardized methodology for hypothesis prioritization</li>
                  <li>• Difficulty justifying test resource allocation without clear ROI pipeline</li>
                </ul>
              </div>

              {/* Scaling Ambitions Require Automation */}
              <div className="border-l-4 border-accent pl-6">
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Scaling Ambitions Require Automation
                </h3>
                <p className="text-lg italic text-muted-foreground mb-3">
                  "Our conversion rate goals are ambitious, but manual processes cap our testing velocity"
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Current capacity: 2-3 tests/month vs. need for 8-12 tests/month</li>
                  <li>• Team bandwidth stretched thin across analysis, execution, and reporting</li>
                  <li>• Cannot achieve competitive advantage through testing volume with current workflow</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* How we solve this Section */}
      <div className="bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              How we solve this
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transform your AB testing from manual chaos to automated intelligence
            </p>
          </div>
          <Feature />
        </div>
      </div>
      
      {/* Bottom Waitlist CTA */}
      <div className="bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground">
              Ready to ship faster?
            </h2>
            <p className="text-lg text-primary-foreground/80">
              Join the waitlist and be the first to experience automated AB testing
            </p>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting || isSubmitted}
                    className="h-12 text-base bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 focus:border-primary-foreground focus:ring-2 focus:ring-primary-foreground/20"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting || isSubmitted}
                  size="lg"
                  className="h-12 px-6 text-base font-semibold bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-all duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                      Joining...
                    </>
                  ) : isSubmitted ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Joined!
                    </>
                  ) : (
                    "Join waitlist"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;