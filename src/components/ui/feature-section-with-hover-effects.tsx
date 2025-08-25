import { cn } from "@/lib/utils";

export function FeaturesSectionWithHoverEffects() {
  const features = [
    {
      title: "Trustworthy results",
      description: "Our stats engine features built-in variance reduction, advanced stats techniques, and more, and has been vetted by thousands of data scientists"
    },
    {
      title: "Advanced testing techniques", 
      description: "Access the widest range of experimentation capabilities. From sequential and switchback tests to multi-armed bandits and CMABs, we have it all"
    },
    {
      title: "Built for scaled experimentation",
      description: "Grow to hundreds of concurrent experiments with tools to manage scale. Coordinate experiments across teams with feature flags and traffic allocation"
    },
    {
      title: "Learn more from your experiments",
      description: "Go beyond experiment results with tools to analyze data, run meta-analyses, and understand your impact on key business metrics"
    }
  ];

  return (
    <div className="py-20 lg:py-32">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-regular tracking-tighter mb-6">
            How We Solve Your Critical Challenges
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Each feature directly addresses a specific pain point, transforming your CRO workflow from manual to automated
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-6xl mx-auto">
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
  index,
}: {
  title: string;
  description: string;
  index: number;
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-semibold text-foreground">
        {title}
      </h3>
      <p className="text-lg text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
};