
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Calendar, Mail, Shield, Eye, AlertTriangle } from "lucide-react";
import { User } from "@/services/userManagementService";
import UserRoleSelect from "./UserRoleSelect";
import UserManagementModal from "./UserManagementModal";
import { UserRole } from "@/services/auth/userRoles";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

interface UserManagementTableProps {
  users: User[];
  onRoleChange: (userId: string, role: UserRole) => void;
  onRemoveRole: (userId: string, role: UserRole) => Promise<void>;
  canManage: boolean;
  isLoading?: boolean;
}

const UserManagementTable: React.FC<UserManagementTableProps> = ({
  users,
  onRoleChange,
  onRemoveRole,
  canManage,
  isLoading = false
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Filtrowanie użytkowników
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.roles.includes(roleFilter);
    return matchesSearch && matchesRole;
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Nigdy";
    try {
      return format(new Date(dateString), "dd MMM yyyy, HH:mm", { locale: pl });
    } catch {
      return "Nieprawidłowa data";
    }
  };

  const getStatusBadge = (user: User) => {
    if (!user.email_confirmed_at) {
      return (
        <Badge variant="outline" className="text-yellow-600 border-yellow-200">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Niepotwierdzone
        </Badge>
      );
    }
    if (user.last_sign_in_at) {
      return (
        <Badge variant="outline" className="text-green-600 border-green-200">
          Aktywne
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-gray-600 border-gray-200">
        Zarejestrowane
      </Badge>
    );
  };

  const handleUserDetails = (user: User) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleRoleChangeWrapper = async (userId: string, role: UserRole) => {
    onRoleChange(userId, role);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Filtry */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Wyszukaj użytkownika..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 w-full sm:w-auto min-w-0 sm:min-w-[140px]"
          >
            <option value="all">Wszystkie role</option>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="user">User</option>
          </select>
        </div>

        {/* Tabela */}
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <span>Email</span>
                  </div>
                </TableHead>
                <TableHead className="min-w-[120px]">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 flex-shrink-0" />
                    <span>Rola</span>
                  </div>
                </TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="min-w-[140px] hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span>Data utworzenia</span>
                  </div>
                </TableHead>
                <TableHead className="min-w-[140px] hidden lg:table-cell">Ostatnie logowanie</TableHead>
                <TableHead className="min-w-[100px]">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    {searchTerm || roleFilter !== "all" 
                      ? "Nie znaleziono użytkowników pasujących do filtrów"
                      : "Brak użytkowników"
                    }
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell className="font-medium min-w-0">
                      <div className="truncate max-w-[200px] sm:max-w-none" title={user.email}>
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell className="min-w-0">
                      <UserRoleSelect
                        currentRoles={user.roles}
                        userId={user.user_id}
                        onRoleChange={handleRoleChangeWrapper}
                        disabled={!canManage}
                      />
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(user)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="text-sm text-gray-600">
                        {formatDate(user.created_at)}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="text-sm text-gray-600">
                        {formatDate(user.last_sign_in_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUserDetails(user)}
                        className="flex items-center gap-1 whitespace-nowrap"
                      >
                        <Eye className="h-3 w-3 flex-shrink-0" />
                        <span className="hidden sm:inline">Szczegóły</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {filteredUsers.length > 0 && (
          <div className="text-sm text-gray-500 text-center">
            Wyświetlono {filteredUsers.length} z {users.length} użytkowników
          </div>
        )}
      </div>

      <UserManagementModal
        user={selectedUser}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onRoleChange={handleRoleChangeWrapper}
        onRemoveRole={onRemoveRole}
        canManage={canManage}
      />
    </>
  );
};

export default UserManagementTable;
