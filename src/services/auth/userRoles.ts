
import { supabase } from "@/integrations/supabase/client";

export type UserRole = 'admin' | 'editor' | 'user';

// Check if current user has a specific role
export const hasRole = async (role: UserRole): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('has_role', {
      _user_id: (await supabase.auth.getUser()).data.user?.id,
      _role: role
    });

    if (error) {
      console.error('Error checking user role:', error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error('Error in hasRole:', error);
    return false;
  }
};

// Get current user's highest role
export const getCurrentUserRole = async (): Promise<UserRole | null> => {
  try {
    const { data, error } = await supabase.rpc('get_current_user_role');

    if (error) {
      console.error('Error getting user role:', error);
      return null;
    }

    return data as UserRole;
  } catch (error) {
    console.error('Error in getCurrentUserRole:', error);
    return null;
  }
};

// Check if current user is admin
export const isAdmin = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('is_admin');

    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error('Error in isAdmin:', error);
    return false;
  }
};

// Assign role to user (admin only)
export const assignUserRole = async (userId: string, role: UserRole): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: role,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error assigning user role:', error);
      return false;
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
    console.error('Error in assignUserRole:', error);
    return false;
  }
};

// Get user role by user ID
export const getUserRole = async (userId: string): Promise<UserRole | null> => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return 'user'; // Default role
    }

    return data.role as UserRole;
  } catch (error) {
    console.error('Error in getUserRole:', error);
    return 'user';
  }
};
