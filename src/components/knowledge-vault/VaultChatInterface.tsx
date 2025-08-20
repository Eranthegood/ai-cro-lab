import { useState, useRef, useEffect } from 'react';
import { Send, Brain, Loader2, Sparkles, Archive } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useProjects } from '@/hooks/useProjects';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ProjectSelector } from '@/components/project/ProjectSelector';
import { SaveToVaultModal } from '@/components/project/SaveToVaultModal';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface VaultChatInterfaceProps {
  className?: string;
}

export const VaultChatInterface = ({ className }: VaultChatInterfaceProps) => {
  // Legacy component - now redirects to StreamingChatInterface
  return (
    <div className={className}>
      <div className="text-center p-8 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground mb-4">
          Cette interface a été remplacée par l'Intelligence Collective avancée.
        </p>
        <p className="text-xs text-muted-foreground">
          Utilisez StreamingChatInterface pour l'expérience complète.
        </p>
      </div>
    </div>
  );
};