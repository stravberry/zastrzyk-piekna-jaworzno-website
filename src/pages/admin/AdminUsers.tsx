
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Users, RefreshCw } from "lucide-react";
import UserManagementTable from "@/components/admin/users/UserManagementTable";
import UserInviteDialog from "@/components/admin/users/UserInviteDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  getAllUsers, 
  assignRole, 
  removeRole, 
  canManageUsers,
  User 
} from "@/services/userManagementService";
import { UserRole } from "@/services/auth/userRoles";

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [canManage, setCanManage] = useState(false);
  const navigate = useNavigate();

  // Sprawdź uprawnienia
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const hasPermission = await canManageUsers();
        setCanManage(hasPermission);
        
        if (!hasPermission) {
          toast.error("Brak uprawnień do zarządzania użytkownikami");
          navigate("/admin/dashboard");
          return;
        }
        
        await loadUsers();
      } catch (error) {
        console.error("Error checking permissions:", error);
        toast.error("Wystąpił błąd podczas sprawdzania uprawnień");
        navigate("/admin/dashboard");
      }
    };

    checkPermissions();
  }, [navigate]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const usersData = await getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Wystąpił błąd podczas ładowania użytkowników");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const user = users.find(u => u.user_id === userId);
      if (!user) return;

      const currentHighestRole = user.roles.includes('admin') ? 'admin' : 
                                user.roles.includes('editor') ? 'editor' : 'user';

      // Jeśli nowa rola jest inna niż obecna, zaktualizuj
      if (currentHighestRole !== newRole) {
        // Usuń starą rolę (jeśli nie jest 'user')
        if (currentHighestRole !== 'user') {
          await removeRole(userId, currentHighestRole as UserRole);
        }
        
        // Dodaj nową rolę (jeśli nie jest 'user')
        if (newRole !== 'user') {
          await assignRole(userId, newRole);
        }

        toast.success(`Rola użytkownika została zmieniona na ${newRole}`);
        await loadUsers(); // Odśwież listę
      }
    } catch (error: any) {
      console.error("Error changing user role:", error);
      toast.error(error.message || "Wystąpił błąd podczas zmiany roli użytkownika");
    }
  };

  const handleRemoveRole = async (userId: string, role: UserRole) => {
    try {
      await removeRole(userId, role);
      toast.success(`Rola ${role} została usunięta`);
      await loadUsers();
    } catch (error: any) {
      console.error("Error removing user role:", error);
      toast.error(error.message || "Wystąpił błąd podczas usuwania roli");
    }
  };

  const handleUserInvited = () => {
    loadUsers(); // Odśwież listę po zaproszeniu użytkownika
  };

  if (!canManage) {
    return null; // Nie wyświetlaj nic jeśli brak uprawnień
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 sm:h-6 sm:w-6 text-pink-500 flex-shrink-0" />
          <h2 className="text-lg sm:text-xl font-semibold">Lista użytkowników</h2>
        </div>
        <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={loadUsers}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 w-full xs:w-auto"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden xs:inline">Odśwież</span>
          </Button>
          <UserInviteDialog onUserInvited={handleUserInvited} />
        </div>
      </div>

      {/* Statystyki */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">
              Wszystkich użytkowników
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl sm:text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">
              Administratorzy
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl sm:text-2xl font-bold text-red-600">
              {users.filter(u => u.roles.includes('admin')).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">
              Edytorzy
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">
              {users.filter(u => u.roles.includes('editor')).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">
              Aktywni użytkownicy
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {users.filter(u => u.last_sign_in_at).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela użytkowników */}
      <Card>
        <CardContent className="p-3 sm:p-6">
          <UserManagementTable 
            users={users}
            onRoleChange={handleRoleChange}
            onRemoveRole={handleRemoveRole}
            canManage={canManage}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
