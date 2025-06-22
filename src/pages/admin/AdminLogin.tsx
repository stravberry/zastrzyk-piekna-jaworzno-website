
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/context/AdminContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, Shield } from "lucide-react";

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, loading } = useAdmin();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      console.log('[LOGIN] User already authenticated, redirecting to dashboard');
      navigate("/admin/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-2 text-center">
            <div className="flex justify-center">
              <Shield className="h-16 w-16 text-pink-500 mb-2" />
            </div>
            <CardTitle className="text-2xl font-bold text-pink-500">Panel Administracyjny</CardTitle>
            <CardDescription>Sprawdzanie stanu autoryzacji...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[LOGIN] Form submitted');

    setIsLoading(true);

    try {
      if (!email || !password) {
        toast.error("Proszę wprowadzić email i hasło");
        setIsLoading(false);
        return;
      }

      if (!email.includes('@')) {
        toast.error("Proszę wprowadzić prawidłowy adres email");
        setIsLoading(false);
        return;
      }

      console.log('[LOGIN] Attempting login for:', email);
      const success = await login(email, password);
      
      if (success) {
        console.log('[LOGIN] Login successful, redirecting');
        navigate("/admin/dashboard", { replace: true });
      } else {
        console.log('[LOGIN] Login failed');
        toast.error('Nieprawidłowe dane logowania');
      }
    } catch (error) {
      console.error("[LOGIN] Login error:", error);
      toast.error("Wystąpił błąd podczas logowania");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center">
            <Shield className="h-16 w-16 text-pink-500 mb-2" />
          </div>
          <CardTitle className="text-2xl font-bold text-pink-500">Panel Administracyjny</CardTitle>
          <CardDescription>Zaloguj się aby uzyskać dostęp do systemu zarządzania</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email administratora
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@twojadomena.pl"
                autoComplete="email"
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Hasło
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isLoading}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-pink-500 hover:bg-pink-600" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logowanie...
                </>
              ) : "Zaloguj się"}
            </Button>
            
            <div className="text-center text-sm mt-4 space-y-2">
              <p className="text-gray-500">
                Dostęp tylko dla autoryzowanych administratorów
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
