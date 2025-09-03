import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Clock, Shield } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface SecurityAlert {
  id: string;
  alert_type: string;
  severity: string; // Changed from union to string to match database
  title: string;
  description: string;
  metadata: any; // Changed to any to handle Supabase JSON type
  resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
}

const SecurityAlertsPanel: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['security-alerts'],
    queryFn: async (): Promise<SecurityAlert[]> => {
      const { data, error } = await supabase
        .from('security_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    }
  });

  const resolveAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('security_alerts')
        .update({ 
          resolved: true, 
          resolved_at: new Date().toISOString(),
          resolved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-alerts'] });
      toast.success('Security alert resolved');
    },
    onError: (error) => {
      toast.error('Failed to resolve alert');
      console.error('Error resolving alert:', error);
    }
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'medium': return <Shield className="h-4 w-4 text-secondary-foreground" />;
      case 'low': return <Shield className="h-4 w-4 text-muted-foreground" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const unresolvedAlerts = alerts?.filter(alert => !alert.resolved) || [];
  const resolvedAlerts = alerts?.filter(alert => alert.resolved) || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Security Alerts</h2>
        <div className="flex items-center gap-2">
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {unresolvedAlerts.length} Active
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            {resolvedAlerts.length} Resolved
          </Badge>
        </div>
      </div>

      {/* Unresolved Alerts */}
      {unresolvedAlerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Active Alerts
          </h3>
          {unresolvedAlerts.map((alert) => (
            <Card key={alert.id} className="p-4 border-l-4 border-l-destructive">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(alert.severity)}
                    <Badge variant={getSeverityColor(alert.severity) as any}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {alert.alert_type}
                    </span>
                  </div>
                  <h4 className="font-medium text-foreground">{alert.title}</h4>
                  <p className="text-sm text-muted-foreground">{alert.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                  </div>
                  {alert.metadata && Object.keys(alert.metadata).length > 0 && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        Show Details
                      </summary>
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                        {JSON.stringify(alert.metadata, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => resolveAlertMutation.mutate(alert.id)}
                  disabled={resolveAlertMutation.isPending}
                  className="ml-4"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Resolve
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Resolved Alerts */}
      {resolvedAlerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Recently Resolved
          </h3>
          {resolvedAlerts.slice(0, 5).map((alert) => (
            <Card key={alert.id} className="p-4 opacity-75">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <Badge variant="outline">{alert.severity.toUpperCase()}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {alert.alert_type}
                    </span>
                  </div>
                  <h4 className="font-medium text-foreground">{alert.title}</h4>
                  <p className="text-sm text-muted-foreground">{alert.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>
                      Created: {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                    </span>
                    {alert.resolved_at && (
                      <span>
                        Resolved: {formatDistanceToNow(new Date(alert.resolved_at), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!alerts || alerts.length === 0 && (
        <Card className="p-8 text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No Security Alerts</h3>
          <p className="text-muted-foreground">Your system is secure. No alerts have been generated.</p>
        </Card>
      )}
    </div>
  );
};

export default SecurityAlertsPanel;