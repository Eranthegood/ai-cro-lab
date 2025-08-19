import DashboardLayout from "@/components/layout/DashboardLayout";
import { VaultChatInterface } from "@/components/knowledge-vault/VaultChatInterface";

const AIInsights = () => {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background">
        {/* Centered chat interface */}
        <div className="max-w-4xl mx-auto px-8 py-8">
          <VaultChatInterface className="h-[calc(100vh-6rem)]" />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIInsights;