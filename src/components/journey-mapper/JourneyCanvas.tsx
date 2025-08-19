import { useRef, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { ZoomIn, ZoomOut, RotateCcw, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JourneyStep as JourneyStepComponent } from "./JourneyStep";
import { JourneyConnection } from "./JourneyConnection";
import { JourneyStep, JourneyConnection as Connection } from "../../pages/JourneyMapper";
import { cn } from "@/lib/utils";

interface JourneyCanvasProps {
  steps: JourneyStep[];
  connections: Connection[];
  zoom: number;
  offset: { x: number; y: number };
  onStepSelect: (step: JourneyStep) => void;
  onStepUpdate: (stepId: string, updates: Partial<JourneyStep>) => void;
  onStepDelete: (stepId: string) => void;
  onZoomChange: (zoom: number) => void;
  onOffsetChange: (offset: { x: number; y: number }) => void;
  onAddConnection: (sourceId: string, targetId: string) => void;
}

export const JourneyCanvas = ({
  steps,
  connections,
  zoom,
  offset,
  onStepSelect,
  onStepUpdate,
  onStepDelete,
  onZoomChange,
  onOffsetChange,
  onAddConnection
}: JourneyCanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);

  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas'
  });

  const handleZoomIn = () => {
    onZoomChange(Math.min(zoom * 1.2, 3));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(zoom * 0.8, 0.3));
  };

  const handleResetView = () => {
    onZoomChange(1);
    onOffsetChange({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as Node;
    if (canvasRef.current && canvasRef.current.contains(target)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      onOffsetChange({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleStepMove = (stepId: string, newPosition: { x: number; y: number }) => {
    onStepUpdate(stepId, { position: newPosition });
  };

  const handleConnectionStart = (stepId: string) => {
    if (connectingFrom && connectingFrom !== stepId) {
      onAddConnection(connectingFrom, stepId);
      setConnectingFrom(null);
    } else {
      setConnectingFrom(stepId);
    }
  };

  const gridSize = 20;
  const gridPattern = `
    <defs>
      <pattern id="grid" width="${gridSize}" height="${gridSize}" patternUnits="userSpaceOnUse">
        <path d="M ${gridSize} 0 L 0 0 0 ${gridSize}" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.3"/>
      </pattern>
    </defs>
  `;

  return (
    <div className="flex-1 flex flex-col bg-muted/10">
      {/* Canvas Toolbar */}
      <div className="flex items-center justify-between p-4 bg-background border-b border-border">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleResetView}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Move className="h-4 w-4" />
          <span>Drag to pan • Drop components here</span>
        </div>

        <div className="text-sm text-muted-foreground">
          Steps: {steps.length} • Connections: {connections.length}
        </div>
      </div>

      {/* Canvas Area */}
      <div 
        ref={setNodeRef}
        className={cn(
          "flex-1 relative overflow-hidden cursor-move",
          isOver && "bg-primary/5",
          isPanning && "cursor-grabbing"
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          ref={canvasRef}
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            width: '200%',
            height: '200%',
            position: 'relative'
          }}
        >
          {/* Grid Background */}
          <svg 
            className="absolute inset-0 w-full h-full text-muted-foreground/20 pointer-events-none"
            style={{ width: '100%', height: '100%' }}
          >
            <defs>
              <pattern 
                id="grid" 
                width={gridSize * zoom} 
                height={gridSize * zoom} 
                patternUnits="userSpaceOnUse"
              >
                <path 
                  d={`M ${gridSize * zoom} 0 L 0 0 0 ${gridSize * zoom}`} 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="0.5" 
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {connections.map(connection => {
              const sourceStep = steps.find(s => s.id === connection.source);
              const targetStep = steps.find(s => s.id === connection.target);
              
              if (!sourceStep || !targetStep) return null;
              
              return (
                <JourneyConnection
                  key={connection.id}
                  connection={connection}
                  sourcePosition={sourceStep.position}
                  targetPosition={targetStep.position}
                />
              );
            })}
          </svg>

          {/* Steps */}
          {steps.map(step => (
            <JourneyStepComponent
              key={step.id}
              step={step}
              isConnecting={connectingFrom === step.id}
              onClick={() => onStepSelect(step)}
              onMove={handleStepMove}
              onDelete={() => onStepDelete(step.id)}
              onConnectionStart={() => handleConnectionStart(step.id)}
            />
          ))}

          {/* Connection Helper */}
          {connectingFrom && (
            <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm font-medium shadow-lg animate-pulse">
              Click another step to create connection
            </div>
          )}

          {/* Empty State */}
          {steps.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-muted-foreground max-w-md">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-medium mb-2">Start Building Your Journey</h3>
                <p className="text-sm">
                  Drag components from the sidebar to map your customer journey. 
                  Connect steps to visualize the flow and analyze conversion rates.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};