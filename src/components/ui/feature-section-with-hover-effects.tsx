import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
export function FeaturesSectionWithHoverEffects() {
  const features = [{
    title: "Automated End-to-End Workflow",
    description: "Transform 15 hours of manual analysis into 2 hours of strategic oversight with complete automation.",
    solves: "Analysis Paralysis Over Action",
    beforeAfter: {
      before: "15+ hours/week manual work",
      after: "2 hours strategic oversight",
      improvement: "87% time reduction"
    }
  }, {
    title: "Complete Data Integration",
    description: "Contentsquare, Amplitude, Analytics - your entire data ecosystem unified and accessible.",
    solves: "Fragmented Decision-Making Process",
    beforeAfter: {
      before: "8+ disconnected tools",
      after: "1 unified platform",
      improvement: "Single source of truth"
    }
  }, {
    title: "AI-Powered Analysis",
    description: "Smart test generation and hypothesis creation powered by machine learning algorithms.",
    solves: "Insight-to-Launch Velocity Crisis",
    beforeAfter: {
      before: "2-3 weeks to launch",
      after: "Same day deployment",
      improvement: "95% velocity increase"
    }
  }, {
    title: "One-Click Deployment",
    description: "From test brief to live deployment in seconds, not weeks.",
    solves: "Insight-to-Launch Velocity Crisis",
    beforeAfter: {
      before: "Manual test setup",
      after: "Automated deployment",
      improvement: "Zero technical debt"
    }
  }, {
    title: "Velocity Multiplier",
    description: "Scale from 3 tests per month to 12+ with 300% capacity increase.",
    solves: "Scaling Ambitions Require Automation",
    beforeAfter: {
      before: "2-3 tests/month",
      after: "12+ tests/month",
      improvement: "400% capacity boost"
    }
  }, {
    title: "Intelligence Amplification",
    description: "Each test strengthens AI recommendations, building compound knowledge over time.",
    solves: "Data Centralization Challenge",
    beforeAfter: {
      before: "Isolated learnings",
      after: "Compound intelligence",
      improvement: "Self-improving system"
    }
  }, {
    title: "24/7 Pattern Recognition",
    description: "Automated discovery of non-obvious optimization opportunities around the clock.",
    solves: "Data Centralization Challenge",
    beforeAfter: {
      before: "Manual pattern hunting",
      after: "AI pattern detection",
      improvement: "24/7 monitoring"
    }
  }, {
    title: "Instant Time-to-Launch",
    description: "Reduce time-to-launch from 3 weeks to 1 day (95% faster testing cycles).",
    solves: "ROI Pressure vs. Professional Process",
    beforeAfter: {
      before: "3 weeks deployment",
      after: "1 day go-live",
      improvement: "95% faster cycles"
    }
  }];
  return <div className="py-20 lg:py-40">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <Badge className="mb-4">Our Solution</Badge>
          <h2 className="text-3xl md:text-5xl font-regular tracking-tighter mb-6">From insight to live test in minutes, not weeks. That's the velocity modern CRO teams need.</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Each feature directly addresses a specific pain point, transforming your CRO workflow from manual to automated
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 max-w-7xl mx-auto gap-6">
          {features.map(feature => <Feature key={feature.title} {...feature} />)}
        </div>
      </div>
    </div>;
}
const Feature = ({
  title,
  description,
  solves,
  beforeAfter
}: {
  title: string;
  description: string;
  solves: string;
  beforeAfter: {
    before: string;
    after: string;
    improvement: string;
  };
}) => {
  return <div className="p-6 border border-border rounded-lg hover:border-muted-foreground/20 transition-colors">
      {/* Title */}
      <h3 className="text-xl font-semibold mb-3">
        {title}
      </h3>

      {/* Pain Point */}
      <div className="mb-4">
        <div className="text-sm text-muted-foreground mb-1">Pain Point:</div>
        <div className="text-foreground">{solves}</div>
      </div>

      {/* Solution Description */}
      <p className="text-muted-foreground mb-4 leading-relaxed">
        {description}
      </p>

      {/* KPI Improvement */}
      <div className="pt-3 border-t border-border/50">
        <div className="text-sm text-muted-foreground mb-1">Output:</div>
        <div className="font-semibold text-foreground">{beforeAfter.improvement}</div>
      </div>
    </div>;
};