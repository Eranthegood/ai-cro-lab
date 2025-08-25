import React from 'react';
import { Shield, Lock, Award, Users, CheckCircle, Globe } from 'lucide-react';

interface TrustSignalsProps {
  className?: string;
}

const TrustSignals = ({ className = "" }: TrustSignalsProps) => {
  const securityFeatures = [
    {
      icon: Shield,
      text: "SOC 2 Compliant"
    },
    {
      icon: Lock,
      text: "GDPR Ready"
    },
    {
      icon: Award,
      text: "Enterprise Security"
    }
  ];

  const stats = [
    {
      icon: Users,
      value: "500+",
      label: "Beta applicants"
    },
    {
      icon: Globe,
      value: "12+",
      label: "Countries"
    },
    {
      icon: CheckCircle,
      value: "95%",
      label: "Satisfaction rate"
    }
  ];

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Security Badges */}
      <div className="flex items-center justify-center gap-6 flex-wrap">
        {securityFeatures.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <div key={index} className="flex items-center gap-2 text-primary-foreground/60">
              <IconComponent className="w-4 h-4" />
              <span className="text-sm font-medium">{feature.text}</span>
            </div>
          );
        })}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="text-center space-y-1">
              <div className="flex items-center justify-center w-8 h-8 mx-auto bg-primary-foreground/10 rounded-full">
                <IconComponent className="w-4 h-4 text-primary-foreground/80" />
              </div>
              <div className="text-lg font-bold text-primary-foreground">{stat.value}</div>
              <div className="text-xs text-primary-foreground/60">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Trust Statement */}
      <div className="text-center max-w-lg mx-auto">
        <p className="text-sm text-primary-foreground/70 leading-relaxed">
          Join growth teams from fast-growing companies who are already revolutionizing their AB testing workflows. 
          <span className="font-medium text-primary-foreground"> No spam, unsubscribe anytime.</span>
        </p>
      </div>
    </div>
  );
};

export default TrustSignals;