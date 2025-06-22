
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Users, 
  FileText, 
  Image, 
  DollarSign, 
  Mail, 
  Settings,
  Shield,
  Code,
  Calendar,
  FileEdit,
  LogOut,
  User,
  Clock
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { Badge } from "@/components/ui/badge";
import AdminSecurityWrapper from "./AdminSecurityWrapper";

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { user, userRole, logout, session } = useAdmin();

  const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: BarChart3 },
    { name: "CRM", href: "/admin/crm", icon: Calendar },
    { name: "Posty", href: "/admin/posts", icon: FileText },
    { name: "Galeria", href: "/admin/gallery", icon: Image },
    { name: "Cennik", href: "/admin/pricing", icon: DollarSign },
    { name: "Kontakty", href: "/admin/contacts", icon: Mail },
    { name: "Szablony Email", href: "/admin/email-templates", icon: FileEdit },
    { name: "Analityka", href: "/admin/analytics", icon: BarChart3 },
    { name: "Użytkownicy", href: "/admin/users", icon: Users, adminOnly: true },
    { name: "Bezpieczeństwo", href: "/admin/security", icon: Shield, adminOnly: true },
    { name: "Kod", href: "/admin/code-settings", icon: Code, adminOnly: true },
  ];

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + "/");
  };

  const canAccessRoute = (route: any) => {
    if (route.adminOnly) {
      return userRole === 'admin';
    }
    return true;
  };

  const getSessionInfo = () => {
    if (!session?.expires_at) return null;
    
    const expiresAt = new Date(session.expires_at);
    const now = new Date();
    const timeLeft = expiresAt.getTime() - now.getTime();
    const minutesLeft = Math.floor(timeLeft / 60000);
    
    return { expiresAt, minutesLeft };
  };

  const sessionInfo = getSessionInfo();

  return (
    <AdminSecurityWrapper>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r">
          <div className="p-6">
            <Link to="/" className="text-xl font-bold text-pink-600">
              Zastrzyk Piękna
            </Link>
            <p className="text-sm text-gray-500 mt-1">Panel administracyjny</p>
            
            {/* User info with security status */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium truncate">{user?.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant={userRole === 'admin' ? 'destructive' : 'secondary'}>
                  {userRole}
                </Badge>
                {sessionInfo && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{sessionInfo.minutesLeft}m</span>
                  </div>
                )}
              </div>
              {sessionInfo && sessionInfo.minutesLeft < 5 && (
                <div className="mt-2 text-xs text-orange-600">
                  Sesja wygasa wkrótce!
                </div>
              )}
            </div>
          </div>
          
          <nav className="px-4 space-y-1">
            {navigation.filter(canAccessRoute).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive(item.href)
                      ? "bg-pink-50 text-pink-700 border-r-2 border-pink-500"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.name}
                  {item.adminOnly && (
                    <Shield className="w-3 h-3 ml-auto text-red-500" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Security logout button */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
            <Button
              onClick={logout}
              variant="outline"
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Bezpieczne wylogowanie
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {children}
          </div>
        </div>
      </div>
    </AdminSecurityWrapper>
  );
};

export default AdminLayout;
