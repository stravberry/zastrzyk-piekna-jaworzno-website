/**
 * Enhanced Patient Security Service
 * Provides secure access to patient medical records with comprehensive audit logging
 */

import { supabase } from "@/integrations/supabase/client";
import { logSecurityEvent } from "./securityService";
import { secureLogger } from "@/utils/secureLogger";

// Patient data interface with security metadata
export interface SecurePatient {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  address?: string;
  date_of_birth?: string;
  skin_type?: string;
  source?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Encrypted sensitive fields
  allergies?: string;
  contraindications?: string;
  medical_notes?: string;
  notes?: string;
}

export interface PatientSearchResult {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  created_at: string;
  last_appointment?: string;
}

/**
 * Search patients using the secure search function with audit logging
 */
export const searchPatientsSecure = async (searchTerm: string): Promise<PatientSearchResult[]> => {
  try {
    // Input validation
    if (!searchTerm || searchTerm.trim().length < 2) {
      throw new Error('Search term must be at least 2 characters long');
    }

    // Sanitize search term
    const sanitizedTerm = searchTerm.slice(0, 100).replace(/[^a-zA-Z0-9\s@.-]/g, '');
    
    // Call secure search function
    const { data, error } = await supabase.rpc('search_patients_secure', {
      search_term: sanitizedTerm
    });

    if (error) {
      await logSecurityEvent('patient_search_error', 'high', {
        error: error.message,
        search_term_length: sanitizedTerm.length,
        timestamp: new Date().toISOString()
      });
      throw error;
    }

    // Log successful search
    await logSecurityEvent('patient_search_success', 'medium', {
      results_count: data?.length || 0,
      search_term_length: sanitizedTerm.length,
      timestamp: new Date().toISOString()
    });

    return data || [];
  } catch (error) {
    console.error('Secure patient search failed:', error);
    await logSecurityEvent('patient_search_failure', 'high', {
      error: error instanceof Error ? error.message : 'Unknown error',
      search_term_length: searchTerm?.length || 0,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
};

/**
 * Get a single patient's full record using the secure function
 */
export const getPatientSecure = async (patientId: string): Promise<SecurePatient | null> => {
  try {
    if (!patientId) {
      throw new Error('Patient ID is required');
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(patientId)) {
      throw new Error('Invalid patient ID format');
    }

    // Call secure patient function
    const { data, error } = await supabase.rpc('get_patient_secure', {
      patient_id: patientId
    });

    if (error) {
      await logSecurityEvent('patient_access_error', 'critical', {
        patient_id: patientId,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }

    if (!data || data.length === 0) {
      await logSecurityEvent('patient_not_found', 'medium', {
        patient_id: patientId,
        timestamp: new Date().toISOString()
      });
      return null;
    }

    // Log successful access
    await logSecurityEvent('patient_record_accessed', 'high', {
      patient_id: patientId,
      timestamp: new Date().toISOString(),
      access_method: 'get_patient_secure'
    });

    return data[0];
  } catch (error) {
    console.error('Secure patient access failed:', error);
    await logSecurityEvent('patient_access_failure', 'critical', {
      patient_id: patientId,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    throw error;
  }
};

/**
 * Create a new patient record with security validation
 */
export const createPatientSecure = async (patientData: Partial<SecurePatient>): Promise<SecurePatient> => {
  try {
    // Input validation
    if (!patientData.first_name || !patientData.last_name) {
      throw new Error('First name and last name are required');
    }

    // Sanitize input data
    const sanitizedData: any = {
      ...patientData,
      first_name: patientData.first_name.slice(0, 100),
      last_name: patientData.last_name.slice(0, 100),
      email: patientData.email?.slice(0, 255),
      phone: patientData.phone?.slice(0, 20),
      address: patientData.address?.slice(0, 500),
      allergies: patientData.allergies?.slice(0, 1000),
      contraindications: patientData.contraindications?.slice(0, 1000),
      medical_notes: patientData.medical_notes?.slice(0, 2000),
      notes: patientData.notes?.slice(0, 1000)
    };

    // Create patient record (encryption will be handled by trigger)
    const { data, error } = await supabase
      .from('patients')
      .insert(sanitizedData)
      .select()
      .single();

    if (error) {
      await logSecurityEvent('patient_creation_error', 'high', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }

    // Log successful creation
    await logSecurityEvent('patient_record_created', 'high', {
      patient_id: data.id,
      timestamp: new Date().toISOString()
    });

    return data;
  } catch (error) {
    console.error('Secure patient creation failed:', error);
    await logSecurityEvent('patient_creation_failure', 'critical', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    throw error;
  }
};

/**
 * Update patient record with security validation
 */
export const updatePatientSecure = async (
  patientId: string, 
  updates: Partial<SecurePatient>
): Promise<SecurePatient> => {
  try {
    if (!patientId) {
      throw new Error('Patient ID is required');
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(patientId)) {
      throw new Error('Invalid patient ID format');
    }

    // Sanitize update data
    const sanitizedUpdates: any = {
      ...updates,
      first_name: updates.first_name?.slice(0, 100),
      last_name: updates.last_name?.slice(0, 100),
      email: updates.email?.slice(0, 255),
      phone: updates.phone?.slice(0, 20),
      address: updates.address?.slice(0, 500),
      allergies: updates.allergies?.slice(0, 1000),
      contraindications: updates.contraindications?.slice(0, 1000),
      medical_notes: updates.medical_notes?.slice(0, 2000),
      notes: updates.notes?.slice(0, 1000),
      updated_at: new Date().toISOString()
    };

    // Update patient record (encryption will be handled by trigger)
    const { data, error } = await supabase
      .from('patients')
      .update(sanitizedUpdates)
      .eq('id', patientId)
      .select()
      .single();

    if (error) {
      await logSecurityEvent('patient_update_error', 'high', {
        patient_id: patientId,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }

    // Log successful update
    await logSecurityEvent('patient_record_updated', 'high', {
      patient_id: patientId,
      fields_updated: Object.keys(sanitizedUpdates),
      timestamp: new Date().toISOString()
    });

    return data;
  } catch (error) {
    console.error('Secure patient update failed:', error);
    await logSecurityEvent('patient_update_failure', 'critical', {
      patient_id: patientId,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    throw error;
  }
};

/**
 * Log emergency access to patient records
 */
export const logEmergencyPatientAccess = async (
  patientId: string,
  reason: string,
  overrideUser?: string
): Promise<void> => {
  try {
    const { error } = await supabase.rpc('log_emergency_patient_access', {
      patient_id: patientId,
      reason: reason.slice(0, 500), // Limit reason length
      override_user: overrideUser || null
    });

    if (error) {
      console.error('Failed to log emergency access:', error);
    }
  } catch (error) {
    console.error('Emergency access logging failed:', error);
  }
};

/**
 * Validate if current user can access patient data
 */
export const validatePatientAccess = async (): Promise<boolean> => {
  try {
    // Use enhanced validation function
    const { data, error } = await supabase.rpc('validate_patient_access_session_enhanced');
    
    if (error) {
      secureLogger.error('Failed to validate patient access', { error: error.message });
      return false;
    }
    
    return data === true;
  } catch (error) {
    secureLogger.error('Error validating patient access', { error });
    return false;
  }
};