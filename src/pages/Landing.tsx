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
import { HeroGeometric } from '@/components/ui/shape-landing-hero';
import TestimonialSection from '@/components/ui/testimonials';
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
  return <div className="min-h-screen">
      {/* Hero Section */}
      <HeroGeometric 
        badge="Join Wait list"
        title1="Make AB testing"
        title2="boring."
        description="From data to ready-to-launch AB test in one click."
      />

      {/* Testimonial Section */}
      <TestimonialSection />
        
      {/* How we solve this Section */}
      <div className="bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-16 sm:pb-20">
          <FeaturesSectionWithHoverEffects />
        </div>
      </div>

      {/* Roadmap Section */}
      <div className="bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Product Roadmap
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our journey to fully automated AB testing workflow
            </p>
          </div>
          
          <div className="space-y-8">
            {/* Q3 2025 */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="md:w-32 flex-shrink-0">
                <div className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold">
                  Q3 2025
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-foreground mb-2">Core Platform</h3>
                <p className="text-muted-foreground">
                  Core platform and multi-layer prompts with AI-engineered AB-Tests.
                </p>
              </div>
            </div>
            
            {/* Q4 2025 */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="md:w-32 flex-shrink-0">
                <div className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold">
                  Q4 2025
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-foreground mb-2">Data Fully Exploited by LLM</h3>
                <p className="text-muted-foreground">
                  Fully integrated dataset in the vault and vault exploitation by LLM.
                </p>
              </div>
            </div>
            
            {/* Q1 2026 */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="md:w-32 flex-shrink-0">
                <div className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold">
                  Q1 2026
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-foreground mb-2">Ready-to-Deploy AB-Tests</h3>
                <p className="text-muted-foreground">
                  Cursor and Vibecoding preview with fully compatible and compliant codebase.
                </p>
              </div>
            </div>
            
            {/* Q2 2026 */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="md:w-32 flex-shrink-0">
                <div className="inline-block bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-semibold">
                  Q2 2026
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-foreground mb-2">Launch! 🚀</h3>
                <p className="text-muted-foreground">
                  Official product launch with all core features.
                </p>
              </div>
            </div>
            
            {/* Q3 2026 */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="md:w-32 flex-shrink-0">
                <div className="inline-block bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-semibold">
                  Q3 2026
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-foreground mb-2">100% Automated Workflow</h3>
                <p className="text-muted-foreground">
                  Fully integrated AB test workflow (backlog, roadmap, archive, auto-deck).
                </p>
              </div>
            </div>
          </div>
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
            
            <div className="flex items-center justify-center gap-2 pt-4">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-primary-foreground/70">
                Lifetime access to premium features
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default Landing;