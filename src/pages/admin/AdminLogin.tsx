
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/context/AdminContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState("admin@example.com"); // Pre-fill with test account
  const [password, setPassword] = useState("Admin123!"); // Pre-fill with test password
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, loading } = useAdmin();
  const navigate = useNavigate();
  
  // Check if already authenticated and redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate("/admin/dashboard");
    }
  }, [isAuthenticated, navigate, loading]);

  // If still loading auth state, show loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-2 text-center">
            <div className="flex justify-center">
              <img 
                src="/lovable-uploads/3b19512b-b68a-4530-ac22-e8c824bf3cf3.png" 
                alt="Zastrzyk Piękna - Logo" 
                className="h-16 mb-2"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-pink-500">Panel Administracyjny</CardTitle>
            <CardDescription>Ładowanie...</CardDescription>
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
    setIsLoading(true);

    try {
      // Validate inputs
      if (!email || !password) {
        toast.error("Proszę wprowadzić email i hasło");
        setIsLoading(false);
        return;
      }

      const success = await login(email, password);
      
      if (success) {
        navigate("/admin/dashboard");
      } else {
        // This should not happen as errors should be caught in login function
        toast.error("Nie udało się zalogować. Spróbuj ponownie.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Wystąpił błąd podczas logowania");
    } finally {
      setIsLoading(false);
    }
  };

  const fillTestCredentials = () => {
    setEmail("admin@example.com");
    setPassword("Admin123!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center">
            <img 
              src="/lovable-uploads/3b19512b-b68a-4530-ac22-e8c824bf3cf3.png" 
              alt="Zastrzyk Piękna - Logo" 
              className="h-16 mb-2"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-pink-500">Panel Administracyjny</CardTitle>
          <CardDescription>Zaloguj się, aby zarządzać treścią bloga</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Hasło
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
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
            
            <div className="text-center text-sm mt-4">
              <p className="text-gray-500">
                Aby zalogować się do panelu, musisz najpierw stworzyć konto w Supabase
              </p>
              <p className="text-gray-500 font-medium mt-2">
                Kliknij <Button onClick={fillTestCredentials} variant="link" className="h-auto p-0 text-pink-500">tutaj</Button> aby wypełnić formularz danymi testowymi
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
