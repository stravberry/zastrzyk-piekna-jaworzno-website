
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UserRole } from "@/services/auth/userRoles";
import { User } from "@/services/userManagementService";
import { Badge } from "@/components/ui/badge";
import { Trash2, Shield, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const userEditSchema = z.object({
  email: z.string().email("Invalid email format"),
  role: z.enum(['admin', 'editor', 'user']),
});

type UserEditData = z.infer<typeof userEditSchema>;

interface UserManagementModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onRoleChange: (userId: string, role: UserRole) => Promise<void>;
  onRemoveRole: (userId: string, role: UserRole) => Promise<void>;
  canManage: boolean;
}

const UserManagementModal: React.FC<UserManagementModalProps> = ({
  user,
  isOpen,
  onClose,
  onRoleChange,
  onRemoveRole,
  canManage
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<UserEditData>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      email: user?.email || "",
      role: (user?.roles?.[0] as UserRole) || 'user'
    }
  });

  React.useEffect(() => {
    if (user) {
      form.reset({
        email: user.email,
        role: (user.roles?.[0] as UserRole) || 'user'
      });
    }
  }, [user, form]);

  const handleRoleChange = async (newRole: UserRole) => {
    if (!user || !canManage) return;
    
    setIsLoading(true);
    try {
      await onRoleChange(user.user_id, newRole);
      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      toast.error("Failed to update user role");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveRole = async (role: UserRole) => {
    if (!user || !canManage) return;
    
    if (role === 'admin' && user.roles.filter(r => r === 'admin').length <= 1) {
      toast.error("Cannot remove the last admin user");
      return;
    }
    
    setIsLoading(true);
    try {
      await onRemoveRole(user.user_id, role);
      toast.success(`Removed ${role} role from user`);
    } catch (error) {
      toast.error("Failed to remove user role");
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'editor': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'user': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadge = () => {
    if (!user) return null;
    
    if (!user.email_confirmed_at) {
      return <Badge variant="outline" className="text-yellow-600 border-yellow-200">Email Not Confirmed</Badge>;
    }
    if (user.last_sign_in_at) {
      return <Badge variant="outline" className="text-green-600 border-green-200">Active</Badge>;
    }
    return <Badge variant="outline" className="text-gray-600 border-gray-200">Registered</Badge>;
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Manage User: {user.email}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <div>{getStatusBadge()}</div>
          </div>

          {/* Current Roles */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Roles</label>
            <div className="flex flex-wrap gap-2">
              {user.roles.map((role) => (
                <div key={role} className="flex items-center gap-1">
                  <Badge className={getRoleBadgeColor(role)}>
                    {role}
                  </Badge>
                  {canManage && role !== 'user' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveRole(role as UserRole)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Role Management */}
          {canManage && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Change Role</label>
              <Select 
                value={user.roles[0] || 'user'} 
                onValueChange={handleRoleChange}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Security Warning for Admin Changes */}
          {user.roles.includes('admin') && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">Admin User</span>
              </div>
              <p className="text-xs text-amber-700 mt-1">
                This user has administrative privileges. Changes to admin roles should be made carefully.
              </p>
            </div>
          )}

          {/* User Details */}
          <div className="space-y-2 pt-2 border-t">
            <div className="text-xs text-gray-500">
              <div>Created: {new Date(user.created_at).toLocaleDateString()}</div>
              {user.last_sign_in_at && (
                <div>Last login: {new Date(user.last_sign_in_at).toLocaleDateString()}</div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserManagementModal;
