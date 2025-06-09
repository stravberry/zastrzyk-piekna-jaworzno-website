
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
import { Search, Calendar, Mail, Shield } from "lucide-react";
import { User } from "@/services/userManagementService";
import UserRoleSelect from "./UserRoleSelect";
import { UserRole } from "@/services/auth/userRoles";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

interface UserManagementTableProps {
  users: User[];
  onRoleChange: (userId: string, role: UserRole) => void;
  isLoading?: boolean;
}

const UserManagementTable: React.FC<UserManagementTableProps> = ({
  users,
  onRoleChange,
  isLoading = false
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

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
      return <Badge variant="outline" className="text-yellow-600">Niepotwierdzone</Badge>;
    }
    if (user.last_sign_in_at) {
      return <Badge variant="outline" className="text-green-600">Aktywne</Badge>;
    }
    return <Badge variant="outline" className="text-gray-600">Zarejestrowane</Badge>;
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
    <div className="space-y-4">
      {/* Filtry */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
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
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="all">Wszystkie role</option>
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="user">User</option>
        </select>
      </div>

      {/* Tabela */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </TableHead>
              <TableHead className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Rola
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data utworzenia
              </TableHead>
              <TableHead>Ostatnie logowanie</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  {searchTerm || roleFilter !== "all" 
                    ? "Nie znaleziono użytkowników pasujących do filtrów"
                    : "Brak użytkowników"
                  }
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell className="font-medium">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <UserRoleSelect
                      currentRoles={user.roles}
                      userId={user.user_id}
                      onRoleChange={onRoleChange}
                    />
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(user)}
                  </TableCell>
                  <TableCell>
                    {formatDate(user.created_at)}
                  </TableCell>
                  <TableCell>
                    {formatDate(user.last_sign_in_at)}
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
  );
};

export default UserManagementTable;
