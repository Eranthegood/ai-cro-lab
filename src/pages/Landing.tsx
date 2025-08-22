import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const stats = [
    { number: "80%", label: "Tests reach significance" },
    { number: "3x", label: "Faster deployment" },  
    { number: "97%", label: "Analysis time saved" }
  ];

  const features = [
    {
      icon: "🔌",
      title: "Universal Data Integration",
      description: "Connect any data source: analytics platforms, user research, CSV exports, behavioral data, and competitive intelligence. Real-time API connections supported."
    },
    {
      icon: "🎯", 
      title: "Context-Aware Generation",
      description: "Generate 9 statistically-significant test variations per analysis, each grounded in behavioral psychology and your specific organizational context."
    },
    {
      icon: "⚡",
      title: "One-Click Deployment", 
      description: "Deploy to any platform: Shopify, Webflow, custom CMS, or AB testing tools (Optimizely, VWO, AB Tasty). Lightweight SDK included."
    },
    {
      icon: "📋",
      title: "Automated Documentation",
      description: "Auto-generate test documentation with hypothesis, psychological levers, sample size calculations. Integrate with Linear, Jira, and project management tools."
    },
    {
      icon: "🔄",
      title: "Continuous Learning", 
      description: "Each test result enriches your Vault, improving future recommendations. Build institutional knowledge that persists across team changes."
    },
    {
      icon: "🛡️",
      title: "Enterprise Security",
      description: "SOC 2 Type II compliance, GDPR-ready data handling, on-premise deployment options. Role-based access controls and audit logging."
    }
  ];

  const metrics = [
    { number: "<30s", label: "Analysis Time", description: "From data upload to test recommendations" },
    { number: "9", label: "Test Variations", description: "Contextual experiments per analysis" },
    { number: "99.9%", label: "Uptime SLA", description: "Enterprise reliability guarantee" },
    { number: "15+", label: "Integrations", description: "Analytics and deployment platforms" }
  ];

  const integrations = [
    "ContentSquare", "Google Analytics", "Amplitude", "Mixpanel", 
    "Optimizely", "VWO", "AB Tasty", "Convert", 
    "Shopify", "Webflow", "WordPress", "Magento",
    "Linear", "Jira", "Notion", "Slack"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/98 backdrop-blur-sm border-b border-border">
        <nav className="container max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold text-foreground tracking-tight">
              CRO Intelligence
            </div>
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('platform')} className="text-muted-foreground hover:text-foreground font-medium transition-colors">
                Platform
              </button>
              <button onClick={() => scrollToSection('vault')} className="text-muted-foreground hover:text-foreground font-medium transition-colors">
                Intelligence Engine
              </button>
              <button onClick={() => scrollToSection('waitlist')} className="text-muted-foreground hover:text-foreground font-medium transition-colors">
                Early Access
              </button>
              <Button onClick={() => navigate('/auth')} variant="default" size="sm">
                Get Started
              </Button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-muted/50 to-background">
        <div className="container max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 tracking-tight leading-tight max-w-4xl mx-auto">
            Build products that perform
          </h1>
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed">
            Ship experiments with confidence, powered by context. The only experimentation 
            platform that learns your business to generate tests that actually win.
          </p>
          <p className="text-lg text-foreground mb-8 max-w-xl mx-auto font-medium">
            Make better product decisions — with real-time signal, at faster pace.
          </p>
          
          {/* Stats */}
          <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-12 mb-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-foreground mb-1">{stat.number}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
          
          {/* CTA */}
          <div className="space-y-4">
            <Button 
              size="lg" 
              onClick={() => scrollToSection('waitlist')}
              className="px-8 py-6 text-base font-semibold"
            >
              Join Early Access Program
              <span className="ml-2">→</span>
            </Button>
            <p className="text-sm text-muted-foreground">
              500+ teams already on waitlist • Lifetime benefits included
            </p>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-muted/30">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6 tracking-tight">
              Why 80% of AB tests fail to reach significance
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Most experimentation platforms generate generic tests that ignore your business context, 
              breaking the essential cycle: Test, Learn, Improve, Iterate.
            </p>
          </div>

          {/* Process Flow */}
          <div className="flex items-center justify-center gap-4 mb-16 flex-wrap">
            {['Test', 'Learn', 'Improve', 'Iterate'].map((step, index) => (
              <div key={step} className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  <span className="font-medium text-foreground">{step}</span>
                </div>
                {index < 3 && <span className="text-muted-foreground text-xl">→</span>}
              </div>
            ))}
          </div>
          
          {/* Comparison Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-destructive bg-destructive/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-destructive">
                  <span>❌</span>
                  Traditional AB Testing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    "Generic best practice recommendations",
                    "No business context integration", 
                    "Manual hypothesis generation",
                    "Disconnected from organizational knowledge",
                    "Low statistical significance rates",
                    "Weeks from insight to live test"
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <span className="text-destructive font-semibold">✗</span>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-success bg-success/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-success">
                  <span>✓</span>
                  Context-Aware Testing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    "Business-specific test recommendations",
                    "Organizational knowledge integration",
                    "AI-powered hypothesis generation", 
                    "Continuous learning from test results",
                    "High statistical significance rates",
                    "Minutes from data to deployed test"
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <span className="text-success font-semibold">✓</span>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Vault Section */}
      <section id="vault" className="py-20 bg-background">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-6 tracking-tight leading-tight">
                The Vault: Your Experimentation Intelligence
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                A persistent knowledge layer that accumulates your organizational learning, 
                brand guidelines, user research, and test results to power increasingly 
                sophisticated experiment recommendations.
              </p>
              
              <ul className="space-y-4">
                {[
                  "Test performance analysis and pattern recognition",
                  "Brand voice and technical constraint awareness",
                  "User behavioral insights and persona mapping", 
                  "Competitive positioning and market context",
                  "Cross-team knowledge sharing and institutional memory",
                  "Powers the complete cycle: Test → Learn → Improve → Iterate"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <span className="text-success text-sm">◆</span>
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <Card className="bg-muted/30 border-border">
                <CardContent className="p-8 text-center">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-success to-success/70 rounded-2xl flex items-center justify-center text-4xl animate-pulse">
                    🧠
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Organizational Memory</h3>
                  <p className="text-muted-foreground mb-6 text-sm">
                    Continuously learning from your experimentation data
                  </p>
                  
                  <div className="flex justify-center gap-4 mb-6">
                    {['📊', '🎨', '👥', '🏆'].map((icon, index) => (
                      <div key={index} className="w-12 h-12 bg-background rounded-lg flex items-center justify-center border border-border">
                        {icon}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 p-4 bg-background/50 rounded-lg">
                    {['Test', 'Learn', 'Improve', 'Iterate'].map((step, index) => (
                      <div key={step} className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{step}</span>
                        {index < 3 && <span className="text-success text-sm font-bold">→</span>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-16 bg-muted/30 border-y border-border">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-8">
              Seamlessly integrates with your existing stack
            </h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {integrations.map((integration, index) => (
              <Card key={index} className="bg-background border-border hover:border-muted-foreground/30 transition-all duration-200 hover:shadow-sm hover:-translate-y-1">
                <CardContent className="p-4 text-center">
                  <div className="text-xs font-medium text-muted-foreground leading-tight">
                    {integration}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section id="platform" className="py-20 bg-background">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6 tracking-tight">
              Built for enterprise experimentation at scale
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Make better product decisions — with real-time signal, at faster pace. 
              Enterprise-grade infrastructure designed for high-velocity product teams.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-border hover:border-muted-foreground/30 transition-all duration-200 hover:shadow-lg hover:-translate-y-2">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center text-2xl mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl text-foreground tracking-tight">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="py-20 bg-muted/30">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6 tracking-tight">
              Performance that scales with your ambition
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Build products that perform with enterprise-grade infrastructure 
              designed for teams running hundreds of experiments per quarter.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {metrics.map((metric, index) => (
              <Card key={index} className="bg-background border-border text-center">
                <CardContent className="p-8">
                  <div className="text-4xl font-bold text-foreground mb-2">{metric.number}</div>
                  <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    {metric.label}
                  </div>
                  <p className="text-xs text-muted-foreground leading-tight">
                    {metric.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="waitlist" className="py-20 bg-background">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6 tracking-tight">
            Ready to build products that perform?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Join 500+ product leaders getting early access to context-aware experimentation. 
            Be among the first to transform your testing velocity.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { icon: "🚀", text: "First Access to Beta" },
              { icon: "💰", text: "50% Lifetime Discount" },
              { icon: "🎯", text: "Free Vault Setup & Training" },
              { icon: "⚡", text: "Priority Support & Onboarding" }
            ].map((benefit, index) => (
              <Badge key={index} variant="secondary" className="p-3 justify-center">
                <span className="mr-2">{benefit.icon}</span>
                {benefit.text}
              </Badge>
            ))}
          </div>
          
          <Button 
            size="lg" 
            onClick={() => navigate('/auth')}
            className="px-8 py-6 text-base font-semibold mb-4"
          >
            Secure Your Early Access Spot
            <span className="ml-2">→</span>
          </Button>
          
          <p className="text-sm text-muted-foreground">
            No spam, only updates when we have something meaningful to share • Limited spots available
          </p>
        </div>
      </section>
    </div>
  );
};

export default Landing;