import DashboardLayout from "@/components/layout/DashboardLayout";
import { VercelV0Chat } from "@/components/ui/v0-ai-chat";

const AIInsights = () => {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background">
        <VercelV0Chat />
      </div>
    </DashboardLayout>
  );
};

export default AIInsights;