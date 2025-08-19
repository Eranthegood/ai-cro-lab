import { useState } from "react";
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay } from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ComponentLibrary } from "@/components/journey-mapper/ComponentLibrary";
import { JourneyCanvas } from "@/components/journey-mapper/JourneyCanvas";
import { AnalyticsPanel } from "@/components/journey-mapper/AnalyticsPanel";
import { ConfigModal } from "@/components/journey-mapper/ConfigModal";
import { toast } from "sonner";

export interface JourneyStep {
  id: string;
  type: string;
  title: string;
  category: string;
  position: { x: number; y: number };
  data: {
    conversionRate?: number;
    averageTime?: string;
    trafficVolume?: number;
    pages?: string[];
    dataSources?: string[];
    insights?: string;
  };
}

export interface JourneyConnection {
  id: string;
  source: string;
  target: string;
  percentage: number;
}

export const JourneyMapper = () => {
  const [steps, setSteps] = useState<JourneyStep[]>([]);
  const [connections, setConnections] = useState<JourneyConnection[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedStep, setSelectedStep] = useState<JourneyStep | null>(null);
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && over.id === 'canvas') {
      const overRect = over.rect;
      const activeRect = event.active.rect?.current?.translated || event.active.rect?.current?.initial;
      if (overRect && activeRect) {
        const dropCenterX = activeRect.left + activeRect.width / 2;
        const dropCenterY = activeRect.top + activeRect.height / 2;
        const localX = dropCenterX - overRect.left;
        const localY = dropCenterY - overRect.top;

        const newStep: JourneyStep = {
          id: `step-${Date.now()}`,
          type: active.data.current?.type || 'custom',
          title: active.data.current?.title || 'New Step',
          category: active.data.current?.category || 'custom',
          position: {
            x: localX / canvasZoom - canvasOffset.x,
            y: localY / canvasZoom - canvasOffset.y
          },
          data: {
            conversionRate: Math.floor(Math.random() * 40) + 40, // 40-80%
            averageTime: `${Math.floor(Math.random() * 5) + 1}m ${Math.floor(Math.random() * 60)}s`,
            trafficVolume: Math.floor(Math.random() * 10000) + 1000,
            pages: [],
            dataSources: [],
            insights: ""
          }
        };
        
        setSteps(prev => [...prev, newStep]);
        toast.success(`Added ${newStep.title} to journey`);
      }
    }
    
    setActiveId(null);
  };

  const updateStep = (stepId: string, updates: Partial<JourneyStep>) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
  };

  const deleteStep = (stepId: string) => {
    setSteps(prev => prev.filter(step => step.id !== stepId));
    setConnections(prev => prev.filter(conn => 
      conn.source !== stepId && conn.target !== stepId
    ));
    toast.success("Step removed from journey");
  };

  const addConnection = (sourceId: string, targetId: string) => {
    const newConnection: JourneyConnection = {
      id: `conn-${Date.now()}`,
      source: sourceId,
      target: targetId,
      percentage: Math.floor(Math.random() * 30) + 50 // 50-80%
    };
    setConnections(prev => [...prev, newConnection]);
  };

  const journeyHealth = steps.length > 0 ? Math.floor(
    steps.reduce((acc, step) => acc + (step.data.conversionRate || 0), 0) / steps.length
  ) : 0;

  return (
    <DashboardLayout>
      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToWindowEdges]}
      >
        <div className="h-full flex flex-col bg-gradient-to-br from-background to-muted/20">
          {/* Header */}
          <div className="flex-none p-6 border-b border-border bg-background/80 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                  🗺️ Interactive Customer Journey Mapper
                </h1>
                <p className="text-muted-foreground mt-2">
                  Map your customer flow and connect real data for AI insights
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  Journey Health: <span className={`font-semibold ${journeyHealth >= 70 ? 'text-green-500' : journeyHealth >= 50 ? 'text-orange-500' : 'text-red-500'}`}>
                    {journeyHealth}%
                  </span>
                </div>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                  Export Journey
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Component Library - Left Sidebar */}
            <ComponentLibrary />
            
            {/* Journey Canvas - Main Area */}
            <JourneyCanvas
              steps={steps}
              connections={connections}
              zoom={canvasZoom}
              offset={canvasOffset}
              onStepSelect={setSelectedStep}
              onStepUpdate={updateStep}
              onStepDelete={deleteStep}
              onZoomChange={setCanvasZoom}
              onOffsetChange={setCanvasOffset}
              onAddConnection={addConnection}
            />
          </div>

          {/* Analytics Panel - Bottom */}
          <AnalyticsPanel steps={steps} connections={connections} />

          {/* Config Modal */}
          {selectedStep && (
            <ConfigModal
              step={selectedStep}
              onUpdate={(updates) => {
                updateStep(selectedStep.id, updates);
                setSelectedStep(null);
              }}
              onClose={() => setSelectedStep(null)}
            />
          )}

          {/* Drag Overlay */}
          <DragOverlay>
            {activeId ? (
              <div className="bg-background border-2 border-primary rounded-lg p-4 shadow-lg opacity-90">
                <div className="text-sm font-medium">Dragging component...</div>
              </div>
            ) : null}
          </DragOverlay>
        </div>
      </DndContext>
    </DashboardLayout>
  );
};