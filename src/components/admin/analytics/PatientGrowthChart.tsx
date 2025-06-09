
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { MonthlyStats } from "@/services/analyticsService";

interface PatientGrowthChartProps {
  data: MonthlyStats[];
  isLoading: boolean;
  compact?: boolean;
}

const chartConfig = {
  newPatients: {
    label: "Nowi pacjenci",
    color: "hsl(var(--chart-3))",
  },
  appointments: {
    label: "Wizyty",
    color: "hsl(var(--chart-4))",
  },
};

const PatientGrowthChart: React.FC<PatientGrowthChartProps> = ({ data, isLoading, compact = false }) => {
  if (isLoading) {
    return (
      <Card className={compact ? "h-72 sm:h-80" : ""}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Wzrost bazy pacjentów</CardTitle>
          <CardDescription className="text-sm">Ładowanie danych...</CardDescription>
        </CardHeader>
        <CardContent className={compact ? "h-48 sm:h-56" : "h-56 sm:h-64"}>
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-pink-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalNewPatients = data.reduce((sum, month) => sum + month.newPatients, 0);
  const totalAppointments = data.reduce((sum, month) => sum + month.appointments, 0);

  return (
    <Card className={compact ? "h-72 sm:h-80" : ""}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg">Wzrost bazy pacjentów</CardTitle>
        <CardDescription className="text-xs sm:text-sm leading-tight">
          <span className="block sm:inline">Nowi pacjenci: {totalNewPatients}</span>
          <span className="hidden sm:inline"> | </span>
          <span className="block sm:inline">Łączne wizyty: {totalAppointments}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className={compact ? "h-40 sm:h-48" : "h-56 sm:h-72 lg:h-80"}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ 
              top: 5, 
              right: 10, 
              left: 10, 
              bottom: compact ? 5 : 20 
            }}>
              <defs>
                <linearGradient id="colorNewPatients" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-newPatients)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--color-newPatients)" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-appointments)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--color-appointments)" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                className="text-[10px] sm:text-xs"
                tick={{ fontSize: compact ? 10 : 12 }}
                interval={compact && data.length > 6 ? 1 : 0}
              />
              <YAxis 
                className="text-[10px] sm:text-xs"
                tick={{ fontSize: compact ? 10 : 12 }}
                width={compact ? 40 : 60}
              />
              <ChartTooltip 
                content={<ChartTooltipContent 
                  formatter={(value, name) => [
                    value,
                    name === 'newPatients' ? 'Nowi pacjenci' : 'Wizyty'
                  ]}
                />} 
              />
              <Area
                type="monotone"
                dataKey="newPatients"
                stackId="1"
                stroke="var(--color-newPatients)"
                fillOpacity={1}
                fill="url(#colorNewPatients)"
              />
              <Area
                type="monotone"
                dataKey="appointments"
                stackId="2"
                stroke="var(--color-appointments)"
                fillOpacity={1}
                fill="url(#colorAppointments)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default PatientGrowthChart;
