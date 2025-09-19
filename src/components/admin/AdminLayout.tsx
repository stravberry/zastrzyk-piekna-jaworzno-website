
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
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
  RefreshCw,
  Menu
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
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

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
    { name: "CRM", href: "/admin/crm", icon: Users },
    { name: "Wizyty", href: "/admin/appointments", icon: Calendar },
    { name: "Posty", href: "/admin/posts", icon: FileText },
    { name: "Galeria", href: "/admin/gallery", icon: Image },
    { name: "Cennik", href: "/admin/pricing", icon: DollarSign },
    { name: "Kontakty", href: "/admin/contacts", icon: Mail },
    { name: "Szablony Email", href: "/admin/email-templates", icon: FileEdit },
    { name: "Analityka", href: "/admin/analytics", icon: BarChart3 },
    { name: "Użytkownicy", href: "/admin/users", icon: Users, adminOnly: true },
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

  // Auto-collapse sidebar on tablets (768-1023px), open on desktop, mobile uses Sheet
  const [sidebarOpen, setSidebarOpen] = useState(true);
  useEffect(() => {
    const setByWidth = () => {
      const w = window.innerWidth;
      const isTablet = w >= 768 && w < 1024;
      setSidebarOpen(!isTablet);
    };
    setByWidth();
    window.addEventListener('resize', setByWidth);
    return () => window.removeEventListener('resize', setByWidth);
  }, []);

  return (
    <AdminSecurityWrapper>
      <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <div className="min-h-screen flex w-full bg-gray-50">
          {/* Mobile header with burger menu */}
          <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b shadow-sm lg:hidden">
            <div className="flex items-center justify-between h-full px-4">
              <Link to="/" className="flex items-center">
                <img 
                  src="/src/assets/zastrzyk-piekna-logo.png" 
                  alt="Zastrzyk Piękna - Kosmetolog Anna Gajęcka"
                  className="h-8 w-auto"
                />
              </Link>
              <SidebarTrigger className="p-2" />
            </div>
          </header>

          {/* Admin Sidebar */}
          <AdminSidebar 
            navigation={navigation}
            isActive={isActive}
            canAccessRoute={canAccessRoute}
            user={user}
            userRole={userRole}
            sessionInfo={sessionInfo}
            securityStatus={securityStatus}
            showLogoutDialog={showLogoutDialog}
            setShowLogoutDialog={setShowLogoutDialog}
            handleSecureLogout={handleSecureLogout}
          />

          {/* Main content */}
          <main className="flex-1 pt-16 lg:pt-0 overflow-x-hidden min-w-0">
            <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-4 md:py-6 min-w-0 overflow-x-hidden">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </AdminSecurityWrapper>
  );
};

// Separate AdminSidebar component for better organization
const AdminSidebar: React.FC<{
  navigation: any[];
  isActive: (href: string) => boolean;
  canAccessRoute: (route: any) => boolean;
  user: any;
  userRole: string;
  sessionInfo: any;
  securityStatus: string;
  showLogoutDialog: boolean;
  setShowLogoutDialog: (show: boolean) => void;
  handleSecureLogout: () => void;
}> = ({ 
  navigation, 
  isActive, 
  canAccessRoute, 
  user, 
  userRole, 
  sessionInfo, 
  securityStatus,
  showLogoutDialog,
  setShowLogoutDialog,
  handleSecureLogout 
}) => {
  const { state, setOpenMobile } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";
  const isMobile = useIsMobile();
  
  // On mobile, never show collapsed state - always show full menu when open
  const shouldShowFullContent = !collapsed || isMobile;

  // Function to close mobile sidebar after navigation
  const handleMobileNavClick = () => {
    // Check if we're on mobile (screen width < 1024px)
    if (window.innerWidth < 1024) {
      setOpenMobile(false);
    }
  };

  const getNavCls = (href: string) => {
    const isActiveRoute = isActive(href);
    return isActiveRoute 
      ? "bg-pink-50 text-pink-700 border-r-2 border-pink-500" 
      : "hover:bg-gray-50 text-gray-700";
  };

  return (
    <Sidebar className={`mt-16 lg:mt-0`} collapsible="icon">
      <SidebarContent className="bg-white">
        {/* Header - always show on mobile, hide only when collapsed on desktop */}
        {shouldShowFullContent && (
          <div className="p-4 border-b">
            <Link to="/" className="flex items-center mb-2">
              <img 
                src="/src/assets/zastrzyk-piekna-logo.png" 
                alt="Zastrzyk Piękna - Kosmetolog Anna Gajęcka"
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-sm text-gray-500 mt-1">Panel administracyjny</p>
            
            {/* User info */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
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

              {/* Session countdown */}
              {sessionInfo && (
                <div className="space-y-2">
                  <div className={`text-xs flex items-center space-x-1 ${
                    sessionInfo.isCritical ? 'text-red-600 font-semibold' : 
                    sessionInfo.isExpiringSoon ? 'text-orange-600' : 'text-gray-500'
                  }`}>
                    <Clock className="w-3 h-3 flex-shrink-0" />
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
        )}

        {/* Navigation */}
        <SidebarGroup className="px-0 py-4">
          <SidebarGroupLabel className={collapsed ? "sr-only" : "px-4"}>
            Menu główne
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigation.filter(canAccessRoute).map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive(item.href)}>
                      <NavLink 
                        to={item.href} 
                        className={`${collapsed ? 'justify-center' : ''}`}
                        onClick={handleMobileNavClick}
                      >
                         <Icon className="w-4 h-4 flex-shrink-0" />
                         {shouldShowFullContent && (
                           <>
                             <span className="ml-3">{item.name}</span>
                             {item.adminOnly && (
                               <Shield className="w-3 h-3 ml-auto text-red-500" />
                             )}
                           </>
                         )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout button */}
        <div className="mt-auto p-4 border-t">
          <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className={`w-full text-red-600 border-red-200 hover:bg-red-50 ${collapsed ? 'px-2' : ''}`}
                size={collapsed ? "sm" : "default"}
              >
                 <LogOut className="w-4 h-4 flex-shrink-0" />
                 {shouldShowFullContent && <span className="ml-2">Wyloguj się</span>}
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
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminLayout;
