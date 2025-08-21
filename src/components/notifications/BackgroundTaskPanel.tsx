import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Brain } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';

export const BackgroundTaskPanel = () => {
  const { backgroundTasks } = useNotifications();
  const activeTasks = backgroundTasks.filter(task => task.status === 'processing');
  
  // Only show panel if user is NOT on the vault-simple page
  const isOnVaultPage = typeof window !== 'undefined' && window.location.pathname === '/vault-simple';
  
  if (activeTasks.length === 0 || isOnVaultPage) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 z-50">
      {activeTasks.map((task) => (
        <Card key={task.id} className="mb-2 border-primary/20 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="p-1 bg-gradient-to-br from-primary/20 to-primary/10 rounded">
                <Brain className="h-4 w-4 text-primary" />
              </div>
              {task.title}
              <Badge variant="outline" className="ml-auto">
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                En cours
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {task.progress && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  {task.progress}
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full animate-pulse w-1/2" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};