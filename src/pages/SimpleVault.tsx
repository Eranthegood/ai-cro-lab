import DashboardLayout from "@/components/layout/DashboardLayout";
import { SimpleVaultChat } from "@/components/knowledge-vault/SimpleVaultChat";
import { RateLimitProgress } from "@/components/knowledge-vault/RateLimitProgress";

const SimpleVault = () => {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Knowledge Vault Simple</h1>
          <p className="text-muted-foreground mb-4">
            Interface Claude-style : Upload vos fichiers et posez vos questions
          </p>
          <RateLimitProgress />
        </div>
        
        <SimpleVaultChat />
      </div>
    </DashboardLayout>
  );
};

export default SimpleVault;