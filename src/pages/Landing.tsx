import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Features } from "@/components/ui/features-8";

const Landing = () => {
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-50">
        <div className="container max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="text-lg font-semibold text-foreground">
            CRO Intelligence
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => scrollToSection('platform')} 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Platform
            </button>
            <button 
              onClick={() => scrollToSection('features')} 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/auth')}
            >
              Get Started
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-24">
        <div className="container max-w-4xl mx-auto px-8 text-center">
          <h1 className="text-5xl font-bold text-foreground mb-8 leading-[1.1] tracking-tight">
            Context-aware experimentation for enterprise teams
          </h1>
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed max-w-2xl mx-auto">
            Generate high-converting A/B tests using your organizational knowledge. 
            Deploy faster, learn more, iterate with confidence.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">+24.2%</div>
              <div className="text-sm text-muted-foreground">Augmentation du taux de conversion</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">+9%</div>
              <div className="text-sm text-muted-foreground">Croissance des visiteurs récurrents</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">87h</div>
              <div className="text-sm text-muted-foreground">Gagnées par mois</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">8x</div>
              <div className="text-sm text-muted-foreground">ROI</div>
            </div>
          </div>
          
          <Button 
            size="lg" 
            onClick={() => navigate('/auth')}
            className="text-base px-8"
          >
            Request Access
          </Button>
        </div>
      </section>

      {/* Problem */}
      <section className="py-24 border-t border-border">
        <div className="container max-w-5xl mx-auto px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Most A/B tests fail because they lack context
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Generic testing approaches ignore your business specifics, user behavior patterns, 
              and organizational knowledge.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-6">Traditional Testing</h3>
              <div className="space-y-4">
                {[
                  "Generic best practices",
                  "Manual hypothesis creation",
                  "Isolated from business context",
                  "Low success rates",
                  "Slow iteration cycles"
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-1 h-1 bg-muted-foreground rounded-full mt-3 flex-shrink-0"></div>
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-6">Context-Aware Testing</h3>
              <div className="space-y-4">
                {[
                  "Business-specific recommendations",
                  "AI-powered hypothesis generation",
                  "Organizational knowledge integration",
                  "High significance rates",
                  "Rapid experiment cycles"
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-1 h-1 bg-foreground rounded-full mt-3 flex-shrink-0"></div>
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform */}
      <section id="platform" className="py-24 border-t border-border bg-muted/20">
        <div className="container max-w-4xl mx-auto px-8 text-center">

          <div className="bg-background border border-border rounded-lg p-12">
            <div className="w-16 h-16 bg-foreground rounded-lg mx-auto mb-8 flex items-center justify-center">
              <div className="w-6 h-6 bg-background rounded-full"></div>
            </div>
            
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Organizational Memory
            </h3>
            <p className="text-muted-foreground mb-12">
              Continuously learns from your experimentation data, user research, 
              brand guidelines, and business context.
            </p>

            <div className="grid grid-cols-4 gap-8 mb-8">
              {['Data', 'Tests', 'Results', 'Context'].map((label, index) => (
                <div key={index} className="text-center">
                  <div className="w-8 h-8 bg-muted rounded mx-auto mb-2"></div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground uppercase tracking-wider font-medium">
              <span>Test</span>
              <span>→</span>
              <span>Learn</span>
              <span>→</span>
              <span>Improve</span>
              <span>→</span>
              <span>Iterate</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <Features />

      {/* Metrics */}
      <section className="py-24 border-t border-border bg-muted/20">
        <div className="container max-w-4xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Performance metrics
            </h2>
            <p className="text-lg text-muted-foreground">
              Enterprise infrastructure designed for teams running hundreds of experiments per quarter.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "<30s", label: "Analysis Time" },
              { number: "9", label: "Test Variations" },
              { number: "99.9%", label: "Uptime SLA" },
              { number: "15+", label: "Integrations" }
            ].map((metric, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-foreground mb-2">{metric.number}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-border">
        <div className="container max-w-3xl mx-auto px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Ready to start testing smarter?
          </h2>
          <p className="text-lg text-muted-foreground mb-12">
            Join enterprise teams using context-aware experimentation to build products that perform.
          </p>
          
          <div className="flex justify-center gap-8 mb-12">
            {[
              "Early Access",
              "50% Discount",
              "Setup Training",
              "Priority Support"
            ].map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-2 h-2 bg-foreground rounded-full mx-auto mb-2"></div>
                <span className="text-sm text-muted-foreground">{benefit}</span>
              </div>
            ))}
          </div>
          
          <Button 
            size="lg" 
            onClick={() => navigate('/auth')}
            className="text-base px-8"
          >
            Request Access
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Landing;