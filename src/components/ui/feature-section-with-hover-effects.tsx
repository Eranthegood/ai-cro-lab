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

export function FeaturesSectionWithHoverEffects() {
  const features = [
    {
      title: "Automated End-to-End Workflow",
      description:
        "Transform 15 hours of manual analysis into 2 hours of strategic oversight with complete automation.",
      icon: <IconTerminal2 />,
    },
    {
      title: "Complete Data Integration",
      description:
        "Contentsquare, Amplitude, Analytics - your entire data ecosystem unified and accessible.",
      icon: <IconDatabase />,
    },
    {
      title: "AI-Powered Analysis",
      description:
        "Smart test generation and hypothesis creation powered by machine learning algorithms.",
      icon: <IconBrain />,
    },
    {
      title: "One-Click Deployment",
      description: "From test brief to live deployment in seconds, not weeks.",
      icon: <IconRocket />,
    },
    {
      title: "Velocity Multiplier",
      description: "Scale from 3 tests per month to 12+ with 300% capacity increase.",
      icon: <IconBolt />,
    },
    {
      title: "Intelligence Amplification",
      description:
        "Each test strengthens AI recommendations, building compound knowledge over time.",
      icon: <IconTrendingUp />,
    },
    {
      title: "24/7 Pattern Recognition",
      description:
        "Automated discovery of non-obvious optimization opportunities around the clock.",
      icon: <IconEye />,
    },
    {
      title: "Instant Time-to-Launch",
      description: "Reduce time-to-launch from 3 weeks to 1 day (95% faster testing cycles).",
      icon: <IconClock />,
    },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  relative z-10 py-10 max-w-7xl mx-auto">
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} />
      ))}
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r py-10 relative group/feature border-border",
        (index === 0 || index === 4) && "lg:border-l border-border",
        index < 4 && "lg:border-b border-border"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-background/50 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-background/50 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-muted-foreground">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-border group-hover/feature:bg-primary transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-foreground">
          {title}
        </span>
      </div>
      <p className="text-sm text-muted-foreground max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};