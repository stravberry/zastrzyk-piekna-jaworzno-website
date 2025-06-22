
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
  FileEdit
} from "lucide-react";

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: BarChart3 },
    { name: "CRM", href: "/admin/crm", icon: Calendar },
    { name: "Posty", href: "/admin/posts", icon: FileText },
    { name: "Galeria", href: "/admin/gallery", icon: Image },
    { name: "Cennik", href: "/admin/pricing", icon: DollarSign },
    { name: "Kontakty", href: "/admin/contacts", icon: Mail },
    { name: "Szablony Email", href: "/admin/email-templates", icon: FileEdit },
    { name: "Analityka", href: "/admin/analytics", icon: BarChart3 },
    { name: "Użytkownicy", href: "/admin/users", icon: Users },
    { name: "Bezpieczeństwo", href: "/admin/security", icon: Shield },
    { name: "Kod", href: "/admin/code-settings", icon: Code },
  ];

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + "/");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r">
        <div className="p-6">
          <Link to="/" className="text-xl font-bold text-pink-600">
            Zastrzyk Piękna
          </Link>
          <p className="text-sm text-gray-500 mt-1">Panel administracyjny</p>
        </div>
        
        <nav className="px-4 space-y-1">
          {navigation.map((item) => {
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
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
