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
// import { LaunchDarklyProvider } from "@/context/LaunchDarklyProvider"; // Disabled temporarily
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import DataAnalysis from "./pages/DataAnalysis";
import CodeGenerator from "./pages/CodeGenerator";
import KnowledgeBase from "./pages/KnowledgeBase";
import KnowledgeVaultConfig from "./pages/KnowledgeVaultConfig";
import AIInsights from "./pages/AIInsights";
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
            <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <NotificationProvider>
                    <Dashboard />
                  </NotificationProvider>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/analysis" element={
                <ProtectedRoute>
                  <NotificationProvider>
                    <DataAnalysis />
                  </NotificationProvider>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/generator" element={
                <ProtectedRoute>
                  <NotificationProvider>
                    <CodeGenerator />
                  </NotificationProvider>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/knowledge" element={
                <ProtectedRoute>
                  <NotificationProvider>
                    <KnowledgeBase />
                  </NotificationProvider>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/knowledge/config" element={
                <ProtectedRoute>
                  <NotificationProvider>
                    <KnowledgeVaultConfig />
                  </NotificationProvider>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/knowledge/journey-mapper" element={
                <ProtectedRoute>
                  <NotificationProvider>
                    <JourneyMapper />
                  </NotificationProvider>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/analytics" element={
                <ProtectedRoute>
                  <NotificationProvider>
                    <Analytics />
                  </NotificationProvider>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/insights" element={
                <ProtectedRoute>
                  <NotificationProvider>
                    <AIInsights />
                  </NotificationProvider>
                </ProtectedRoute>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          </TooltipProvider>
        </ProjectsProvider>
      </WorkspaceProvider>
    </AuthProvider>
    {/* </LaunchDarklyProvider> */}
  </QueryClientProvider>
);

export default App;
