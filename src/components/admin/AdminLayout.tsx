
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAdmin } from "@/context/AdminContext";
import AdminSecurityWrapper from "./AdminSecurityWrapper";
import { toast } from "sonner";
import { SlidingSidebar, SlidingSidebarTrigger } from "./SlidingSidebar";

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userRole, logout, session } = useAdmin();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Update time every second for real-time countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <AdminSecurityWrapper>
      <div className="min-h-screen bg-gray-50">
        {/* Header with hamburger menu */}
        <header className="fixed top-0 left-0 right-0 z-30 h-16 bg-white border-b shadow-sm">
          <div className="flex items-center justify-between h-full px-4">
            <div className="flex items-center space-x-4">
              <SlidingSidebarTrigger 
                isOpen={sidebarOpen} 
                onToggle={toggleSidebar}
              />
              <Link to="/" className="flex items-center">
                <img 
                  src="/src/assets/zastrzyk-piekna-logo.png" 
                  alt="Zastrzyk Piękna - Kosmetolog Anna Gajęcka"
                  className="h-8 w-auto"
                />
              </Link>
            </div>
          </div>
        </header>

        {/* Sliding Sidebar */}
        <SlidingSidebar
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
          user={user}
          userRole={userRole}
          sessionInfo={sessionInfo}
          securityStatus={securityStatus}
          showLogoutDialog={showLogoutDialog}
          setShowLogoutDialog={setShowLogoutDialog}
          handleSecureLogout={handleSecureLogout}
        />

        {/* Main content */}
        <main className="pt-16 w-full">
          <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-4 md:py-6">
            {children}
          </div>
        </main>
      </div>
    </AdminSecurityWrapper>
  );
};


export default AdminLayout;
