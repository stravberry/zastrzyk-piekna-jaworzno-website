
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  Activity,
  BarChart3
} from "lucide-react";
import { 
  getMonthlyStats, 
  getTreatmentStats, 
  getPatientStats, 
  getRevenueStats 
} from "@/services/analyticsService";
import RevenueChart from "@/components/admin/analytics/RevenueChart";
import TreatmentChart from "@/components/admin/analytics/TreatmentChart";
import KPICards from "@/components/admin/analytics/KPICards";
import PatientGrowthChart from "@/components/admin/analytics/PatientGrowthChart";

const AdminAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState("12");

  const { data: monthlyStats, isLoading: monthlyLoading } = useQuery({
    queryKey: ['monthly-stats', timeRange],
    queryFn: () => getMonthlyStats(parseInt(timeRange))
  });

  const { data: treatmentStats, isLoading: treatmentLoading } = useQuery({
    queryKey: ['treatment-stats'],
    queryFn: getTreatmentStats
  });

  const { data: patientStats, isLoading: patientLoading } = useQuery({
    queryKey: ['patient-stats'],
    queryFn: getPatientStats
  });

  const { data: revenueStats, isLoading: revenueLoading } = useQuery({
    queryKey: ['revenue-stats'],
    queryFn: getRevenueStats
  });

  const isLoading = monthlyLoading || treatmentLoading || patientLoading || revenueLoading;

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analityka i Statystyki</h1>
          <p className="text-sm sm:text-base text-gray-600">Dashboard analityczny dla kliniki</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Wybierz okres" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6">Ostatnie 6 miesięcy</SelectItem>
            <SelectItem value="12">Ostatni rok</SelectItem>
            <SelectItem value="24">Ostatnie 2 lata</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <KPICards 
        revenueStats={revenueStats}
        patientStats={patientStats}
        isLoading={isLoading}
      />

      {/* Main Charts */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="revenue">
            <DollarSign className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Przychody</span>
            <span className="sm:hidden">PLN</span>
          </TabsTrigger>
          <TabsTrigger value="patients">
            <Users className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Pacjenci</span>
            <span className="sm:hidden">PAC</span>
          </TabsTrigger>
          <TabsTrigger value="treatments">
            <Activity className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Zabiegi</span>
            <span className="sm:hidden">ZAB</span>
          </TabsTrigger>
          <TabsTrigger value="overview">
            <BarChart3 className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Przegląd</span>
            <span className="sm:hidden">PRZ</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <RevenueChart 
            data={monthlyStats || []}
            isLoading={monthlyLoading}
          />
        </TabsContent>

        <TabsContent value="patients" className="space-y-6">
          <PatientGrowthChart 
            data={monthlyStats || []}
            isLoading={monthlyLoading}
          />
        </TabsContent>

        <TabsContent value="treatments" className="space-y-6">
          <TreatmentChart 
            data={treatmentStats || []}
            isLoading={treatmentLoading}
          />
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueChart 
              data={monthlyStats || []}
              isLoading={monthlyLoading}
              compact
            />
            <PatientGrowthChart 
              data={monthlyStats || []}
              isLoading={monthlyLoading}
              compact
            />
          </div>
          <TreatmentChart 
            data={treatmentStats || []}
            isLoading={treatmentLoading}
            compact
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalytics;
