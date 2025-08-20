import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Zap, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useToast } from "@/hooks/use-toast";

export function ParseAllFilesButton() {
  const [parsing, setParsing] = useState(false);
  const { currentWorkspace } = useWorkspace();
  const { toast } = useToast();

  const parseAllFiles = async () => {
    if (!currentWorkspace?.id) return;
    
    setParsing(true);
    
    try {
      toast({
        title: "🚀 Migration starting",
        description: "Parsing all Knowledge Vault files with optimal architecture..."
      });

      const { data, error } = await supabase.functions.invoke('migrate-vault-files', {
        body: {
          workspaceId: currentWorkspace.id
        }
      });
      
      if (error) throw error;
      
      if (data.success) {
        toast({
          title: "✅ Migration completed!",
          description: `Processed ${data.processedCount} files. ${data.successCount} successful, ${data.errorCount || 0} errors.`
        });
        
        if (data.errors && data.errors.length > 0) {
          console.error('Migration errors:', data.errors);
        }
      }
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Migration failed",
        description: error.message
      });
    } finally {
      setParsing(false);
    }
  };

  return (
    <Button
      onClick={parseAllFiles}
      disabled={parsing}
      className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
    >
      {parsing ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <Zap className="h-4 w-4" />
      )}
      {parsing ? 'Parsing...' : 'Parse All Files (90% Cost Reduction)'}
    </Button>
  );
}