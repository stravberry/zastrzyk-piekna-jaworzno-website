
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
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 max-w-7xl">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Analityka i Statystyki</h1>
            <p className="text-sm sm:text-base text-gray-600">Dashboard analityczny dla kliniki</p>
          </div>
          <div className="w-full sm:w-auto">
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
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards 
        revenueStats={revenueStats}
        patientStats={patientStats}
        isLoading={isLoading}
      />

      {/* Main Charts */}
      <Tabs defaultValue="revenue" className="space-y-4 sm:space-y-6">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-4 min-w-max sm:min-w-0">
            <TabsTrigger value="revenue" className="text-xs sm:text-sm">
              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline sm:hidden">PLN</span>
              <span className="hidden sm:inline">Przychody</span>
            </TabsTrigger>
            <TabsTrigger value="patients" className="text-xs sm:text-sm">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline sm:hidden">PAC</span>
              <span className="hidden sm:inline">Pacjenci</span>
            </TabsTrigger>
            <TabsTrigger value="treatments" className="text-xs sm:text-sm">
              <Activity className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline sm:hidden">ZAB</span>
              <span className="hidden sm:inline">Zabiegi</span>
            </TabsTrigger>
            <TabsTrigger value="overview" className="text-xs sm:text-sm">
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline sm:hidden">PRZ</span>
              <span className="hidden sm:inline">Przegląd</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="revenue" className="space-y-4 sm:space-y-6">
          <RevenueChart 
            data={monthlyStats || []}
            isLoading={monthlyLoading}
          />
        </TabsContent>

        <TabsContent value="patients" className="space-y-4 sm:space-y-6">
          <PatientGrowthChart 
            data={monthlyStats || []}
            isLoading={monthlyLoading}
          />
        </TabsContent>

        <TabsContent value="treatments" className="space-y-4 sm:space-y-6">
          <TreatmentChart 
            data={treatmentStats || []}
            isLoading={treatmentLoading}
          />
        </TabsContent>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
          <div className="w-full">
            <TreatmentChart 
              data={treatmentStats || []}
              isLoading={treatmentLoading}
              compact
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalytics;
