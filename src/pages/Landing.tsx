import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Share, CheckCircle, ArrowRight, Zap, Target, BarChart3, Users, Clock, Crown, Headphones, Sparkles, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FeaturesSectionWithHoverEffects } from '@/components/ui/feature-section-with-hover-effects';
import SocialProofSection from '@/components/waitlist/SocialProofSection';
import EnhancedWaitlistForm from '@/components/waitlist/EnhancedWaitlistForm';
import TrustSignals from '@/components/waitlist/TrustSignals';
import FAQSection from '@/components/waitlist/FAQSection';
const Landing = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const {
    toast
  } = useToast();
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const {
        error
      } = await supabase.from('waitlist').insert({
        email: email.toLowerCase(),
        referral_source: 'direct',
        user_agent: navigator.userAgent
      });
      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already registered",
            description: "This email is already on our waitlist!"
          });
        } else {
          throw error;
        }
      } else {
        setIsSubmitted(true);
        toast({
          title: "Welcome to the waitlist!",
          description: "You'll be among the first to know when we launch."
        });
      }
    } catch (error) {
      console.error('Error adding to waitlist:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleShare = async () => {
    const shareData = {
      title: 'Automated AB test Workflow',
      text: 'From Data to Ready to Launch AB test in 1 clicks. Join the waitlist!',
      url: window.location.href
    };
    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied!",
          description: "Share this link with others."
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };
  return <div className="min-h-screen bg-primary">
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center space-y-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight">
              Make AB testing boring.
            </h1>
            
            <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              From data to ready-to-launch AB test in one click.
            </p>
            
            <div className="pt-8">
              <EnhancedWaitlistForm />
            </div>
          </div>
        </div>
      </div>

      {/* What's in it for me Section */}
      <div className="bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              What's in it for me?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join early and unlock exclusive benefits that will accelerate your AB testing success
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4 p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Crown className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Lifetime Premium Access</h3>
              <p className="text-sm text-muted-foreground">Get lifetime access to all premium features worth $299/month - completely free for early adopters</p>
            </div>
            
            <div className="text-center space-y-4 p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Early Access</h3>
              <p className="text-sm text-muted-foreground">Be among the first to experience the platform before public launch and shape the product roadmap</p>
            </div>
            
            <div className="text-center space-y-4 p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Headphones className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Priority Support</h3>
              <p className="text-sm text-muted-foreground">Direct line to our team with priority customer support and personalized onboarding assistance</p>
            </div>
            
            <div className="text-center space-y-4 p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Influence Roadmap</h3>
              <p className="text-sm text-muted-foreground">Your feedback directly influences new features and integrations we build next</p>
            </div>
          </div>
        </div>
      </div>
        
      {/* Pain Points Section */}
      <div className="bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-row gap-6 w-full items-start">
              <CheckCircle className="w-5 h-5 mt-2 text-primary flex-shrink-0" />
              <div className="flex flex-col gap-1">
                <p className="font-semibold text-foreground">Analysis Paralysis Over Action</p>
                <p className="text-muted-foreground text-sm italic mb-2">
                  "We spend 80% of our time analyzing data and only 20% actually testing hypotheses"
                </p>
                <ul className="text-muted-foreground text-sm space-y-1">
                  <li>• 15+ hours weekly drowning in Contentsquare exports, heatmaps, and user session recordings</li>
                  <li>• Manual cross-referencing between analytics tools creates analysis bottlenecks</li>
                  <li>• Insights get lost in spreadsheets instead of becoming live tests</li>
                </ul>
              </div>
            </div>
            <div className="flex flex-row gap-6 items-start">
              <CheckCircle className="w-5 h-5 mt-2 text-primary flex-shrink-0" />
              <div className="flex flex-col gap-1">
                <p className="font-semibold text-foreground">Fragmented Decision-Making Process</p>
                <p className="text-muted-foreground text-sm italic mb-2">
                  "A/B testing drives every business decision, but our process is scattered across 8+ tools"
                </p>
                <ul className="text-muted-foreground text-sm space-y-1">
                  <li>• No centralized hub connecting insights → hypotheses → tests → results</li>
                  <li>• Research findings, test decks, analysis, and roadmaps live in different systems</li>
                  <li>• Teams work in silos: Analytics finds issues, PM creates hypotheses, Dev builds tests</li>
                </ul>
              </div>
            </div>
            <div className="flex flex-row gap-6 items-start">
              <CheckCircle className="w-5 h-5 mt-2 text-primary flex-shrink-0" />
              <div className="flex flex-col gap-1">
                <p className="font-semibold text-foreground">Insight-to-Launch Velocity Crisis</p>
                <p className="text-muted-foreground text-sm italic mb-2">
                  "It takes 2-3 weeks to go from 'we found something interesting' to 'test is live'"
                </p>
                <ul className="text-muted-foreground text-sm space-y-1">
                  <li>• Manual hypothesis creation from raw data insights</li>
                  <li>• Time-consuming test specification and design handoffs</li>
                  <li>• Too much complex feature test, unbalance risk / velocity matrix</li>
                </ul>
              </div>
            </div>
            <div className="flex flex-row gap-6 w-full items-start">
              <CheckCircle className="w-5 h-5 mt-2 text-primary flex-shrink-0" />
              <div className="flex flex-col gap-1">
                <p className="font-semibold text-foreground">Data Centralization Challenge</p>
                <p className="text-muted-foreground text-sm italic mb-2">
                  "Our best insights are trapped in isolated tools, preventing compound learning"
                </p>
                <ul className="text-muted-foreground text-sm space-y-1">
                  <li>• Historical test results don't inform new hypothesis generation</li>
                  <li>• User research insights aren't systematically integrated into test planning</li>
                  <li>• No learning loop: each test starts from scratch instead of building on previous learnings</li>
                </ul>
              </div>
            </div>
            <div className="flex flex-row gap-6 items-start">
              <CheckCircle className="w-5 h-5 mt-2 text-primary flex-shrink-0" />
              <div className="flex flex-col gap-1">
                <p className="font-semibold text-foreground">ROI Pressure vs. Professional Process</p>
                <p className="text-muted-foreground text-sm italic mb-2">
                  "Leadership demands faster growth, but we lack the systematic process to scale CRO professionally"
                </p>
                <ul className="text-muted-foreground text-sm space-y-1">
                  <li>• Ad-hoc testing approach limits velocity and learning</li>
                  <li>• No standardized methodology for hypothesis prioritization</li>
                  <li>• Difficulty justifying test resource allocation without clear ROI pipeline</li>
                </ul>
              </div>
            </div>
            <div className="flex flex-row gap-6 items-start">
              <CheckCircle className="w-5 h-5 mt-2 text-primary flex-shrink-0" />
              <div className="flex flex-col gap-1">
                <p className="font-semibold text-foreground">Scaling Ambitions Require Automation</p>
                <p className="text-muted-foreground text-sm italic mb-2">
                  "Our conversion rate goals are ambitious, but manual processes cap our testing velocity"
                </p>
                <ul className="text-muted-foreground text-sm space-y-1">
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
          <FeaturesSectionWithHoverEffects />
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <FAQSection />
        </div>
      </div>
      
      
      {/* Bottom Waitlist CTA */}
      <div className="bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center space-y-8 max-w-2xl mx-auto">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground">
                Ready to ship faster?
              </h2>
              <p className="text-lg text-primary-foreground/80">
                Join the waitlist and be the first to experience automated AB testing
              </p>
            </div>
            
            <EnhancedWaitlistForm />
            
            <TrustSignals className="pt-4" />
          </div>
        </div>
      </div>
    </div>;
};
export default Landing;