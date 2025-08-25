import { 
  AlertTriangle, 
  Clock, 
  Zap, 
  Database, 
  TrendingDown, 
  Target,
  Timer,
  DollarSign
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function Feature() {
  const painPoints = [
    {
      severity: "critical",
      icon: <AlertTriangle className="w-5 h-5" />,
      title: "Analysis Paralysis Over Action",
      quote: "We spend 80% of our time analyzing data and only 20% actually testing hypotheses",
      costMetric: "15+ hours/week lost",
      revenueImpact: "€50K+ monthly opportunity cost",
      details: [
        "15+ hours weekly drowning in Contentsquare exports, heatmaps, and user session recordings",
        "Manual cross-referencing between analytics tools creates analysis bottlenecks", 
        "Insights get lost in spreadsheets instead of becoming live tests"
      ]
    },
    {
      severity: "critical",
      icon: <Database className="w-5 h-5" />,
      title: "Fragmented Decision-Making Process",
      quote: "A/B testing drives every business decision, but our process is scattered across 8+ tools",
      costMetric: "8+ disconnected tools",
      revenueImpact: "3-5 days per test cycle",
      details: [
        "No centralized hub connecting insights → hypotheses → tests → results",
        "Research findings, test decks, analysis, and roadmaps live in different systems",
        "Teams work in silos: Analytics finds issues, PM creates hypotheses, Dev builds tests"
      ]
    },
    {
      severity: "high",
      icon: <Timer className="w-5 h-5" />,
      title: "Insight-to-Launch Velocity Crisis",
      quote: "It takes 2-3 weeks to go from 'we found something interesting' to 'test is live'",
      costMetric: "2-3 weeks time-to-test",
      revenueImpact: "70% slower than industry leaders",
      details: [
        "Manual hypothesis creation from raw data insights",
        "Time-consuming test specification and design handoffs",
        "Too much complex feature test, unbalance risk / velocity matrix"
      ]
    },
    {
      severity: "high",
      icon: <TrendingDown className="w-5 h-5" />,
      title: "Data Centralization Challenge", 
      quote: "Our best insights are trapped in isolated tools, preventing compound learning",
      costMetric: "Zero learning compound effect",
      revenueImpact: "Missing 40% optimization opportunities",
      details: [
        "Historical test results don't inform new hypothesis generation",
        "User research insights aren't systematically integrated into test planning",
        "No learning loop: each test starts from scratch instead of building on previous learnings"
      ]
    },
    {
      severity: "medium",
      icon: <DollarSign className="w-5 h-5" />,
      title: "ROI Pressure vs. Professional Process",
      quote: "Leadership demands faster growth, but we lack the systematic process to scale CRO professionally",
      costMetric: "Ad-hoc methodology",
      revenueImpact: "Unpredictable ROI pipeline",
      details: [
        "Ad-hoc testing approach limits velocity and learning",
        "No standardized methodology for hypothesis prioritization", 
        "Difficulty justifying test resource allocation without clear ROI pipeline"
      ]
    },
    {
      severity: "medium",
      icon: <Target className="w-5 h-5" />,
      title: "Scaling Ambitions Require Automation",
      quote: "Our conversion rate goals are ambitious, but manual processes cap our testing velocity",
      costMetric: "2-3 tests/month capacity",
      revenueImpact: "Need 300% velocity increase",
      details: [
        "Current capacity: 2-3 tests/month vs. need for 8-12 tests/month",
        "Team bandwidth stretched thin across analysis, execution, and reporting",
        "Cannot achieve competitive advantage through testing volume with current workflow"
      ]
    }
  ];

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "critical":
        return {
          border: "border-destructive/20",
          background: "bg-destructive/5",
          iconColor: "text-destructive",
          badge: "bg-destructive/10 text-destructive border-destructive/20"
        };
      case "high":
        return {
          border: "border-warning/20", 
          background: "bg-warning/5",
          iconColor: "text-warning",
          badge: "bg-warning/10 text-warning border-warning/20"
        };
      case "medium":
        return {
          border: "border-info/20",
          background: "bg-info/5", 
          iconColor: "text-info",
          badge: "bg-info/10 text-info border-info/20"
        };
      default:
        return {
          border: "border-border",
          background: "bg-card",
          iconColor: "text-muted-foreground",
          badge: "bg-muted text-muted-foreground"
        };
    }
  };

  return (
    <div className="w-full py-20 lg:py-40">
      <div className="container mx-auto">
        <div className="flex gap-4 py-20 lg:py-40 flex-col items-start">
          <div>
            <Badge>Critical Business Challenges</Badge>
          </div>
          <div className="flex gap-2 flex-col">
            <h2 className="text-3xl md:text-5xl tracking-tighter lg:max-w-xl font-regular">
              You need to join this wait list if :
            </h2>
            <p className="text-lg max-w-xl lg:max-w-xl leading-relaxed tracking-tight text-muted-foreground">
              Enterprise teams are losing millions in opportunity costs due to outdated CRO workflows
            </p>
          </div>
          <div className="flex gap-8 pt-12 flex-col w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {painPoints.map((painPoint, index) => {
                const styles = getSeverityStyles(painPoint.severity);
                return (
                  <div 
                    key={index} 
                    className={cn(
                      "group relative p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-elevated hover:-translate-y-1",
                      styles.border,
                      styles.background
                    )}
                  >
                    {/* Severity Badge */}
                    <div className="absolute top-4 right-4">
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs font-medium border", styles.badge)}
                      >
                        {painPoint.severity.toUpperCase()}
                      </Badge>
                    </div>

                    {/* Header with Icon and Title */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className={cn("flex-shrink-0 p-2 rounded-lg bg-background/50", styles.iconColor)}>
                        {painPoint.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-foreground transition-colors">
                          {painPoint.title}
                        </h3>
                        <p className="text-muted-foreground text-sm italic mb-3 leading-relaxed">
                          "{painPoint.quote}"
                        </p>
                      </div>
                    </div>

                    {/* Business Impact Metrics */}
                    <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-background/30 rounded-lg">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Time Lost</div>
                        <div className="font-semibold text-sm">{painPoint.costMetric}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Business Impact</div>
                        <div className="font-semibold text-sm">{painPoint.revenueImpact}</div>
                      </div>
                    </div>

                    {/* Detailed Pain Points */}
                    <div className="space-y-2">
                      {painPoint.details.map((detail, detailIndex) => (
                        <div key={detailIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <div className={cn("w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0", styles.iconColor)} />
                          <span className="leading-relaxed">{detail}</span>
                        </div>
                      ))}
                    </div>

                    {/* Hover Effect Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Feature };