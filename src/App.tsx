import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { WorkspaceProvider } from "@/hooks/useWorkspace";
import { ProjectsProvider } from "@/hooks/useProjects";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { NotificationProvider } from "@/context/NotificationContext";
import { BackgroundTaskPanel } from "@/components/notifications/BackgroundTaskPanel";
import { RandomNotificationWidget } from "@/components/notifications/RandomNotificationWidget";
import { ChatProvider } from "@/context/ChatContext";
// import { LaunchDarklyProvider } from "@/context/LaunchDarklyProvider"; // Disabled temporarily
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import DataAnalysis from "./pages/DataAnalysis";
import CodeGenerator from "./pages/CodeGenerator";
import KnowledgeBase from "./pages/KnowledgeBase";
import KnowledgeVaultConfig from "./pages/KnowledgeVaultConfig";
import SimpleVault from "./pages/SimpleVault";
import AIInsights from "./pages/AIInsights";
import ABTestGenerator from "./pages/ABTestGenerator";
import { JourneyMapper } from "./pages/JourneyMapper";
import Analytics from "./pages/Analytics";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    {/* LaunchDarkly disabled temporarily */}
    {/* <LaunchDarklyProvider> */}
      <AuthProvider>
        <WorkspaceProvider>
          <ProjectsProvider>
            <NotificationProvider>
              <ChatProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <BackgroundTaskPanel />
                    <RandomNotificationWidget maxDelay={60} />
                    <Routes>
                      <Route path="/" element={<Landing />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/dashboard" element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="/dashboard/analysis" element={
                        <ProtectedRoute>
                          <DataAnalysis />
                        </ProtectedRoute>
                      } />
                      <Route path="/dashboard/generator" element={
                        <ProtectedRoute>
                          <CodeGenerator />
                        </ProtectedRoute>
                      } />
                      <Route path="/dashboard/knowledge" element={
                        <ProtectedRoute>
                          <KnowledgeBase />
                        </ProtectedRoute>
                      } />
                      <Route path="/dashboard/knowledge/config" element={
                        <ProtectedRoute>
                          <KnowledgeVaultConfig />
                        </ProtectedRoute>
                      } />
                      <Route path="/vault-simple" element={
                        <ProtectedRoute>
                          <SimpleVault />
                        </ProtectedRoute>
                      } />
                      <Route path="/dashboard/knowledge/journey-mapper" element={
                        <ProtectedRoute>
                          <JourneyMapper />
                        </ProtectedRoute>
                      } />
                      <Route path="/dashboard/analytics" element={
                        <ProtectedRoute>
                          <Analytics />
                        </ProtectedRoute>
                      } />
                      <Route path="/dashboard/insights" element={
                        <ProtectedRoute>
                          <AIInsights />
                        </ProtectedRoute>
                      } />
                      <Route path="/dashboard/ab-testing" element={
                        <ProtectedRoute>
                          <ABTestGenerator />
                        </ProtectedRoute>
                      } />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </TooltipProvider>
              </ChatProvider>
            </NotificationProvider>
          </ProjectsProvider>
        </WorkspaceProvider>
      </AuthProvider>
    {/* </LaunchDarklyProvider> */}
  </QueryClientProvider>
);

export default App;
