import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, AlertTriangle, Users, Database, Eye, Activity, Lock, Key, UserCheck, Clock } from "lucide-react";
import SecurityAlertsPanel from "./SecurityAlertsPanel";
import { toast } from "sonner";

interface SecurityMetric {
  id: string;
  title: string;
  value: number;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  icon: React.ReactNode;
}

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: string;
  user_id: string | null;
  created_at: string;
  details: any;
  ip_address: string | null;
}

const SecurityDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const queryClient = useQueryClient();

  // Fetch recent security events
  const { data: securityEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ['security-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as SecurityEvent[];
    }
  });

  // Fetch security metrics
  const { data: securityMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['security-metrics'],
    queryFn: async () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Get various security metrics
      const [
        { count: totalEvents },
        { count: criticalEvents },
        { count: recentFailedLogins },
        { count: patientAccesses },
        { count: adminActions },
        { count: rateLimitedIPs }
      ] = await Promise.all([
        supabase.from('security_audit_log').select('*', { count: 'exact', head: true }),
        supabase.from('security_audit_log').select('*', { count: 'exact', head: true }).eq('severity', 'critical'),
        supabase.from('security_audit_log').select('*', { count: 'exact', head: true })
          .eq('event_type', 'patient_access_denied')
          .gte('created_at', oneHourAgo.toISOString()),
        supabase.from('security_audit_log').select('*', { count: 'exact', head: true })
          .eq('event_type', 'patient_access_validated')
          .gte('created_at', oneDayAgo.toISOString()),
        supabase.from('admin_activity_log').select('*', { count: 'exact', head: true })
          .gte('created_at', oneDayAgo.toISOString()),
        supabase.from('security_audit_log').select('*', { count: 'exact', head: true })
          .eq('event_type', 'patient_access_rate_limited')
          .gte('created_at', oneWeekAgo.toISOString())
      ]);

      const metrics: SecurityMetric[] = [
        {
          id: 'total-events',
          title: 'Total Security Events',
          value: totalEvents || 0,
          description: 'All recorded security events',
          severity: 'low',
          icon: <Activity className="h-4 w-4" />
        },
        {
          id: 'critical-events',
          title: 'Critical Events',
          value: criticalEvents || 0,
          description: 'High priority security incidents',
          severity: criticalEvents > 0 ? 'critical' : 'low',
          icon: <AlertTriangle className="h-4 w-4" />
        },
        {
          id: 'failed-logins',
          title: 'Failed Access Attempts (1h)',
          value: recentFailedLogins || 0,
          description: 'Recent failed authentication attempts',
          severity: recentFailedLogins > 10 ? 'high' : recentFailedLogins > 5 ? 'medium' : 'low',
          icon: <Lock className="h-4 w-4" />
        },
        {
          id: 'patient-accesses',
          title: 'Patient Data Access (24h)',
          value: patientAccesses || 0,
          description: 'Authorized patient data access',
          severity: 'low',
          icon: <Eye className="h-4 w-4" />
        },
        {
          id: 'admin-actions',
          title: 'Admin Actions (24h)',
          value: adminActions || 0,
          description: 'Administrative activities',
          severity: 'low',
          icon: <UserCheck className="h-4 w-4" />
        },
        {
          id: 'rate-limited',
          title: 'Rate Limited IPs (7d)',
          value: rateLimitedIPs || 0,
          description: 'IPs blocked for excessive requests',
          severity: rateLimitedIPs > 0 ? 'medium' : 'low',
          icon: <Shield className="h-4 w-4" />
        }
      ];

      return metrics;
    }
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'default';
      default: return 'secondary';
    }
  };

  const runSecurityScan = async () => {
    try {
      toast.info("Running comprehensive security scan...");
      
      // Trigger security validation functions
      const { error } = await supabase.rpc('validate_patient_access_session_enhanced');
      
      if (error) {
        toast.error("Security scan completed with issues");
      } else {
        toast.success("Security scan completed successfully");
      }
      
      // Refresh metrics
      queryClient.invalidateQueries({ queryKey: ['security-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['security-events'] });
      
    } catch (error) {
      toast.error("Failed to run security scan");
      console.error('Security scan error:', error);
    }
  };

  const recentCriticalEvents = securityEvents?.filter(event => 
    event.severity === 'critical' && 
    new Date(event.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage system security, access controls, and threat detection
          </p>
        </div>
        <Button onClick={runSecurityScan} variant="outline" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Run Security Scan
        </Button>
      </div>

      {recentCriticalEvents.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Critical Security Events Detected</AlertTitle>
          <AlertDescription>
            {recentCriticalEvents.length} critical security event(s) in the last 24 hours. 
            Please review immediately in the Security Alerts tab.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="settings">Security Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {metricsLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
                    <div className="h-3 w-full bg-muted animate-pulse rounded" />
                  </CardContent>
                </Card>
              ))
            ) : (
              securityMetrics?.map((metric) => (
                <Card key={metric.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {metric.title}
                    </CardTitle>
                    <Badge variant={getSeverityColor(metric.severity) as any}>
                      {metric.icon}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metric.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {metric.description}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Protected Tables
                </CardTitle>
                <CardDescription>
                  Database tables with enhanced security
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Patient Records</span>
                    <Badge variant="secondary">Ultra Secure</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Treatment Photos</span>
                    <Badge variant="secondary">Ultra Secure</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Calendar Integrations</span>
                    <Badge variant="secondary">Encrypted</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Contact Submissions</span>
                    <Badge variant="secondary">Rate Limited</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Security Features
                </CardTitle>
                <CardDescription>
                  Active security measures
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Enhanced Session Validation</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">IP-based Rate Limiting</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Calendar Token Encryption</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Admin Activity Monitoring</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts">
          <SecurityAlertsPanel />
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Recent Security Events
              </CardTitle>
              <CardDescription>
                Latest security-related activities and incidents
              </CardDescription>
            </CardHeader>
            <CardContent>
              {eventsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {securityEvents?.slice(0, 50).map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-2 rounded border">
                      <div className="flex items-center gap-3">
                        <Badge variant={getSeverityColor(event.severity) as any}>
                          {event.severity}
                        </Badge>
                        <div>
                          <span className="text-sm font-medium">{event.event_type}</span>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(event.created_at).toLocaleString()}
                            {event.ip_address && (
                              <span>• IP: {event.ip_address}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Configuration</CardTitle>
              <CardDescription>
                Security recommendations and configuration settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>Enhanced Security Active</AlertTitle>
                <AlertDescription>
                  Your application is using enhanced security measures including:
                  <ul className="mt-2 ml-4 list-disc space-y-1">
                    <li>Multi-layer session validation with 4-hour timeout for patient data</li>
                    <li>IP-based rate limiting (max 10 failed attempts per hour)</li>
                    <li>Automatic calendar token encryption</li>
                    <li>Enhanced contact form validation with bot protection</li>
                    <li>Comprehensive security event logging</li>
                  </ul>
                </AlertDescription>
              </Alert>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Supabase Configuration Warnings</AlertTitle>
                <AlertDescription>
                  Some Supabase settings need attention:
                  <ul className="mt-2 ml-4 list-disc space-y-1">
                    <li>OTP expiry exceeds recommended threshold - consider reducing to 5-10 minutes</li>
                    <li>Leaked password protection is disabled - enable in Auth settings</li>
                    <li>PostgreSQL version has security patches available - upgrade recommended</li>
                    <li>Extensions in public schema - consider moving to dedicated schema</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityDashboard;