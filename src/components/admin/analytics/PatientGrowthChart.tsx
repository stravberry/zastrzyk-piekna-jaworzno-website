
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
      <Card className={compact ? "h-80" : ""}>
        <CardHeader>
          <CardTitle>Wzrost bazy pacjentów</CardTitle>
          <CardDescription>Ładowanie danych...</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalNewPatients = data.reduce((sum, month) => sum + month.newPatients, 0);
  const totalAppointments = data.reduce((sum, month) => sum + month.appointments, 0);

  return (
    <Card className={compact ? "h-80" : ""}>
      <CardHeader>
        <CardTitle>Wzrost bazy pacjentów</CardTitle>
        <CardDescription>
          Nowi pacjenci: {totalNewPatients} | Łączne wizyty: {totalAppointments}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className={compact ? "h-48" : "h-80"}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fontSize: 12 }}
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
