import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAdmin } from "@/context/AdminContext";
import { 
  BarChart2, 
  FileText, 
  Settings, 
  LogIn,
  Plus,
  Menu,
  Home,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerClose
} from "@/components/ui/drawer";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const links = [
  { name: "Dashboard", path: "/admin/dashboard", icon: Home },
  { name: "Posty", path: "/admin/posts", icon: FileText },
  { name: "Cennik", path: "/admin/pricing", icon: DollarSign },
];

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const { logout } = useAdmin();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <BarChart2 className="h-5 w-5" /> },
    { name: "Posts", path: "/admin/posts", icon: <FileText className="h-5 w-5" /> },
    { name: "Settings", path: "/admin/settings", icon: <Settings className="h-5 w-5" /> },
  ];

  const NavLinks = () => (
    <ul className="space-y-2">
      {navItems.map((item) => (
        <li key={item.path}>
          <Link
            to={item.path}
            className={`flex items-center space-x-3 px-4 py-2.5 rounded-md transition ${
              location.pathname === item.path
                ? "bg-pink-50 text-pink-500"
                : "text-gray-700 hover:bg-pink-50 hover:text-pink-500"
            }`}
            onClick={() => isMobile && setDrawerOpen(false)}
          >
            {item.icon}
            <span>{item.name}</span>
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="bg-white shadow-sm py-4">
        <div className="container-custom flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {isMobile && (
              <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                <DrawerTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="h-[80%]">
                  <div className="px-4 py-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <img 
                          src="/lovable-uploads/3b19512b-b68a-4530-ac22-e8c824bf3cf3.png" 
                          alt="Zastrzyk Piękna - Logo" 
                          className="h-8"
                        />
                        <span className="ml-2 text-xl font-semibold text-pink-500">Admin</span>
                      </div>
                      <DrawerClose asChild>
                        <Button variant="ghost" size="icon">
                          <LogIn className="h-4 w-4" />
                        </Button>
                      </DrawerClose>
                    </div>
                    <nav>
                      <NavLinks />
                    </nav>
                  </div>
                </DrawerContent>
              </Drawer>
            )}
            
            <Link to="/" className="flex items-center">
              <img 
                src="/lovable-uploads/3b19512b-b68a-4530-ac22-e8c824bf3cf3.png" 
                alt="Zastrzyk Piękna - Logo" 
                className="h-8"
              />
              <span className="ml-2 text-xl font-semibold text-pink-500 hidden sm:inline">Admin</span>
            </Link>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center" 
            onClick={logout}
          >
            <LogIn className="h-4 w-4 mr-0 sm:mr-2" />
            <span className="hidden sm:inline">Wyloguj</span>
          </Button>
        </div>
      </header>
      
      <div className="flex-grow flex">
        {/* Desktop Sidebar */}
        <div className="w-64 bg-white shadow-md hidden md:block">
          <nav className="p-4">
            <NavLinks />
          </nav>
        </div>
        
        {/* Main content */}
        <div className="flex-1 p-4 md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            {location.pathname === "/admin/posts" && (
              <Button asChild className="bg-pink-500 hover:bg-pink-600 w-full sm:w-auto">
                <Link to="/admin/posts/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Nowy Post
                </Link>
              </Button>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
