import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { 
  MoreVertical, 
  Trash2, 
  Settings, 
  Link,
  TrendingUp,
  Clock,
  Users,
  Eye,
  Plus,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { JourneyStep as StepType } from "../../pages/JourneyMapper";
import { cn } from "@/lib/utils";

interface JourneyStepProps {
  step: StepType;
  isConnecting?: boolean;
  onClick: () => void;
  onMove: (stepId: string, position: { x: number; y: number }) => void;
  onDelete: () => void;
  onConnectionStart: () => void;
}

const categoryColors = {
  awareness: "from-purple-500 to-pink-500",
  discovery: "from-blue-500 to-cyan-500",
  research: "from-green-500 to-teal-500",
  consideration: "from-orange-500 to-red-500",
  intent: "from-indigo-500 to-purple-500",
  action: "from-emerald-500 to-green-500",
  conversion: "from-amber-500 to-orange-500",
  onboarding: "from-rose-500 to-pink-500",
  retention: "from-violet-500 to-purple-500",
  advocacy: "from-cyan-500 to-blue-500",
  custom: "from-slate-500 to-slate-600"
};

export const JourneyStep = ({
  step,
  isConnecting,
  onClick,
  onMove,
  onDelete,
  onConnectionStart
}: JourneyStepProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: step.id,
    data: step
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDragging && transform) {
      onMove(step.id, {
        x: step.position.x + transform.x,
        y: step.position.y + transform.y
      });
    }
    setIsDragging(false);
  };

  const conversionColor = (rate?: number) => {
    if (!rate) return "text-muted-foreground";
    if (rate >= 70) return "text-green-500";
    if (rate >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const categoryColor = categoryColors[step.category as keyof typeof categoryColors] || categoryColors.custom;

  return (
    <Card
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "absolute w-72 cursor-move transition-all duration-200 hover:shadow-lg",
        isConnecting && "ring-2 ring-primary ring-opacity-50 shadow-lg",
        isDragging && "scale-105 shadow-xl rotate-1"
      )}
      style={{
        left: step.position.x,
        top: step.position.y,
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {/* Header with gradient */}
      <CardHeader className={cn("pb-3 bg-gradient-to-r text-white", categoryColor)}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-sm">{step.title}</h3>
            <p className="text-xs opacity-90 capitalize">{step.category} Stage</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-white/20"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}>
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onConnectionStart();
              }}>
                <Link className="h-4 w-4 mr-2" />
                Connect
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }} 
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className={cn("text-lg font-bold", conversionColor(step.data.conversionRate))}>
                {step.data.conversionRate || 0}%
              </div>
              <div className="text-xs text-muted-foreground">Conversion</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-lg font-bold text-foreground">
                {step.data.averageTime || "N/A"}
              </div>
              <div className="text-xs text-muted-foreground">Avg Time</div>
            </div>
          </div>
        </div>

        {/* Traffic Volume */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Traffic:</span>
          </div>
          <Badge variant="secondary">
            {step.data.trafficVolume?.toLocaleString() || 0}/month
          </Badge>
        </div>

        {/* Data Sources */}
        {step.data.dataSources && step.data.dataSources.length > 0 && (
          <div>
            <div className="text-xs text-muted-foreground mb-2">Data Sources:</div>
            <div className="flex flex-wrap gap-1">
              {step.data.dataSources.map((source, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {source}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* AI Insights */}
        {step.data.insights && (
          <div className="bg-muted/50 p-2 rounded text-xs">
            <div className="flex items-center gap-1 mb-1">
              <Eye className="h-3 w-3" />
              <span className="font-medium">AI Insight:</span>
            </div>
            <p className="text-muted-foreground">{step.data.insights}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-xs" 
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Settings className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-xs"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            Data
          </Button>
        </div>
      </CardContent>

      {/* Connection Handles */}
      {!isDragging && (
        <>
          {/* Input Handle (Left) */}
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-primary border-2 border-background rounded-full cursor-pointer hover:scale-125 transition-transform z-10 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              onConnectionStart();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            title="Connect from another step"
          >
            <div className="w-2 h-2 bg-background rounded-full"></div>
          </div>
          
          {/* Output Handle (Right) */}
          <div 
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-primary border-2 border-background rounded-full cursor-pointer hover:scale-125 transition-transform z-10 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              onConnectionStart();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            title="Connect to another step"
          >
            <ArrowRight className="w-2 h-2 text-background" />
          </div>
        </>
      )}

      {/* Connection Mode Indicator */}
      {isConnecting && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full animate-pulse">
          Click to connect
        </div>
      )}
    </Card>
  );
};