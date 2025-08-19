import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { 
  Home, 
  Eye, 
  Search, 
  Brain, 
  ShoppingCart, 
  CreditCard, 
  CheckCircle, 
  Package, 
  Heart,
  Mail,
  Plus,
  ChevronDown,
  Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const templates = [
  {
    id: "ecommerce",
    title: "🛒 E-commerce Standard",
    description: "Complete shopping funnel",
    conversionRate: "2.4%",
    thumbnail: "🛍️"
  },
  {
    id: "saas",
    title: "💻 SaaS B2B",
    description: "Trial to subscription",
    conversionRate: "15.7%",
    thumbnail: "💼"
  },
  {
    id: "leadgen",
    title: "🏦 Lead Generation",
    description: "Visitor to qualified lead",
    conversionRate: "8.2%",
    thumbnail: "📞"
  },
  {
    id: "mobile",
    title: "📱 Mobile App",
    description: "Download to active user",
    conversionRate: "12.3%",
    thumbnail: "📲"
  }
];

const journeyComponents = [
  {
    category: "Awareness",
    color: "from-purple-500 to-pink-500",
    components: [
      { type: "awareness-social", title: "Social Media", subtitle: "Organic & Paid Social", icon: Home },
      { type: "awareness-ads", title: "Paid Advertising", subtitle: "Google, Facebook Ads", icon: Sparkles },
      { type: "awareness-seo", title: "SEO Organic", subtitle: "Search Engine Results", icon: Search }
    ]
  },
  {
    category: "Discovery",
    color: "from-blue-500 to-cyan-500",
    components: [
      { type: "discovery-landing", title: "Landing Page", subtitle: "First touchpoint", icon: Eye },
      { type: "discovery-homepage", title: "Homepage", subtitle: "Main entry point", icon: Home }
    ]
  },
  {
    category: "Research",
    color: "from-green-500 to-teal-500",
    components: [
      { type: "research-product", title: "Product Pages", subtitle: "Feature exploration", icon: Search },
      { type: "research-compare", title: "Comparison", subtitle: "Feature comparison", icon: Brain }
    ]
  },
  {
    category: "Consideration",
    color: "from-orange-500 to-red-500",
    components: [
      { type: "consideration-reviews", title: "Reviews", subtitle: "Social proof", icon: Heart },
      { type: "consideration-pricing", title: "Pricing", subtitle: "Value assessment", icon: CreditCard }
    ]
  },
  {
    category: "Intent",
    color: "from-indigo-500 to-purple-500",
    components: [
      { type: "intent-cart", title: "Add to Cart", subtitle: "Purchase intent", icon: ShoppingCart },
      { type: "intent-signup", title: "Sign Up", subtitle: "Account creation", icon: Plus }
    ]
  },
  {
    category: "Action",
    color: "from-emerald-500 to-green-500",
    components: [
      { type: "action-checkout", title: "Checkout", subtitle: "Purchase process", icon: CreditCard },
      { type: "action-payment", title: "Payment", subtitle: "Transaction completion", icon: CheckCircle }
    ]
  },
  {
    category: "Conversion",
    color: "from-amber-500 to-orange-500",
    components: [
      { type: "conversion-purchase", title: "Purchase", subtitle: "Transaction success", icon: CheckCircle },
      { type: "conversion-subscribe", title: "Subscribe", subtitle: "Subscription activation", icon: Mail }
    ]
  },
  {
    category: "Onboarding",
    color: "from-rose-500 to-pink-500",
    components: [
      { type: "onboarding-setup", title: "Setup Process", subtitle: "Initial configuration", icon: Package },
      { type: "onboarding-firstuse", title: "First Use", subtitle: "Feature discovery", icon: Sparkles }
    ]
  },
  {
    category: "Retention",
    color: "from-violet-500 to-purple-500",
    components: [
      { type: "retention-email", title: "Email Campaigns", subtitle: "Ongoing engagement", icon: Mail },
      { type: "retention-engagement", title: "Feature Usage", subtitle: "Product stickiness", icon: Heart }
    ]
  },
  {
    category: "Advocacy",
    color: "from-cyan-500 to-blue-500",
    components: [
      { type: "advocacy-reviews", title: "User Reviews", subtitle: "Satisfaction feedback", icon: Heart },
      { type: "advocacy-referrals", title: "Referrals", subtitle: "Word of mouth", icon: Sparkles }
    ]
  }
];

const DraggableComponent = ({ component, color }: { component: any; color: string }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: component.type,
    data: {
      type: component.type,
      title: component.title,
      category: component.category,
      fromLibrary: true,
    }
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "group relative cursor-grab active:cursor-grabbing p-3 rounded-lg border border-border/50 bg-gradient-to-r transition-all duration-200 hover:shadow-md hover:scale-105",
        color,
        isDragging && "opacity-50 scale-95"
      )}
    >
      <div className="flex items-center gap-2 text-white">
        <component.icon className="h-4 w-4 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{component.title}</div>
          <div className="text-xs opacity-90 truncate">{component.subtitle}</div>
        </div>
      </div>
    </div>
  );
};

export const ComponentLibrary = () => {
  const [expandedSections, setExpandedSections] = useState<string[]>(["Awareness", "Discovery"]);

  const toggleSection = (category: string) => {
    setExpandedSections(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="w-80 bg-background border-r border-border flex flex-col">
      {/* Quick Start Templates */}
      <Card className="m-4 mb-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            📋 Quick Start Templates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {templates.map((template) => (
            <Button
              key={template.id}
              variant="outline"
              className="w-full justify-start h-auto p-3"
            >
              <div className="text-left">
                <div className="flex items-center gap-2 font-medium text-sm">
                  <span>{template.thumbnail}</span>
                  {template.title}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {template.description}
                </div>
                <Badge variant="secondary" className="text-xs mt-1">
                  Avg: {template.conversionRate}
                </Badge>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Journey Components */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            🧩 Journey Components
          </h3>
          
          <div className="space-y-3">
            {journeyComponents.map((section) => (
              <div key={section.category}>
                <button
                  onClick={() => toggleSection(section.category)}
                  className="flex items-center justify-between w-full p-2 text-left rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm font-medium">{section.category}</span>
                  <ChevronDown 
                    className={cn(
                      "h-4 w-4 transition-transform",
                      expandedSections.includes(section.category) && "rotate-180"
                    )} 
                  />
                </button>
                
                {expandedSections.includes(section.category) && (
                  <div className="space-y-2 ml-2">
                    {section.components.map((component) => (
                      <DraggableComponent
                        key={component.type}
                        component={component}
                        color={section.color}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Step */}
      <div className="p-4 border-t border-border">
        <DraggableComponent
          component={{
            type: "custom",
            title: "Custom Step",
            subtitle: "Create your own",
            icon: Plus,
            category: "custom"
          }}
          color="from-slate-500 to-slate-600"
        />
      </div>
    </div>
  );
};