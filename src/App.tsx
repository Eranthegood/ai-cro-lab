import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NotificationProvider } from "@/context/NotificationContext";
import { ChatProvider } from "@/context/ChatContext";
import { LaunchDarklyProvider } from "@/context/LaunchDarklyProvider";
import { AuthProvider } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Auth from "@/pages/Auth";
import KnowledgeBase from "@/pages/KnowledgeBase";
import Analytics from "@/pages/Analytics";
import { JourneyMapper } from "@/pages/JourneyMapper";
import ABTestGenerator from "@/pages/ABTestGenerator";
import CodeGenerator from "@/pages/CodeGenerator";
import AIInsights from "@/pages/AIInsights";
import AIInsightsV2 from "@/pages/AIInsightsV2";
import DataAnalysis from "@/pages/DataAnalysis";
import SimpleVault from "@/pages/SimpleVault";
import KnowledgeVaultConfig from "@/pages/KnowledgeVaultConfig";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LaunchDarklyProvider>
        <NotificationProvider>
          <ChatProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Router>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/app" element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/knowledge-base" element={
                    <ProtectedRoute>
                      <KnowledgeBase />
                    </ProtectedRoute>
                  } />
                  <Route path="/analytics" element={
                    <ProtectedRoute>
                      <Analytics />
                    </ProtectedRoute>
                  } />
                  <Route path="/journey-mapper" element={
                    <ProtectedRoute>
                      <JourneyMapper />
                    </ProtectedRoute>
                  } />
                  <Route path="/ab-test-generator" element={
                    <ProtectedRoute>
                      <ABTestGenerator />
                    </ProtectedRoute>
                  } />
                  <Route path="/code-generator" element={
                    <ProtectedRoute>
                      <CodeGenerator />
                    </ProtectedRoute>
                  } />
                  <Route path="/ai-insights" element={
                    <ProtectedRoute>
                      <AIInsights />
                    </ProtectedRoute>
                  } />
                  <Route path="/ai-insights-v2" element={
                    <ProtectedRoute>
                      <AIInsightsV2 />
                    </ProtectedRoute>
                  } />
                  <Route path="/data-analysis" element={
                    <ProtectedRoute>
                      <DataAnalysis />
                    </ProtectedRoute>
                  } />
                  <Route path="/vault-simple" element={
                    <ProtectedRoute>
                      <SimpleVault />
                    </ProtectedRoute>
                  } />
                  <Route path="/vault-config" element={
                    <ProtectedRoute>
                      <KnowledgeVaultConfig />
                    </ProtectedRoute>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Router>
            </TooltipProvider>
          </ChatProvider>
        </NotificationProvider>
      </LaunchDarklyProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;