
import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAdmin } from "@/context/AdminContext";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminProtectedRouteProps {
  requiredRole?: 'admin' | 'editor';
  children?: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ 
  requiredRole = 'editor',
  children 
}) => {
  const { isAuthenticated, loading, isAdmin, isEditor, userRole, logout } = useAdmin();
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  const hasRequiredPermission = () => {
    if (requiredRole === 'admin') {
      return isAdmin;
    }
    return isAdmin || isEditor;
  };

  useEffect(() => {
    if (!loading) {
      setChecked(true);
      
      if (!isAuthenticated) {
        console.log('[SECURITY] User not authenticated, redirecting to login');
        navigate("/admin/login", { replace: true });
        return;
      }
    }
  }, [isAuthenticated, navigate, loading]);

  // Show loading while checking authentication
  if (loading || !checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-pink-500 mx-auto" />
          <p className="mt-4 text-lg text-gray-600">Sprawdzanie uprawnień...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if redirecting
  if (!isAuthenticated) {
    return null;
  }

  // Show access denied if insufficient permissions
  if (!hasRequiredPermission()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <ShieldAlert className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold text-red-600">Brak uprawnień</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Nie masz wystarczających uprawnień aby uzyskać dostęp do tej sekcji.
            </p>
            <p className="text-sm text-gray-500">
              Wymagana rola: <span className="font-medium">{requiredRole}</span>
            </p>
            <p className="text-sm text-gray-500">
              Twoja rola: <span className="font-medium">{userRole || 'user'}</span>
            </p>
            <div className="flex gap-2 justify-center pt-4">
              <Button 
                variant="outline" 
                onClick={() => navigate("/admin/dashboard", { replace: true })}
              >
                Dashboard
              </Button>
              <Button 
                variant="destructive" 
                onClick={logout}
              >
                Wyloguj
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
};

export default AdminProtectedRoute;
