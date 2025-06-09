
import React from "react";
import { UserRole } from "@/services/auth/userRoles";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserRoleSelectProps {
  currentRoles: string[];
  userId: string;
  onRoleChange: (userId: string, role: UserRole) => void;
  disabled?: boolean;
}

const UserRoleSelect: React.FC<UserRoleSelectProps> = ({
  currentRoles,
  userId,
  onRoleChange,
  disabled = false
}) => {
  // Znajdź najwyższą rolę użytkownika
  const getHighestRole = (roles: string[]): UserRole => {
    if (roles.includes('admin')) return 'admin';
    if (roles.includes('editor')) return 'editor';
    return 'user';
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'editor': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const currentRole = getHighestRole(currentRoles);

  return (
    <div className="flex items-center gap-2">
      <Badge className={getRoleBadgeColor(currentRole)}>
        {currentRole}
      </Badge>
      {!disabled && (
        <Select
          value={currentRole}
          onValueChange={(value: UserRole) => onRoleChange(userId, value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default UserRoleSelect;
