import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Smartphone, 
  Monitor, 
  Copy, 
  Download, 
  Play, 
  Undo, 
  Redo,
  Wand2,
  Eye,
  Code2,
  Settings,
  Check,
  RefreshCw
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CodeGenerator = () => {
  const [selectedFramework, setSelectedFramework] = useState("react");
  const [selectedDevice, setSelectedDevice] = useState("desktop");
  const [vibeCommand, setVibeCommand] = useState("");
  const [showCode, setShowCode] = useState(true);

  const frameworks = [
    { id: "react", name: "React", icon: "⚛️" },
    { id: "vue", name: "Vue.js", icon: "💚" },
    { id: "html", name: "HTML/CSS", icon: "🌐" }
  ];

  const quickActions = [
    "Make it bigger", "Add more spacing", "Make it bold", 
    "Center align", "Use primary color", "Add shadow"
  ];

  const recentCommands = [
    "Make CTA more prominent",
    "Add social proof section",
    "Increase button contrast"
  ];

  const mockCode = `import React from 'react';
import { Button } from '@/components/ui/button';

export const CheckoutButton = () => {
  return (
    <div className="flex flex-col items-center space-y-4 p-6">
      {/* Enhanced CTA Button */}
      <Button 
        size="lg"
        className="w-full max-w-md h-14 text-lg font-semibold bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
      >
        Complete Purchase
      </Button>
      
      {/* Trust Indicators */}
      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
        <div className="flex items-center space-x-1">
          <Shield className="w-4 h-4" />
          <span>Secure Payment</span>
        </div>
        <div className="flex items-center space-x-1">
          <Truck className="w-4 h-4" />
          <span>Free Shipping</span>
        </div>
      </div>
    </div>
  );
};`;

  const handleVibeCommand = () => {
    if (vibeCommand.trim()) {
      // Simulate processing
      setVibeCommand("");
    }
  };

  const handleQuickAction = (action: string) => {
    setVibeCommand(action);
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="border-b border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Code Generator</h1>
            <p className="text-muted-foreground mt-1">
              Transform insights into production-ready code with AI assistance.
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Undo className="w-4 h-4 mr-1" />
                Undo
              </Button>
              <Button variant="outline" size="sm">
                <Redo className="w-4 h-4 mr-1" />
                Redo
              </Button>
            </div>
            <Button>
              <Play className="w-4 h-4 mr-2" />
              Deploy Guide
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Split Screen */}
      <div className="flex-1 flex">
        {/* Left Panel - Vibe Coding */}
        <div className="w-1/3 border-r border-border p-6 bg-card">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center">
                <Wand2 className="w-5 h-5 mr-2 text-primary" />
                Vibe Coding
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Tell AI what to change in natural language
              </p>
              
              <div className="space-y-3">
                <Textarea
                  placeholder="Make the button bigger and more prominent"
                  value={vibeCommand}
                  onChange={(e) => setVibeCommand(e.target.value)}
                  className="min-h-[100px]"
                />
                
                <div className="flex space-x-2">
                  <Button onClick={handleVibeCommand} className="flex-1">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Apply Changes
                  </Button>
                  <Button variant="outline" onClick={() => setVibeCommand("")}>
                    Reset
                  </Button>
                </div>
              </div>
            </div>

            {/* Suggestions */}
            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">💡 Try these prompts:</h3>
              <div className="space-y-2 text-sm">
                <div className="p-2 rounded border border-border hover:bg-muted/50 cursor-pointer">
                  "Make the button green instead of blue"
                </div>
                <div className="p-2 rounded border border-border hover:bg-muted/50 cursor-pointer">
                  "Add more spacing around the text"
                </div>
                <div className="p-2 rounded border border-border hover:bg-muted/50 cursor-pointer">
                  "Make it look more premium"
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">Quick Actions:</h3>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action) => (
                  <Button
                    key={action}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleQuickAction(action)}
                  >
                    {action}
                  </Button>
                ))}
              </div>
            </div>

            {/* Recent Commands */}
            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">Recent Commands:</h3>
              <div className="space-y-1">
                {recentCommands.map((command, index) => (
                  <div 
                    key={index}
                    className="text-sm p-2 rounded hover:bg-muted/50 cursor-pointer flex items-center justify-between"
                  >
                    <span>• {command}</span>
                    <span className="text-xs text-muted-foreground">2 min ago</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel - Live Preview */}
        <div className="w-1/3 border-r border-border flex flex-col">
          <div className="border-b border-border p-4 bg-card">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Live Preview
              </h2>
              
              <div className="flex items-center space-x-2">
                <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desktop">
                      <div className="flex items-center space-x-2">
                        <Monitor className="w-4 h-4" />
                        <span>Desktop</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="mobile">
                      <div className="flex items-center space-x-2">
                        <Smartphone className="w-4 h-4" />
                        <span>Mobile</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={selectedFramework} onValueChange={setSelectedFramework}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {frameworks.map(framework => (
                      <SelectItem key={framework.id} value={framework.id}>
                        <span>{framework.icon} {framework.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex-1 p-6 bg-muted/20">
            <div className={`mx-auto bg-card rounded-lg border border-border p-8 ${
              selectedDevice === 'mobile' ? 'max-w-sm' : 'max-w-lg'
            }`}>
              {/* Mock Preview */}
              <div className="space-y-6 text-center">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Complete Your Purchase</h3>
                  <p className="text-muted-foreground text-sm">You're one step away from your order</p>
                </div>
                
                <div className="space-y-4">
                  <Button 
                    size="lg"
                    className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Complete Purchase
                  </Button>
                  
                  <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-4 bg-success rounded-full"></div>
                      <span>Secure Payment</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-4 bg-primary rounded-full"></div>
                      <span>Free Shipping</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Generated Code */}
        <div className="w-1/3 flex flex-col">
          <div className="border-b border-border p-4 bg-card">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center">
                <Code2 className="w-5 h-5 mr-2" />
                Generated Code
              </h2>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Copy className="w-4 h-4 mr-1" />
                  Copy All
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-4 mt-3 text-sm">
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Check className="w-3 h-3" />
                <span>Accessible</span>
              </Badge>
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Check className="w-3 h-3" />
                <span>Responsive</span>
              </Badge>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <pre className="h-full overflow-auto p-4 text-sm bg-muted/20 font-mono">
              <code>{mockCode}</code>
            </pre>
          </div>

          {/* Bottom Controls */}
          <div className="border-t border-border p-4 bg-card">
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  Version History
                </Button>
                <Button variant="outline" size="sm">
                  Team Comments
                </Button>
              </div>
              <Button variant="outline" size="sm">
                Deploy Options
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CodeGenerator;