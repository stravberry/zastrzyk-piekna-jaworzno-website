
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/services/auth/userRoles";

export interface User {
  user_id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  roles: string[];
}

// Pobieranie wszystkich użytkowników
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase.rpc('get_all_users_with_roles');
    
    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    throw error;
  }
};

// Przypisywanie roli użytkownikowi
export const assignRole = async (userId: string, role: UserRole): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: role,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error assigning role:', error);
      throw error;
    }

    // Log admin activity
    await supabase.rpc('log_admin_activity', {
      _action: 'assign_role',
      _resource_type: 'user_role',
      _resource_id: userId,
      _details: { role }
    });

    return true;
  } catch (error) {
    console.error('Error in assignRole:', error);
    throw error;
  }
};

// Usuwanie roli użytkownika
export const removeRole = async (userId: string, role: UserRole): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('remove_user_role', {
      target_user_id: userId,
      target_role: role
    });

    if (error) {
      console.error('Error removing role:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in removeRole:', error);
    throw error;
  }
};

// Zapraszanie nowego użytkownika
export const inviteUser = async (email: string, role: UserRole = 'user'): Promise<string> => {
  try {
    const { data, error } = await supabase.rpc('invite_user', {
      user_email: email,
      user_role: role
    });

    if (error) {
      console.error('Error inviting user:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in inviteUser:', error);
    throw error;
  }
};

// Sprawdzanie czy można zarządzać użytkownikami
export const canManageUsers = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('can_manage_users');

    if (error) {
      console.error('Error checking manage users permission:', error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error('Error in canManageUsers:', error);
    return false;
  }
};
