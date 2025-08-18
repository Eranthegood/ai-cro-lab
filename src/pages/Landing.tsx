import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Upload, Code2, Zap, ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">CRO Intelligence</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/auth">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/dashboard">Start Free Trial</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Transform Contentsquare Data Into 
            <span className="text-primary"> Ready-to-Deploy </span>
            A/B Test Code
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            AI-powered platform that generates production-ready test code for any A/B testing tool. 
            Reduce analysis time from 15 hours to 2 hours per week.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="text-lg px-8 py-3" asChild>
              <Link to="/dashboard">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3">
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          {/* Value Props */}
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-success flex items-center justify-center mt-1">
                <Check className="w-4 h-4 text-success-foreground" />
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Upload & Analyze in 30 Seconds</h3>
                <p className="text-muted-foreground">Upload multiple Contentsquare files (CSV/PDF), get actionable insights instantly</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-success flex items-center justify-center mt-1">
                <Check className="w-4 h-4 text-success-foreground" />
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Production-Ready Code</h3>
                <p className="text-muted-foreground">Generate clean code for React, Vue, or vanilla JavaScript with best practices</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-success flex items-center justify-center mt-1">
                <Check className="w-4 h-4 text-success-foreground" />
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Universal Platform Support</h3>
                <p className="text-muted-foreground">Copy-paste into AB Tasty, Optimizely, VWO, or any testing platform</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-primary rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Upload Your Data</h3>
              <p className="text-muted-foreground">
                Upload Contentsquare files (CSV, PDF, JSON) and your knowledge base (design system, personas, docs)
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-primary rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">2. AI Analysis</h3>
              <p className="text-muted-foreground">
                Our Expert CRO AI analyzes behavioral data and identifies high-impact test opportunities with business context
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-primary rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Code2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Generate & Deploy</h3>
              <p className="text-muted-foreground">
                Get production-ready test code with deployment guides for your preferred A/B testing platform
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