
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { TreatmentStats } from "@/services/analyticsService";

interface TreatmentChartProps {
  data: TreatmentStats[];
  isLoading: boolean;
  compact?: boolean;
}

const chartConfig = {
  count: {
    label: "Liczba zabiegów",
    color: "hsl(var(--chart-5))",
  },
  revenue: {
    label: "Przychód",
    color: "hsl(var(--chart-1))",
  },
};

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const TreatmentChart: React.FC<TreatmentChartProps> = ({ data, isLoading, compact = false }) => {
  if (isLoading) {
    return (
      <Card className={compact ? "h-80" : ""}>
        <CardHeader>
          <CardTitle>Popularność zabiegów</CardTitle>
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

  const topTreatments = data.slice(0, compact ? 5 : 10);
  const totalTreatments = data.reduce((sum, treatment) => sum + treatment.count, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const pieData = topTreatments.slice(0, 5).map((treatment, index) => ({
    name: treatment.name,
    value: treatment.count,
    percentage: Math.round((treatment.count / totalTreatments) * 100),
    fill: COLORS[index % COLORS.length]
  }));

  return (
    <Card className={compact ? "h-80" : ""}>
      <CardHeader>
        <CardTitle>Popularność zabiegów</CardTitle>
        <CardDescription>
          Najczęściej wykonywane zabiegi (Top {topTreatments.length})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`grid ${compact ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'} gap-6`}>
          {/* Bar Chart */}
          <div className={compact ? "h-48" : "h-80"}>
            <ChartContainer config={chartConfig} className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topTreatments} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="name" 
                    className="text-xs"
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fontSize: 12 }}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent 
                      formatter={(value, name) => [
                        value,
                        name === 'count' ? 'Liczba zabiegów' : 'Przychód'
                      ]}
                    />} 
                  />
                  <Bar 
                    dataKey="count" 
                    fill="var(--color-count)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          {/* Pie Chart - only show if not compact */}
          {!compact && (
            <div className="h-80">
              <ChartContainer config={chartConfig} className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip 
                      content={<ChartTooltipContent 
                        formatter={(value, name) => [
                          `${value} zabiegów`,
                          name
                        ]}
                      />} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          )}
        </div>

        {/* Treatment Statistics Table */}
        <div className="mt-6">
          <h4 className="text-sm font-medium mb-3">Szczegóły zabiegów</h4>
          <div className="space-y-2">
            {topTreatments.slice(0, compact ? 3 : 5).map((treatment, index) => (
              <div key={treatment.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <div>
                    <p className="text-sm font-medium">{treatment.name}</p>
                    <p className="text-xs text-gray-500">{treatment.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{treatment.count} zabiegów</p>
                  <p className="text-xs text-gray-500">{formatCurrency(treatment.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TreatmentChart;
