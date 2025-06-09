
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
      <Card className={compact ? "h-80" : ""}>
        <CardHeader>
          <CardTitle>Przychody miesięczne</CardTitle>
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

  const totalRevenue = data.reduce((sum, month) => sum + month.revenue, 0);
  const averageMonthlyRevenue = data.length > 0 ? totalRevenue / data.length : 0;

  return (
    <Card className={compact ? "h-80" : ""}>
      <CardHeader>
        <CardTitle>Przychody miesięczne</CardTitle>
        <CardDescription>
          Łącznie: {formatCurrency(totalRevenue)} | 
          Średnio: {formatCurrency(averageMonthlyRevenue)}/miesiąc
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className={compact ? "h-48" : "h-80"}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fontSize: 12 }}
                tickFormatter={formatCurrency}
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
                strokeWidth={3}
                dot={{ fill: "var(--color-revenue)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "var(--color-revenue)", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
