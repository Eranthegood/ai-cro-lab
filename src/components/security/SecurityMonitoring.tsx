import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Shield, Activity, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SecurityEvent {
  id: string;
  action: string;
  resource_type: string;
  user_id: string;
  action_metadata: any;
  created_at: string;
}

interface RateLimit {
  id: string;
  user_id: string;
  operation_type: string;
  attempts_count: number;
  blocked_until: string | null;
  window_start: string;
}

export const SecurityMonitoring = () => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [rateLimits, setRateLimits] = useState<RateLimit[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSecurityData();
    
    // Set up real-time monitoring
    const eventSubscription = supabase
      .channel('security-events')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'knowledge_vault_audit',
        filter: 'resource_type=eq.security_event'
      }, (payload) => {
        setSecurityEvents(prev => [payload.new as SecurityEvent, ...prev.slice(0, 49)]);
        
        // Show toast for critical security events
        if (payload.new.action === 'email_change_attempt') {
          toast({
            title: "Security Alert",
            description: "Email change attempt detected",
            variant: "destructive",
          });
        }
      })
      .subscribe();

    return () => {
      eventSubscription.unsubscribe();
    };
  }, [toast]);

  const fetchSecurityData = async () => {
    try {
      // Fetch recent security events
      const { data: events, error: eventsError } = await supabase
        .from('knowledge_vault_audit')
        .select('*')
        .eq('resource_type', 'security_event')
        .order('created_at', { ascending: false })
        .limit(50);

      if (eventsError) throw eventsError;

      // Fetch current rate limits
      const { data: limits, error: limitsError } = await supabase
        .from('security_rate_limits')
        .select('*')
        .order('created_at', { ascending: false });

      if (limitsError) throw limitsError;

      setSecurityEvents(events || []);
      setRateLimits(limits || []);
    } catch (error) {
      console.error('Error fetching security data:', error);
      toast({
        title: "Error",
        description: "Failed to load security monitoring data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getEventSeverity = (event: SecurityEvent) => {
    if (event.action === 'email_change_attempt') return 'destructive';
    if (event.action === 'profile_update') return 'secondary';
    return 'outline';
  };

  const formatEventTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getActiveRateLimits = () => {
    return rateLimits.filter(limit => 
      limit.blocked_until && new Date(limit.blocked_until) > new Date()
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const activeBlocks = getActiveRateLimits();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Security Monitoring</h2>
      </div>

      {/* Active Security Alerts */}
      {activeBlocks.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {activeBlocks.length} user(s) currently rate limited due to suspicious activity
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Security Events Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityEvents.length}</div>
            <p className="text-xs text-muted-foreground">
              Last 50 events
            </p>
          </CardContent>
        </Card>

        {/* Rate Limits */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Blocks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBlocks.length}</div>
            <p className="text-xs text-muted-foreground">
              Users currently blocked
            </p>
          </CardContent>
        </Card>

        {/* Total Rate Limit Records */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rate Limit Records</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rateLimits.length}</div>
            <p className="text-xs text-muted-foreground">
              Total tracking records
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityEvents.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No security events recorded yet
              </p>
            ) : (
              securityEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getEventSeverity(event)}>
                        {event.action.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        User: {event.user_id.slice(0, 8)}...
                      </span>
                    </div>
                    <p className="text-sm">
                      {JSON.stringify(event.action_metadata, null, 2)}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatEventTime(event.created_at)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rate Limits Status */}
      {rateLimits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Rate Limit Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rateLimits.map((limit) => {
                const isBlocked = limit.blocked_until && new Date(limit.blocked_until) > new Date();
                return (
                  <div key={limit.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={isBlocked ? "destructive" : "secondary"}>
                          {limit.operation_type.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          User: {limit.user_id.slice(0, 8)}...
                        </span>
                      </div>
                      <p className="text-sm">
                        Attempts: {limit.attempts_count}
                        {isBlocked && (
                          <span className="text-destructive ml-2">
                            (Blocked until {formatEventTime(limit.blocked_until!)})
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Window: {formatEventTime(limit.window_start)}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};