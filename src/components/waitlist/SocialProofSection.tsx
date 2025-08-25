import React, { useState, useEffect } from 'react';
import { Users, Building2, Zap } from 'lucide-react';

interface SocialProofSectionProps {
  className?: string;
}

const SocialProofSection = ({ className = "" }: SocialProofSectionProps) => {
  const [subscriberCount, setSubscriberCount] = useState(247);

  // Simulate gradual increase in subscriber count
  useEffect(() => {
    const interval = setInterval(() => {
      setSubscriberCount(prev => prev + Math.floor(Math.random() * 3));
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Head of Growth, TechCorp",
      company: "TechCorp",
      quote: "We're drowning in data but starving for actionable tests. This looks like exactly what we need.",
      avatar: "SC"
    },
    {
      name: "Marcus Johnson", 
      role: "Product Manager, E-commerce Plus",
      company: "E-commerce Plus",
      quote: "2-3 weeks from insight to test is killing our velocity. Can't wait to try this automated approach.",
      avatar: "MJ"
    },
    {
      name: "Elena Rodriguez",
      role: "CRO Lead, FinanceFlow",
      company: "FinanceFlow", 
      quote: "Our analytics team finds great insights but they get lost in translation to actual tests.",
      avatar: "ER"
    }
  ];

  const companyLogos = [
    { name: "TechCorp", initial: "TC" },
    { name: "DataFlow", initial: "DF" },
    { name: "GrowthCo", initial: "GC" },
    { name: "ScaleSys", initial: "SS" },
    { name: "OptimizeHub", initial: "OH" }
  ];

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Live Counter */}
      <div className="flex items-center justify-center gap-3 text-primary-foreground/80">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          <Users className="w-4 h-4" />
          <span className="font-medium">{subscriberCount}</span>
          <span className="text-sm">professionals already joined</span>
        </div>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-primary-foreground">{testimonial.avatar}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-primary-foreground/90 mb-2 leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="text-xs text-primary-foreground/60">
                  <div className="font-medium">{testimonial.name}</div>
                  <div>{testimonial.role}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Company Trust Indicators */}
      <div className="text-center space-y-3">
        <p className="text-sm text-primary-foreground/60">
          Trusted by growth teams from
        </p>
        <div className="flex items-center justify-center gap-6 flex-wrap">
          {companyLogos.map((company, index) => (
            <div key={index} className="flex items-center gap-2 text-primary-foreground/40">
              <div className="w-6 h-6 rounded bg-primary-foreground/10 flex items-center justify-center">
                <span className="text-xs font-medium">{company.initial}</span>
              </div>
              <span className="text-sm">{company.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Urgency Indicator */}
      <div className="flex items-center justify-center gap-2 text-warning">
        <Zap className="w-4 h-4" />
        <span className="text-sm font-medium">Limited to first 500 beta users</span>
      </div>
    </div>
  );
};

export default SocialProofSection;