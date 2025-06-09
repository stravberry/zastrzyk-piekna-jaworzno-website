import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAdmin } from "@/context/AdminContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  Image,
  DollarSign,
  Settings,
  LogOut,
  UserCheck,
  Code,
  Stethoscope,
  BarChart3
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";

interface AdminLayoutProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ title, subtitle, children }) => {
  const { logout } = useAdmin();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'CRM Pacjentów', href: '/admin/crm', icon: Stethoscope },
    { name: 'Analityka', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Posty', href: '/admin/posts', icon: FileText },
    { name: 'Galeria', href: '/admin/gallery', icon: Image },
    { name: 'Cennik', href: '/admin/pricing', icon: DollarSign },
    { name: 'Użytkownicy', href: '/admin/users', icon: UserCheck },
    { name: 'Ustawienia kodu', href: '/admin/settings/code', icon: Code },
  ];

  function AppSidebar() {
    return (
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-center h-16 px-4">
            <h1 className="text-xl font-bold text-pink-600">Panel Admin</h1>
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Aplikacja</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  
                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link to={item.href}>
                          <Icon className="w-5 h-5" />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={logout}>
                <LogOut className="w-4 h-4" />
                <span>Wyloguj się</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-2 sm:px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              {title && (
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold text-gray-900">{title}</h1>
                  {subtitle && (
                    <p className="text-sm text-gray-600 mt-1 hidden sm:block">{subtitle}</p>
                  )}
                </div>
              )}
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <div className="p-2 sm:p-4 lg:p-6">
              {children || <Outlet />}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
