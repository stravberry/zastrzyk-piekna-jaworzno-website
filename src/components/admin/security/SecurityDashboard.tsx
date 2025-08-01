
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle, Clock, User, Activity } from "lucide-react";
import { format } from "date-fns";

interface SecurityEvent {
  id: string;
  event_type: string;
  user_id: string;
  metadata: any;
  created_at: string;
}

interface SecurityStats {
  totalEvents: number;
  recentEvents: number;
  activeUsers: number;
  adminUsers: number;
}

const SecurityDashboard: React.FC = () => {
  const { data: securityEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ['security-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_activity_log')
        .select('*')
        .eq('resource_type', 'security')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Transform admin_activity_log to SecurityEvent format
      return (data || []).map(item => ({
        id: item.id,
        event_type: item.action,
        user_id: item.user_id,
        metadata: item.details,
        created_at: item.created_at
      })) as SecurityEvent[];
    }
  });

  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ['security-user-stats'],
    queryFn: async () => {
      const { data: users, error } = await supabase.rpc('get_all_users_with_roles');
      
      if (error) throw error;
      
      const totalUsers = users?.length || 0;
      const activeUsers = users?.filter(u => u.last_sign_in_at)?.length || 0;
      const adminUsers = users?.filter(u => u.roles.includes('admin'))?.length || 0;
      
      // Get recent logins (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentLogins = users?.filter(u => {
        return u.last_sign_in_at && new Date(u.last_sign_in_at) > sevenDaysAgo;
      }).sort((a, b) => new Date(b.last_sign_in_at).getTime() - new Date(a.last_sign_in_at).getTime()) || [];

      return {
        totalUsers,
        activeUsers,
        adminUsers,
        recentUsers: recentLogins.length,
        recentLogins
      };
    }
  });

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'login': return <User className="h-4 w-4 text-green-500" />;
      case 'role_change': return <Shield className="h-4 w-4 text-blue-500" />;
      case 'failed_login': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEventTypeBadge = (eventType: string) => {
    switch (eventType) {
      case 'login': return <Badge className="bg-green-100 text-green-800">Login</Badge>;
      case 'role_change': return <Badge className="bg-blue-100 text-blue-800">Role Change</Badge>;
      case 'failed_login': return <Badge className="bg-red-100 text-red-800">Failed Login</Badge>;
      case 'assign_role': return <Badge className="bg-purple-100 text-purple-800">Role Assigned</Badge>;
      case 'remove_role': return <Badge className="bg-orange-100 text-orange-800">Role Removed</Badge>;
      default: return <Badge variant="secondary">{eventType}</Badge>;
    }
  };

  if (eventsLoading || statsLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Security Dashboard</h2>
        <p className="text-sm sm:text-base text-gray-600">Monitor security events and user activity</p>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 truncate">Total Users</p>
                <p className="text-lg sm:text-2xl font-bold">{userStats?.totalUsers || 0}</p>
              </div>
              <User className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 flex-shrink-0 ml-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 truncate">Active Users</p>
                <p className="text-lg sm:text-2xl font-bold">{userStats?.activeUsers || 0}</p>
              </div>
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 flex-shrink-0 ml-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 truncate">Admin Users</p>
                <p className="text-lg sm:text-2xl font-bold">{userStats?.adminUsers || 0}</p>
              </div>
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 flex-shrink-0 ml-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 truncate">Recent Logins</p>
                <p className="text-lg sm:text-2xl font-bold">{userStats?.recentUsers || 0}</p>
              </div>
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 flex-shrink-0 ml-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Logins */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Ostatnie logowania</CardTitle>
          <CardDescription className="text-sm">
            Najnowsze logowania użytkowników w systemie
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="space-y-3">
            {userStats?.recentLogins && userStats.recentLogins.length > 0 ? (
              userStats.recentLogins.map((user, index) => (
                <div key={user.user_id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg gap-3">
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <User className="h-4 w-4 text-green-500 flex-shrink-0 mt-1 sm:mt-0" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-col xs:flex-row xs:items-center gap-2">
                        <Badge className="bg-green-100 text-green-800 text-xs w-fit">Successful Login</Badge>
                        <span className="text-xs sm:text-sm text-gray-600">
                          {format(new Date(user.last_sign_in_at), 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <div className="break-words">Rola: {user.roles.join(', ')}</div>
                        <div>Status: {user.email_confirmed_at ? 'Zweryfikowany' : 'Niezweryfikowany'}</div>
                        <div>Konto utworzone: {format(new Date(user.created_at), 'MMM dd, yyyy')}</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 break-all sm:text-right">
                    {user.email}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                Brak logowań z ostatnich 7 dni
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityDashboard;
