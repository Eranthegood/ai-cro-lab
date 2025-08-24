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
              You need to join this wait list if :
            </h2>
            <p className="text-lg max-w-xl lg:max-w-xl leading-relaxed tracking-tight text-muted-foreground">
              Enterprise teams are struggling with outdated workflows that slow down innovation
            </p>
          </div>
          <div className="flex gap-10 pt-12 flex-col w-full">
            <div className="grid grid-cols-1 items-start lg:grid-cols-2 gap-10">
              <div className="flex flex-row gap-6 w-full items-start">
                <Check className="w-4 h-4 mt-2 text-primary flex-shrink-0" />
                <div className="flex flex-col gap-1">
                  <p className="font-medium">Analysis Paralysis Over Action</p>
                  <p className="text-muted-foreground text-sm italic mb-2">
                    "We spend 80% of our time analyzing data and only 20% actually testing hypotheses"
                  </p>
                  <ul className="text-muted-foreground text-xs space-y-1">
                    <li>• 15+ hours weekly drowning in Contentsquare exports, heatmaps, and user session recordings</li>
                    <li>• Manual cross-referencing between analytics tools creates analysis bottlenecks</li>
                    <li>• Insights get lost in spreadsheets instead of becoming live tests</li>
                  </ul>
                </div>
              </div>
              <div className="flex flex-row gap-6 items-start">
                <Check className="w-4 h-4 mt-2 text-primary flex-shrink-0" />
                <div className="flex flex-col gap-1">
                  <p className="font-medium">Fragmented Decision-Making Process</p>
                  <p className="text-muted-foreground text-sm italic mb-2">
                    "A/B testing drives every business decision, but our process is scattered across 8+ tools"
                  </p>
                  <ul className="text-muted-foreground text-xs space-y-1">
                    <li>• No centralized hub connecting insights → hypotheses → tests → results</li>
                    <li>• Research findings, test decks, analysis, and roadmaps live in different systems</li>
                    <li>• Teams work in silos: Analytics finds issues, PM creates hypotheses, Dev builds tests</li>
                  </ul>
                </div>
              </div>
              <div className="flex flex-row gap-6 items-start">
                <Check className="w-4 h-4 mt-2 text-primary flex-shrink-0" />
                <div className="flex flex-col gap-1">
                  <p className="font-medium">Insight-to-Launch Velocity Crisis</p>
                  <p className="text-muted-foreground text-sm italic mb-2">
                    "It takes 2-3 weeks to go from 'we found something interesting' to 'test is live'"
                  </p>
                  <ul className="text-muted-foreground text-xs space-y-1">
                    <li>• Manual hypothesis creation from raw data insights</li>
                    <li>• Time-consuming test specification and design handoffs</li>
                    <li>• Too much complex feature test, unbalance risk / velocity matrix</li>
                  </ul>
                </div>
              </div>
              <div className="flex flex-row gap-6 w-full items-start">
                <Check className="w-4 h-4 mt-2 text-primary flex-shrink-0" />
                <div className="flex flex-col gap-1">
                  <p className="font-medium">Data Centralization Challenge</p>
                  <p className="text-muted-foreground text-sm italic mb-2">
                    "Our best insights are trapped in isolated tools, preventing compound learning"
                  </p>
                  <ul className="text-muted-foreground text-xs space-y-1">
                    <li>• Historical test results don't inform new hypothesis generation</li>
                    <li>• User research insights aren't systematically integrated into test planning</li>
                    <li>• No learning loop: each test starts from scratch instead of building on previous learnings</li>
                  </ul>
                </div>
              </div>
              <div className="flex flex-row gap-6 items-start">
                <Check className="w-4 h-4 mt-2 text-primary flex-shrink-0" />
                <div className="flex flex-col gap-1">
                  <p className="font-medium">ROI Pressure vs. Professional Process</p>
                  <p className="text-muted-foreground text-sm italic mb-2">
                    "Leadership demands faster growth, but we lack the systematic process to scale CRO professionally"
                  </p>
                  <ul className="text-muted-foreground text-xs space-y-1">
                    <li>• Ad-hoc testing approach limits velocity and learning</li>
                    <li>• No standardized methodology for hypothesis prioritization</li>
                    <li>• Difficulty justifying test resource allocation without clear ROI pipeline</li>
                  </ul>
                </div>
              </div>
              <div className="flex flex-row gap-6 items-start">
                <Check className="w-4 h-4 mt-2 text-primary flex-shrink-0" />
                <div className="flex flex-col gap-1">
                  <p className="font-medium">Scaling Ambitions Require Automation</p>
                  <p className="text-muted-foreground text-sm italic mb-2">
                    "Our conversion rate goals are ambitious, but manual processes cap our testing velocity"
                  </p>
                  <ul className="text-muted-foreground text-xs space-y-1">
                    <li>• Current capacity: 2-3 tests/month vs. need for 8-12 tests/month</li>
                    <li>• Team bandwidth stretched thin across analysis, execution, and reporting</li>
                    <li>• Cannot achieve competitive advantage through testing volume with current workflow</li>
                  </ul>
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