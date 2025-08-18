import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Mail, 
  Lock, 
  User, 
  Zap, 
  ArrowRight,
  Github,
  Chrome
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate authentication
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">CRO Intelligence</span>
          </Link>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-muted-foreground">
            {isLogin 
              ? 'Sign in to your CRO Intelligence account' 
              : 'Start optimizing your conversion rates today'
            }
          </p>
        </div>

        {/* Auth Card */}
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {isLogin ? 'Sign In' : 'Sign Up'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Social Auth */}
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline">
                <Github className="mr-2 h-4 w-4" />
                Github
              </Button>
              <Button variant="outline">
                <Chrome className="mr-2 h-4 w-4" />
                Google
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or continue with email</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="name" 
                      type="text" 
                      placeholder="Sarah Chen"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="sarah@techcorp.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {isLogin && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded border border-input" />
                    <span>Remember me</span>
                  </label>
                  <Link to="#" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
              )}

              <Button type="submit" className="w-full" size="lg">
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            {/* Toggle Auth Mode */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </span>
              {" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:underline font-medium"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </div>

            {!isLogin && (
              <p className="text-xs text-muted-foreground text-center">
                By creating an account, you agree to our{" "}
                <Link to="#" className="underline hover:text-primary">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="#" className="underline hover:text-primary">
                  Privacy Policy
                </Link>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Features Preview */}
        <Card className="p-4">
          <div className="text-center space-y-2">
            <h3 className="font-medium">What you get with CRO Intelligence:</h3>
            <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                <span>AI-powered Contentsquare analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                <span>Production-ready A/B test code</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                <span>Universal platform deployment</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Auth;