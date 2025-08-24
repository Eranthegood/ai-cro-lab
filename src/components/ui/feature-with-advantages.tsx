import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function Feature() {
  return (
    <div className="w-full py-20 lg:py-40">
      <div className="container mx-auto">
        <div className="flex gap-4 py-20 lg:py-40 flex-col items-start">
          <div>
            <Badge>Solution</Badge>
          </div>
          <div className="flex gap-2 flex-col">
            <h2 className="text-3xl md:text-5xl tracking-tighter lg:max-w-xl font-regular">
              From Pain Points to Power
            </h2>
            <p className="text-lg max-w-xl lg:max-w-xl leading-relaxed tracking-tight text-muted-foreground">
              Transform every A/B testing challenge into a competitive advantage with intelligent automation.
            </p>
          </div>
          <div className="flex gap-10 pt-12 flex-col w-full">
            <div className="grid grid-cols-2 items-start lg:grid-cols-3 gap-10">
              <div className="flex flex-row gap-6 w-full items-start">
                <Check className="w-4 h-4 mt-2 text-primary" />
                <div className="flex flex-col gap-1">
                  <p>Action Over Analysis</p>
                  <p className="text-muted-foreground text-sm">
                    AI processes your data 24/7, so you spend 80% of time testing and 20% validating insights.
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-6 items-start">
                <Check className="w-4 h-4 mt-2 text-primary" />
                <div className="flex flex-col gap-1">
                  <p>Unified Decision Hub</p>
                  <p className="text-muted-foreground text-sm">
                    One platform connecting insights → hypotheses → tests → results. No more scattered tools.
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-6 items-start">
                <Check className="w-4 h-4 mt-2 text-primary" />
                <div className="flex flex-col gap-1">
                  <p>Launch Velocity Engine</p>
                  <p className="text-muted-foreground text-sm">
                    From insight to live test in 2 hours, not 2-3 weeks. Automated workflows accelerate everything.
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-6 w-full items-start">
                <Check className="w-4 h-4 mt-2 text-primary" />
                <div className="flex flex-col gap-1">
                  <p>Compound Learning System</p>
                  <p className="text-muted-foreground text-sm">
                    Every test strengthens the next. Historical data + user research = smarter hypotheses over time.
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-6 items-start">
                <Check className="w-4 h-4 mt-2 text-primary" />
                <div className="flex flex-col gap-1">
                  <p>ROI-Driven Prioritization</p>
                  <p className="text-muted-foreground text-sm">
                    AI predicts test impact and prioritizes by ROI potential. Clear pipeline justifies every resource.
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-6 items-start">
                <Check className="w-4 h-4 mt-2 text-primary" />
                <div className="flex flex-col gap-1">
                  <p>Scale Without Limits</p>
                  <p className="text-muted-foreground text-sm">
                    From 2-3 tests/month to 12+ tests/month. Automation scales with your ambitions, not your headcount.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Feature };