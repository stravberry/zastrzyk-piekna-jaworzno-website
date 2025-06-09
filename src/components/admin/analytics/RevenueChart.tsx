
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";
import { MonthlyStats } from "@/services/analyticsService";

interface RevenueChartProps {
  data: MonthlyStats[];
  isLoading: boolean;
  compact?: boolean;
}

const chartConfig = {
  revenue: {
    label: "Przychód",
    color: "hsl(var(--chart-1))",
  },
  appointments: {
    label: "Wizyty",
    color: "hsl(var(--chart-2))",
  },
};

const RevenueChart: React.FC<RevenueChartProps> = ({ data, isLoading, compact = false }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <Card className={compact ? "h-72 sm:h-80" : ""}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Przychody miesięczne</CardTitle>
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

  const totalRevenue = data.reduce((sum, month) => sum + month.revenue, 0);
  const averageMonthlyRevenue = data.length > 0 ? totalRevenue / data.length : 0;

  return (
    <Card className={compact ? "h-72 sm:h-80" : ""}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg">Przychody miesięczne</CardTitle>
        <CardDescription className="text-xs sm:text-sm leading-tight">
          <span className="block sm:inline">Łącznie: {formatCurrency(totalRevenue)}</span>
          <span className="hidden sm:inline"> | </span>
          <span className="block sm:inline">Średnio: {formatCurrency(averageMonthlyRevenue)}/miesiąc</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className={compact ? "h-40 sm:h-48" : "h-56 sm:h-72 lg:h-80"}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ 
              top: 5, 
              right: 10, 
              left: 10, 
              bottom: compact ? 5 : 20 
            }}>
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
                tickFormatter={formatCurrency}
                width={compact ? 60 : 80}
              />
              <ChartTooltip 
                content={<ChartTooltipContent 
                  formatter={(value, name) => [
                    name === 'revenue' ? formatCurrency(Number(value)) : value,
                    name === 'revenue' ? 'Przychód' : 'Wizyty'
                  ]}
                />} 
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="var(--color-revenue)" 
                strokeWidth={compact ? 2 : 3}
                dot={{ fill: "var(--color-revenue)", strokeWidth: 2, r: compact ? 3 : 4 }}
                activeDot={{ r: compact ? 5 : 6, stroke: "var(--color-revenue)", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
