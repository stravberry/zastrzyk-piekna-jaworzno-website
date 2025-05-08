
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/context/AdminContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check if already authenticated and redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(username, password);
      
      if (success) {
        toast({
          title: "Zalogowano pomyślnie",
          description: "Witaj w panelu administracyjnym",
        });
        navigate("/admin/dashboard");
      } else {
        toast({
          title: "Błąd logowania",
          description: "Nieprawidłowa nazwa użytkownika lub hasło",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Wystąpił błąd",
        description: "Spróbuj ponownie później",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
              <label htmlFor="username" className="text-sm font-medium">
                Nazwa użytkownika
              </label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                autoComplete="username"
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
              {isLoading ? "Logowanie..." : "Zaloguj się"}
            </Button>
            
            <div className="text-center text-sm mt-4">
              <p className="text-gray-500">
                Dane do logowania testowego:
              </p>
              <p className="text-gray-500">
                Login: <span className="font-medium">admin</span> | Hasło: <span className="font-medium">admin123</span>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
