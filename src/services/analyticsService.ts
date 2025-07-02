
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths, format, parseISO } from "date-fns";

export interface MonthlyStats {
  month: string;
  revenue: number;
  appointments: number;
  newPatients: number;
  completedAppointments: number;
}

export interface TreatmentStats {
  name: string;
  category: string;
  count: number;
  revenue: number;
  averagePrice: number;
}

export interface PatientStats {
  totalPatients: number;
  newPatientsThisMonth: number;
  newPatientsLastMonth: number;
  activePatients: number;
  averageVisitsPerPatient: number;
}

export interface RevenueStats {
  totalRevenue: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  projectedMonthlyRevenue: number;
  averageAppointmentValue: number;
}

export const getMonthlyStats = async (months: number = 12): Promise<MonthlyStats[]> => {
  const results: MonthlyStats[] = [];
  
  for (let i = months - 1; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    
    const { data: appointments } = await supabase
      .from('patient_appointments')
      .select(`
        *,
        patients!inner(created_at)
      `)
      .gte('scheduled_date', start.toISOString())
      .lte('scheduled_date', end.toISOString());

    const revenue = appointments?.reduce((sum, apt) => sum + (Number(apt.cost) || 0), 0) || 0;
    const completedAppointments = appointments?.filter(apt => apt.status === 'completed').length || 0;
    const newPatients = appointments?.filter(apt => {
      const patientCreated = parseISO(apt.patients.created_at);
      return patientCreated >= start && patientCreated <= end;
    }).length || 0;

    results.push({
      month: format(date, 'MMM yyyy'),
      revenue,
      appointments: appointments?.length || 0,
      newPatients,
      completedAppointments
    });
  }
  
  return results;
};

export const getTreatmentStats = async (): Promise<TreatmentStats[]> => {
  const { data: appointments } = await supabase
    .from('patient_appointments')
    .select(`
      cost,
      treatments!inner(name, category)
    `);

  const treatmentMap = new Map<string, {
    name: string;
    category: string;
    count: number;
    revenue: number;
  }>();

  appointments?.forEach(apt => {
    const key = apt.treatments.name;
    const existing = treatmentMap.get(key);
    const revenue = Number(apt.cost) || 0;

    if (existing) {
      existing.count += 1;
      existing.revenue += revenue;
    } else {
      treatmentMap.set(key, {
        name: apt.treatments.name,
        category: apt.treatments.category,
        count: 1,
        revenue
      });
    }
  });

  return Array.from(treatmentMap.values())
    .map(treatment => ({
      ...treatment,
      averagePrice: treatment.count > 0 ? treatment.revenue / treatment.count : 0
    }))
    .sort((a, b) => b.count - a.count);
};

export const getPatientStats = async (): Promise<PatientStats> => {
  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  const [
    { count: totalPatients },
    { count: newPatientsThisMonth },
    { count: newPatientsLastMonth },
    { data: appointments }
  ] = await Promise.all([
    supabase.from('patients').select('*', { count: 'exact', head: true }),
    supabase.from('patients').select('*', { count: 'exact', head: true })
      .gte('created_at', thisMonthStart.toISOString()),
    supabase.from('patients').select('*', { count: 'exact', head: true })
      .gte('created_at', lastMonthStart.toISOString())
      .lte('created_at', lastMonthEnd.toISOString()),
    supabase.from('patient_appointments')
      .select('patient_id')
      .gte('scheduled_date', subMonths(now, 3).toISOString())
  ]);

  const activePatientIds = new Set(appointments?.map(apt => apt.patient_id));
  const averageVisitsPerPatient = totalPatients && appointments ? appointments.length / totalPatients : 0;

  return {
    totalPatients: totalPatients || 0,
    newPatientsThisMonth: newPatientsThisMonth || 0,
    newPatientsLastMonth: newPatientsLastMonth || 0,
    activePatients: activePatientIds.size,
    averageVisitsPerPatient: Math.round(averageVisitsPerPatient * 10) / 10
  };
};

export const getRevenueStats = async (): Promise<RevenueStats> => {
  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  const [
    { data: allAppointments },
    { data: thisMonthAppointments },
    { data: lastMonthAppointments }
  ] = await Promise.all([
    supabase.from('patient_appointments')
      .select('cost')
      .eq('status', 'completed'),
    supabase.from('patient_appointments')
      .select('cost')
      .eq('status', 'completed')
      .gte('scheduled_date', thisMonthStart.toISOString()),
    supabase.from('patient_appointments')
      .select('cost')
      .eq('status', 'completed')
      .gte('scheduled_date', lastMonthStart.toISOString())
      .lte('scheduled_date', lastMonthEnd.toISOString())
  ]);

  const totalRevenue = allAppointments?.reduce((sum, apt) => sum + (Number(apt.cost) || 0), 0) || 0;
  const thisMonthRevenue = thisMonthAppointments?.reduce((sum, apt) => sum + (Number(apt.cost) || 0), 0) || 0;
  const lastMonthRevenue = lastMonthAppointments?.reduce((sum, apt) => sum + (Number(apt.cost) || 0), 0) || 0;

  const averageAppointmentValue = allAppointments?.length ? totalRevenue / allAppointments.length : 0;
  
  // Simple projection based on current month's daily average
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysPassed = now.getDate();
  const projectedMonthlyRevenue = daysPassed > 0 ? (thisMonthRevenue / daysPassed) * daysInMonth : 0;

  return {
    totalRevenue,
    thisMonthRevenue,
    lastMonthRevenue,
    projectedMonthlyRevenue,
    averageAppointmentValue: Math.round(averageAppointmentValue * 100) / 100
  };
};
