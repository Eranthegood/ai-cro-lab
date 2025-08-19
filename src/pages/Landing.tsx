import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Upload, Code2, Zap, ArrowRight, Play, Star } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if user is logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-7 w-7 bg-foreground rounded-full flex items-center justify-center">
              <Zap className="h-4 w-4 text-background" />
            </div>
            <span className="text-xl font-bold text-foreground">CRO Intelligence</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-foreground hover:text-muted-foreground transition-colors">Features</a>
            <a href="#examples" className="text-foreground hover:text-muted-foreground transition-colors">Examples</a>
            <a href="#case-study" className="text-foreground hover:text-muted-foreground transition-colors">Case Study</a>
          </nav>

          <div className="flex items-center space-x-3">
            <Button variant="ghost" className="text-foreground hover:text-muted-foreground" asChild>
              <Link to="/auth">Log in</Link>
            </Button>
            <Button className="rounded-full px-6" asChild>
              <Link to="/dashboard">Sign up →</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-8 leading-tight tracking-tight">
            Transform Contentsquare Data Into{" "}
            <br className="hidden md:block" />
            Ready-to-Deploy{" "}
            <br className="hidden md:block" />
            A/B Test Code.
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Access thousands of <strong className="text-foreground">validated, real-world problems</strong> from online communities, with{" "}
            <strong className="text-foreground">actionable solutions</strong> ready for implementation.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" className="text-lg px-8 py-4 rounded-full font-semibold" asChild>
              <Link to="/dashboard">
                Discover Proven Problems →
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 rounded-full border-foreground text-foreground hover:bg-foreground hover:text-background">
              Book a Call →
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Link to="/examples" className="text-foreground hover:text-muted-foreground underline underline-offset-4">
              See Examples →
            </Link>
            <Link to="/case-study" className="text-foreground hover:text-muted-foreground underline underline-offset-4">
              View Success Stories →
            </Link>
          </div>

          {/* Social Proof */}
          <div className="flex flex-col items-center space-y-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-muted border-2 border-background overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-foreground to-muted"></div>
                </div>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-foreground text-foreground" />
                ))}
              </div>
              <span className="text-foreground font-medium">147+ entrepreneurs finding proven problems</span>
            </div>
          </div>

          {/* Platform Logos */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-16 opacity-60">
            <div className="text-2xl font-bold text-muted-foreground">Reddit</div>
            <div className="text-2xl font-bold text-muted-foreground">G2</div>
            <div className="text-2xl font-bold text-muted-foreground">Upwork</div>
            <div className="text-2xl font-bold text-muted-foreground">App Store</div>
            <div className="text-2xl font-bold text-muted-foreground">Google Play</div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section id="features" className="py-24 bg-muted/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Platform Features</h2>
            <p className="text-xl text-muted-foreground">Everything You Need to Build Better Products</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-8 text-center border-0 shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-foreground rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <Upload className="w-8 h-8 text-background" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-foreground">Validated Problem Database</h3>
              <p className="text-muted-foreground leading-relaxed">
                Access thousands of real problems sourced from Reddit, G2, app reviews, and customer feedback across industries.
              </p>
            </Card>

            <Card className="p-8 text-center border-0 shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-foreground rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <Zap className="w-8 h-8 text-background" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-foreground">AI-Powered Insights</h3>
              <p className="text-muted-foreground leading-relaxed">
                Get detailed analysis of each problem including market size, competition level, and implementation difficulty.
              </p>
            </Card>

            <Card className="p-8 text-center border-0 shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-foreground rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <Code2 className="w-8 h-8 text-background" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-foreground">Actionable Solutions</h3>
              <p className="text-muted-foreground leading-relaxed">
                Each problem comes with suggested solutions, tech stack recommendations, and go-to-market strategies.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="h-6 w-6 bg-primary rounded flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">CRO Intelligence</span>
          </div>
          <p className="text-muted-foreground">
            Transform your CRO process with AI-powered insights and code generation.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;