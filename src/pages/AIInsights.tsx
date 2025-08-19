import { AnthropicIcon } from "@/assets/AnthropicIcon";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { VaultChatInterface } from "@/components/knowledge-vault/VaultChatInterface";

const AIInsights = () => {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background">
        {/* Simple centered header */}
        <div className="flex flex-col items-center justify-center pt-16 pb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-primary/10 rounded-xl">
              <AnthropicIcon className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-foreground mb-2">
                Intel
              </h1>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200">
                Alpha
              </Badge>
            </div>
          </div>
          <p className="text-xl text-muted-foreground text-center max-w-2xl">
            Intelligence collective alimentée par votre Knowledge Vault
          </p>
        </div>

        {/* Centered chat interface */}
        <div className="max-w-4xl mx-auto px-8 pb-8">
          <VaultChatInterface className="h-[600px]" />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIInsights;