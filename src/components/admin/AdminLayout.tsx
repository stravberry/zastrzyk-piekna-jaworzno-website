
import React, {
  useState,
  useContext,
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
} from "lucide-react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import { useAdmin } from "@/context/AdminContext";
import { useWindowSize } from "@/hooks/use-window-size";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  const { isAuthenticated: isAdmin, logout } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const { width } = useWindowSize();
  const isMobile = width < 768;
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);

  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

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

  // Menu items
  const menuItems = [
    { 
      icon: <Home size={20} />, 
      label: 'Dashboard', 
      href: '/admin/dashboard', 
      current: location.pathname === '/admin/dashboard' 
    },
    { 
      icon: <FileText size={20} />, 
      label: 'Posty', 
      href: '/admin/posts', 
      current: location.pathname.includes('/admin/posts') 
    },
    { 
      icon: <Tag size={20} />, 
      label: 'Cennik', 
      href: '/admin/pricing', 
      current: location.pathname.includes('/admin/pricing') 
    },
    { 
      icon: <Code size={20} />, 
      label: 'Kod', 
      href: '/admin/code-settings', 
      current: location.pathname === '/admin/code-settings' 
    },
  ];

  if (!isAdmin) {
    navigate("/admin/login");
    return null;
  }

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
          <Link to="/admin/dashboard" className="font-bold text-lg">
            Panel Admina
          </Link>
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <X className="h-6 w-6" />
            </Button>
          )}
        </div>
        <nav className="flex-grow p-4">
          <ul>
            {menuItems.map((item) => (
              <li key={item.label} className="mb-1">
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md hover:bg-gray-100 ${
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
                  <AvatarImage src="https://github.com/shadcn.png" alt="Shadcn" />
                  <AvatarFallback>SC</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Moje konto</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Wyloguj się</DropdownMenuItem>
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
