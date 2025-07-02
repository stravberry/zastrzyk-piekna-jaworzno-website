
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { Badge } from "@/components/ui/badge";
import AdminSecurityWrapper from "./AdminSecurityWrapper";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userRole, logout, session } = useAdmin();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Update time every second for real-time countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
    if (!session?.expires_at) {
      console.log('[SESSION DEBUG] No session expires_at found:', session);
      return null;
    }
    
    // Debug session info
    console.log('[SESSION DEBUG] Raw expires_at:', session.expires_at);
    console.log('[SESSION DEBUG] Current time:', currentTime.toISOString());
    
    // Handle both timestamp (number) and ISO string formats
    let expiresAt: Date;
    if (typeof session.expires_at === 'number') {
      // Unix timestamp (seconds)
      expiresAt = new Date(session.expires_at * 1000);
    } else {
      // ISO string
      expiresAt = new Date(session.expires_at);
    }
    
    console.log('[SESSION DEBUG] Parsed expires_at:', expiresAt.toISOString());
    
    const timeLeft = expiresAt.getTime() - currentTime.getTime();
    console.log('[SESSION DEBUG] Time left (ms):', timeLeft);
    
    // Jeśli sesja już wygasła
    if (timeLeft <= 0) {
      return {
        expiresAt,
        minutesLeft: 0,
        secondsLeft: 0,
        timeLeft: 0,
        isExpiringSoon: true,
        isCritical: true,
        isExpired: true
      };
    }
    
    const minutesLeft = Math.floor(timeLeft / 60000);
    const secondsLeft = Math.floor((timeLeft % 60000) / 1000);
    
    return { 
      expiresAt, 
      minutesLeft, 
      secondsLeft, 
      timeLeft,
      isExpiringSoon: minutesLeft < 5, // Ostrzeżenie 5 minut przed wygaśnięciem
      isCritical: minutesLeft < 2, // Krytyczne ostrzeżenie 2 minuty przed wygaśnięciem
      isExpired: false
    };
  };

  const handleSecureLogout = async () => {
    try {
      toast.success('Rozpoczęto bezpieczne wylogowanie...');
      
      // Use basic logout and redirect to homepage
      await logout();
      
      // Navigate to homepage
      window.location.href = '/';
      
    } catch (error) {
      console.error('Secure logout error:', error);
      toast.error('Błąd podczas wylogowywania');
      // Force redirect even if logout fails
      window.location.href = '/';
    }
  };

  const sessionInfo = getSessionInfo();
  const securityStatus = user ? 'secure' : 'warning';

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
            
            {/* Enhanced user info with real security status */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium truncate">{user?.email}</span>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <Badge variant={userRole === 'admin' ? 'destructive' : 'secondary'}>
                  {userRole}
                </Badge>
                <div className="flex items-center space-x-1">
                  {securityStatus === 'secure' ? (
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-3 h-3 text-yellow-500" />
                  )}
                  <span className="text-xs text-gray-500">
                    {securityStatus === 'secure' ? 'Bezpieczna' : 'Ostrzeżenie'}
                  </span>
                </div>
              </div>

              {/* Real-time session countdown */}
              {sessionInfo && (
                <div className="space-y-2">
                  <div className={`text-xs flex items-center space-x-1 ${
                    sessionInfo.isCritical ? 'text-red-600 font-semibold' : 
                    sessionInfo.isExpiringSoon ? 'text-orange-600' : 'text-gray-500'
                  }`}>
                    <Clock className="w-3 h-3" />
                    <span>
                      {sessionInfo.minutesLeft >= 0 ? sessionInfo.minutesLeft : 0}m {sessionInfo.secondsLeft >= 0 ? sessionInfo.secondsLeft : 0}s
                    </span>
                  </div>
                  
                  {(sessionInfo.isExpiringSoon || sessionInfo.isExpired) && (
                    <div className={`text-xs ${
                      sessionInfo.isExpired ? 'text-red-700 font-bold' :
                      sessionInfo.isCritical ? 'text-red-600' : 'text-orange-600'
                    }`}>
                      {sessionInfo.isExpired ? '🔴 Sesja wygasła!' : 
                       sessionInfo.isCritical ? '⚠️ Sesja wygasa za chwilę!' : 
                       '⏰ Sesja wygasa wkrótce'}
                    </div>
                  )}
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

          {/* Enhanced secure logout with confirmation */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
            <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Wyloguj się bezpiecznie
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Potwierdź bezpieczne wylogowanie</AlertDialogTitle>
                  <AlertDialogDescription>
                    Czy na pewno chcesz się wylogować? Zostaniesz przekierowany na stronę główną.
                    <br /><br />
                    <span className="text-xs text-gray-500">
                      Wszystkie dane sesji zostaną bezpiecznie wyczyszczone.
                    </span>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Anuluj</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleSecureLogout}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Wyloguj bezpiecznie
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
