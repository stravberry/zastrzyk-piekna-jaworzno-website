
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  Home,
  FileText,
  Code,
  Menu,
  X,
  Tag,
  Image,
  Shield,
  Clock,
  Users,
} from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";

import { useAdmin } from "@/context/AdminContext";
import { useWindowSize } from "@/hooks/use-window-size";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ title, subtitle, children }) => {
  const { logout, user, userRole, isAdmin } = useAdmin();
  const location = useLocation();
  const { width } = useWindowSize();
  const isMobile = width < 768;
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const [sessionTimeLeft, setSessionTimeLeft] = useState<string>("");

  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  // Session timeout countdown
  useEffect(() => {
    const updateSessionTimer = () => {
      const lastActivity = localStorage.getItem('lastActivity');
      if (lastActivity) {
        const lastTime = parseInt(lastActivity);
        const timeLeft = 30 * 60 * 1000 - (Date.now() - lastTime); // 30 minutes
        
        if (timeLeft > 0) {
          const minutes = Math.floor(timeLeft / 60000);
          const seconds = Math.floor((timeLeft % 60000) / 1000);
          setSessionTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        } else {
          setSessionTimeLeft("Sesja wygasła");
        }
      }
    };

    const interval = setInterval(updateSessionTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = useCallback(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    closeSidebar();
  }, [location, closeSidebar]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobile &&
        isSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        closeSidebar();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobile, isSidebarOpen, closeSidebar]);

  // Menu items with role-based access
  const menuItems = [
    { 
      icon: <Home size={20} />, 
      label: 'Dashboard', 
      href: '/admin/dashboard', 
      current: location.pathname === '/admin/dashboard',
      requiredRole: 'editor'
    },
    { 
      icon: <FileText size={20} />, 
      label: 'Posty', 
      href: '/admin/posts', 
      current: location.pathname.includes('/admin/posts'),
      requiredRole: 'editor'
    },
    { 
      icon: <Image size={20} />, 
      label: 'Galeria', 
      href: '/admin/gallery', 
      current: location.pathname.includes('/admin/gallery'),
      requiredRole: 'admin'
    },
    { 
      icon: <Tag size={20} />, 
      label: 'Cennik', 
      href: '/admin/pricing', 
      current: location.pathname.includes('/admin/pricing'),
      requiredRole: 'admin'
    },
    { 
      icon: <Users size={20} />, 
      label: 'Użytkownicy', 
      href: '/admin/users', 
      current: location.pathname.includes('/admin/users'),
      requiredRole: 'admin'
    },
    { 
      icon: <Code size={20} />, 
      label: 'Kod', 
      href: '/admin/code-settings', 
      current: location.pathname === '/admin/code-settings',
      requiredRole: 'admin'
    },
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => {
    if (item.requiredRole === 'admin') {
      return isAdmin;
    }
    return true; // editors can access editor-level items
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'editor': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      {isMobile && (
        <div
          className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ${
            isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        ></div>
      )}
      <aside
        ref={sidebarRef}
        className={`flex flex-col w-64 bg-white border-r border-gray-200 transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${isMobile ? "fixed inset-y-0 z-50" : ""}`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <Link to="/admin/dashboard" className="font-bold text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-pink-500" />
            Panel Admina
          </Link>
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <X className="h-6 w-6" />
            </Button>
          )}
        </div>
        
        {/* User info */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3 mb-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" alt={user?.email} />
              <AvatarFallback>
                {user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Badge className={getRoleBadgeColor(userRole || 'user')}>
              {userRole || 'user'}
            </Badge>
            {sessionTimeLeft && (
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                {sessionTimeLeft}
              </div>
            )}
          </div>
        </div>

        <nav className="flex-grow p-4">
          <ul>
            {filteredMenuItems.map((item) => (
              <li key={item.label} className="mb-1">
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md hover:bg-gray-100 transition-colors ${
                      isActive
                        ? "bg-pink-50 text-pink-600 font-medium"
                        : "text-gray-700"
                    }`
                  }
                  onClick={closeSidebar}
                >
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-grow">
        {/* Header */}
        <header className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <Menu className="h-6 w-6" />
            </Button>
          )}
          <div className="flex flex-col">
            <h1 className="text-2xl font-semibold">{title}</h1>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 lg:h-10 lg:w-10">
                <Avatar className="h-8 w-8 lg:h-10 lg:w-10">
                  <AvatarImage src="" alt={user?.email} />
                  <AvatarFallback>
                    {user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div>
                  <p>{user?.email}</p>
                  <p className="text-xs text-gray-500">Rola: {userRole}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600">
                Wyloguj się
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Content */}
        <main className="flex-grow p-4 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
