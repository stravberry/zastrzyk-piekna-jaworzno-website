import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  CheckCircle
} from "lucide-react";
import AnimatedBurgerIcon from "@/components/ui/AnimatedBurgerIcon";
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

interface SlidingSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  user: any;
  userRole: string;
  sessionInfo: any;
  securityStatus: string;
  showLogoutDialog: boolean;
  setShowLogoutDialog: (show: boolean) => void;
  handleSecureLogout: () => void;
  isDesktop?: boolean;
}

export const SlidingSidebar: React.FC<SlidingSidebarProps> = ({
  isOpen,
  onToggle,
  user,
  userRole,
  sessionInfo,
  securityStatus,
  showLogoutDialog,
  setShowLogoutDialog,
  handleSecureLogout,
  isDesktop = false
}) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  
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

  // Close sidebar when clicking outside on mobile
  const handleBackdropClick = () => {
    if (isMobile && !isDesktop) {
      onToggle();
    }
  };

  // Handle navigation clicks - close sidebar automatically (only on mobile)
  const handleNavClick = () => {
    if (isMobile && !isDesktop) {
      onToggle();
    }
  };

  // Close on Escape key (only on mobile)
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && isMobile && !isDesktop) {
        onToggle();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onToggle, isMobile, isDesktop]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobile && !isDesktop && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, isOpen, isDesktop]);

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && isMobile && !isDesktop && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={handleBackdropClick}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        ${isDesktop ? 'static' : 'fixed'} top-0 left-0 h-full bg-white shadow-lg 
        ${isDesktop ? 'z-auto' : 'z-50'}
        ${isDesktop ? '' : 'transform transition-transform duration-300 ease-in-out'}
        ${isDesktop || isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isMobile ? 'w-80' : 'w-72'}
      `}>
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <Link to="/" className="flex items-center">
              <span className="text-lg font-semibold text-gray-800">Admin Panel</span>
            </Link>
            <SlidingSidebarTrigger 
              isOpen={isOpen} 
              onToggle={onToggle}
            />
          </div>
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

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Menu główne
            </h3>
          </div>
          <nav className="space-y-1 px-2">
            {navigation.filter(canAccessRoute).map((item) => {
              const Icon = item.icon;
              const isActiveRoute = isActive(item.href);
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={handleNavClick}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                    ${isActiveRoute 
                      ? 'bg-pink-50 text-pink-700 border-r-2 border-pink-500' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="ml-3">{item.name}</span>
                  {item.adminOnly && (
                    <Shield className="w-3 h-3 ml-auto text-red-500" />
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Logout button */}
        <div className="p-4 border-t">
          <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                <span className="ml-2">Wyloguj się</span>
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
    </>
  );
};

// Animated Hamburger Menu Button Component
export const SlidingSidebarTrigger: React.FC<{
  isOpen: boolean;
  onToggle: () => void;
}> = ({ isOpen, onToggle }) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onToggle}
      className="p-2 hover:bg-gray-100 transition-colors"
      aria-label={isOpen ? "Zamknij menu" : "Otwórz menu"}
    >
      <AnimatedBurgerIcon isOpen={isOpen} className="w-5 h-5" />
    </Button>
  );
};