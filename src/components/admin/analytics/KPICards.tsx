
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Users, Calendar, Activity } from "lucide-react";
import { RevenueStats, PatientStats } from "@/services/analyticsService";

interface KPICardsProps {
  revenueStats?: RevenueStats;
  patientStats?: PatientStats;
  isLoading: boolean;
}

const KPICards: React.FC<KPICardsProps> = ({ revenueStats, patientStats, isLoading }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTrendPercentage = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const revenueTrend = revenueStats ? getTrendPercentage(
    revenueStats.thisMonthRevenue, 
    revenueStats.lastMonthRevenue
  ) : 0;

  const patientTrend = patientStats ? getTrendPercentage(
    patientStats.newPatientsThisMonth,
    patientStats.newPatientsLastMonth
  ) : 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="min-h-[120px] sm:min-h-[140px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Ładowanie...</CardTitle>
              <div className="h-3 w-3 sm:h-4 sm:w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="h-6 sm:h-8 bg-gray-200 rounded"></div>
              <div className="h-3 sm:h-4 bg-gray-100 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
      <Card className="min-h-[120px] sm:min-h-[140px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium leading-tight">Przychód tego miesiąca</CardTitle>
          <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-1 sm:space-y-2">
          <div className="text-lg sm:text-2xl font-bold leading-tight">
            {formatCurrency(revenueStats?.thisMonthRevenue || 0)}
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-muted-foreground">
            {revenueTrend >= 0 ? (
              <TrendingUp className="h-2 w-2 sm:h-3 sm:w-3 text-green-500" />
            ) : (
              <TrendingDown className="h-2 w-2 sm:h-3 sm:w-3 text-red-500" />
            )}
            <Badge variant={revenueTrend >= 0 ? "default" : "destructive"} className="text-[10px] sm:text-xs px-1 py-0">
              {revenueTrend >= 0 ? '+' : ''}{revenueTrend}%
            </Badge>
            <span className="text-[10px] sm:text-xs">vs poprzedni</span>
          </div>
        </CardContent>
      </Card>

      <Card className="min-h-[120px] sm:min-h-[140px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium leading-tight">Nowi pacjenci</CardTitle>
          <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-1 sm:space-y-2">
          <div className="text-lg sm:text-2xl font-bold leading-tight">
            {patientStats?.newPatientsThisMonth || 0}
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-muted-foreground">
            {patientTrend >= 0 ? (
              <TrendingUp className="h-2 w-2 sm:h-3 sm:w-3 text-green-500" />
            ) : (
              <TrendingDown className="h-2 w-2 sm:h-3 sm:w-3 text-red-500" />
            )}
            <Badge variant={patientTrend >= 0 ? "default" : "destructive"} className="text-[10px] sm:text-xs px-1 py-0">
              {patientTrend >= 0 ? '+' : ''}{patientTrend}%
            </Badge>
            <span className="text-[10px] sm:text-xs">vs poprzedni</span>
          </div>
        </CardContent>
      </Card>

      <Card className="min-h-[120px] sm:min-h-[140px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium leading-tight">Prognoza miesięczna</CardTitle>
          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-1 sm:space-y-2">
          <div className="text-lg sm:text-2xl font-bold leading-tight">
            {formatCurrency(revenueStats?.projectedMonthlyRevenue || 0)}
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">
            Na podstawie obecnych trendów
          </p>
        </CardContent>
      </Card>

      <Card className="min-h-[120px] sm:min-h-[140px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium leading-tight">Średnia wartość wizyty</CardTitle>
          <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-1 sm:space-y-2">
          <div className="text-lg sm:text-2xl font-bold leading-tight">
            {formatCurrency(revenueStats?.averageAppointmentValue || 0)}
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">
            Aktywni pacjenci: {patientStats?.activePatients || 0}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default KPICards;
