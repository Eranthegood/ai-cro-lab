import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLoops } from '@/hooks/useLoops';
interface FormData {
  email: string;
  companySize: string;
  role: string;
  currentTools: string;
}
interface EnhancedWaitlistFormProps {
  onSuccess?: () => void;
  className?: string;
}
const EnhancedWaitlistForm = ({
  onSuccess,
  className = ""
}: EnhancedWaitlistFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    companySize: '',
    role: '',
    currentTools: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [step, setStep] = useState(1); // 1: email, 2: qualification
  const {
    toast
  } = useToast();
  const { createContact } = useLoops();
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    setStep(2);
  };
  const handleQualificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const {
        error
      } = await supabase.from('waitlist').insert({
        email: formData.email.toLowerCase(),
        referral_source: 'enhanced_form',
        user_agent: JSON.stringify({
          userAgent: navigator.userAgent,
          companySize: formData.companySize,
          role: formData.role,
          currentTools: formData.currentTools
        })
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
        // Envoyer le contact à Loops
        try {
          await createContact({
            email: formData.email.toLowerCase(),
            source: 'waitlist',
            subscribed: true,
            userGroup: 'waitlist_members'
          });
          console.log('Contact envoyé à Loops avec succès');
        } catch (loopsError) {
          // Ne pas faire échouer l'inscription si Loops échoue
          console.warn('Erreur lors de l\'envoi à Loops:', loopsError);
        }

        setIsSubmitted(true);
        onSuccess?.();
        toast({
          title: "Welcome to the waitlist!",
          description: "You'll get priority access and exclusive updates."
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
  if (isSubmitted) {
    return <div className={`space-y-6 text-center ${className}`}>
        <div className="flex items-center justify-center w-16 h-16 mx-auto bg-success/20 rounded-full">
          <CheckCircle className="w-8 h-8 text-success" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-primary-foreground">You're in!</h3>
          <p className="text-primary-foreground/80">
            We'll keep you updated on our progress and give you priority access when we launch.
          </p>
        </div>
        
      </div>;
  }
  if (step === 1) {
    return <div className={`space-y-6 ${className}`}>
        <form onSubmit={handleEmailSubmit} className="max-w-lg mx-auto">
          <div className="flex gap-3">
            <Input type="email" placeholder="Enter your work email" value={formData.email} onChange={e => setFormData(prev => ({
            ...prev,
            email: e.target.value
          }))} className="flex-1 h-14 text-base bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 focus:border-primary-foreground focus:ring-2 focus:ring-primary-foreground/20" required />
            <Button type="submit" size="lg" className="h-14 px-8 text-base font-semibold bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-all duration-200">
              Join wait list <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </form>
      </div>;
  }
  return <div className={`space-y-6 ${className}`}>
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-primary-foreground">
          Tell us about your workflow
        </h3>
        <p className="text-sm text-primary-foreground/80">
          Help us prioritize features that matter most to your team
        </p>
      </div>

      <form onSubmit={handleQualificationSubmit} className="space-y-4 max-w-md mx-auto">
        <Select onValueChange={value => setFormData(prev => ({
        ...prev,
        companySize: value
      }))}>
          <SelectTrigger className="h-12 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground">
            <SelectValue placeholder="Company size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="startup">Startup (1-50 employees)</SelectItem>
            <SelectItem value="midsize">Mid-size (51-500 employees)</SelectItem>
            <SelectItem value="enterprise">Enterprise (500+ employees)</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={value => setFormData(prev => ({
        ...prev,
        role: value
      }))}>
          <SelectTrigger className="h-12 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground">
            <SelectValue placeholder="Your role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="growth-manager">Growth/Marketing Manager</SelectItem>
            <SelectItem value="product-manager">Product Manager</SelectItem>
            <SelectItem value="data-analyst">Data Analyst</SelectItem>
            <SelectItem value="cro-specialist">CRO Specialist</SelectItem>
            <SelectItem value="developer">Developer</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={value => setFormData(prev => ({
        ...prev,
        currentTools: value
      }))}>
          <SelectTrigger className="h-12 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground">
            <SelectValue placeholder="Primary AB testing tool" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="optimizely">Optimizely</SelectItem>
            <SelectItem value="google-optimize">Google Optimize</SelectItem>
            <SelectItem value="vwo">VWO</SelectItem>
            <SelectItem value="ab-tasty">AB Tasty</SelectItem>
            <SelectItem value="launchdarkly">LaunchDarkly</SelectItem>
            <SelectItem value="custom">Custom solution</SelectItem>
            <SelectItem value="none">No current tool</SelectItem>
          </SelectContent>
        </Select>

        <Button type="submit" disabled={isSubmitting} size="lg" className="w-full h-12 text-base font-semibold bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-all duration-200">
          {isSubmitting ? <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
              Joining waitlist...
            </> : "Join waitlist"}
        </Button>
      </form>

      <button onClick={() => setStep(1)} className="text-sm text-primary-foreground/60 hover:text-primary-foreground/80 underline">
        ← Back to email
      </button>
    </div>;
};
export default EnhancedWaitlistForm;