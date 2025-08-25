import { cn } from "@/lib/utils";
import {
  IconTerminal2,
  IconBolt,
  IconBrain,
  IconDatabase,
  IconRocket,
  IconEye,
  IconClock,
  IconTrendingUp,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";

export function FeaturesSectionWithHoverEffects() {
  const features = [
    {
      title: "Automated End-to-End Workflow",
      description: "Transform 15 hours of manual analysis into 2 hours of strategic oversight with complete automation.",
      icon: <IconTerminal2 />,
      solves: "Analysis Paralysis Over Action",
      beforeAfter: {
        before: "15+ hours/week manual work",
        after: "2 hours strategic oversight",
        improvement: "87% time reduction"
      },
      roiMetric: "€40K+ monthly savings",
      socialProof: "Used by 200+ CRO teams"
    },
    {
      title: "Complete Data Integration", 
      description: "Contentsquare, Amplitude, Analytics - your entire data ecosystem unified and accessible.",
      icon: <IconDatabase />,
      solves: "Fragmented Decision-Making Process",
      beforeAfter: {
        before: "8+ disconnected tools",
        after: "1 unified platform",
        improvement: "Single source of truth"
      },
      roiMetric: "5x faster decisions",
      socialProof: "Enterprise ready"
    },
    {
      title: "AI-Powered Analysis",
      description: "Smart test generation and hypothesis creation powered by machine learning algorithms.",
      icon: <IconBrain />,
      solves: "Insight-to-Launch Velocity Crisis", 
      beforeAfter: {
        before: "2-3 weeks to launch",
        after: "Same day deployment",
        improvement: "95% velocity increase"
      },
      roiMetric: "12x more tests/month",
      socialProof: "AI-first approach"
    },
    {
      title: "One-Click Deployment",
      description: "From test brief to live deployment in seconds, not weeks.",
      icon: <IconRocket />,
      solves: "Insight-to-Launch Velocity Crisis",
      beforeAfter: {
        before: "Manual test setup",
        after: "Automated deployment",
        improvement: "Zero technical debt"
      },
      roiMetric: "Instant go-live",
      socialProof: "DevOps integrated"
    },
    {
      title: "Velocity Multiplier",
      description: "Scale from 3 tests per month to 12+ with 300% capacity increase.",
      icon: <IconBolt />,
      solves: "Scaling Ambitions Require Automation",
      beforeAfter: {
        before: "2-3 tests/month",
        after: "12+ tests/month", 
        improvement: "400% capacity boost"
      },
      roiMetric: "4x testing velocity",
      socialProof: "Scale-proven"
    },
    {
      title: "Intelligence Amplification",
      description: "Each test strengthens AI recommendations, building compound knowledge over time.",
      icon: <IconTrendingUp />,
      solves: "Data Centralization Challenge",
      beforeAfter: {
        before: "Isolated learnings",
        after: "Compound intelligence",
        improvement: "Self-improving system"
      },
      roiMetric: "40% more insights",
      socialProof: "ML-enhanced"
    },
    {
      title: "24/7 Pattern Recognition",
      description: "Automated discovery of non-obvious optimization opportunities around the clock.",
      icon: <IconEye />,
      solves: "Data Centralization Challenge",
      beforeAfter: {
        before: "Manual pattern hunting",
        after: "AI pattern detection",
        improvement: "24/7 monitoring"
      },
      roiMetric: "Hidden opportunities",
      socialProof: "Always-on insights"
    },
    {
      title: "Instant Time-to-Launch",
      description: "Reduce time-to-launch from 3 weeks to 1 day (95% faster testing cycles).",
      icon: <IconClock />,
      solves: "ROI Pressure vs. Professional Process",
      beforeAfter: {
        before: "3 weeks deployment",
        after: "1 day go-live",
        improvement: "95% faster cycles"
      },
      roiMetric: "Professional at scale",
      socialProof: "Enterprise velocity"
    },
  ];
  return (
    <div className="py-20 lg:py-40">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <Badge className="mb-4">Our Solution</Badge>
          <h2 className="text-3xl md:text-5xl font-regular tracking-tighter mb-6">
            How We Solve Your Critical Challenges
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Each feature directly addresses a specific pain point, transforming your CRO workflow from manual to automated
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 max-w-7xl mx-auto gap-6">
          {features.map((feature, index) => (
            <Feature key={feature.title} {...feature} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
  solves,
  beforeAfter,
  roiMetric,
  socialProof,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
  solves: string;
  beforeAfter: {
    before: string;
    after: string;
    improvement: string;
  };
  roiMetric: string;
  socialProof: string;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col relative group/feature p-6 rounded-xl border-2 border-border bg-card hover:border-success/30 hover:bg-success/5 transition-all duration-300 hover:shadow-elevated hover:-translate-y-1"
      )}
    >
      {/* Problem Solved Badge */}
      <div className="absolute top-4 right-4">
        <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
          SOLVES
        </Badge>
      </div>

      {/* Icon and Title */}
      <div className="mb-4 relative z-10">
        <div className="mb-3 p-3 rounded-lg bg-success/10 text-success w-fit group-hover/feature:bg-success/20 transition-colors">
          {icon}
        </div>
        <h3 className="text-lg font-bold mb-2 group-hover/feature:text-success transition-colors">
          {title}
        </h3>
      </div>

      {/* Problem Reference */}
      <div className="mb-4 p-3 bg-muted/50 rounded-lg">
        <div className="text-xs text-muted-foreground mb-1">Directly Solves:</div>
        <div className="text-sm font-medium text-foreground">{solves}</div>
      </div>

      {/* Before/After Comparison */}
      <div className="mb-4 space-y-2">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-destructive/10 rounded text-center">
            <div className="text-destructive font-medium">Before</div>
            <div className="text-destructive/80">{beforeAfter.before}</div>
          </div>
          <div className="p-2 bg-success/10 rounded text-center">
            <div className="text-success font-medium">After</div>
            <div className="text-success/80">{beforeAfter.after}</div>
          </div>
        </div>
        <div className="text-center p-2 bg-gradient-to-r from-success/20 to-success/10 rounded">
          <div className="text-sm font-semibold text-success">{beforeAfter.improvement}</div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed flex-grow">
        {description}
      </p>

      {/* ROI and Social Proof */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/50">
        <div className="text-center">
          <div className="text-xs text-muted-foreground">ROI Impact</div>
          <div className="text-sm font-semibold text-foreground">{roiMetric}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground">Status</div>
          <div className="text-sm font-semibold text-success">{socialProof}</div>
        </div>
      </div>

      {/* Hover Effect Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-success/5 via-transparent to-transparent opacity-0 group-hover/feature:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
    </div>
  );
};