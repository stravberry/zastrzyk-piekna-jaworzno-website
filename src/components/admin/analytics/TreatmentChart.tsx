
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
      <Card className={compact ? "h-72 sm:h-80" : ""}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Popularność zabiegów</CardTitle>
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

  // Truncate treatment names for mobile
  const truncateName = (name: string, maxLength: number) => {
    return name.length > maxLength ? name.substring(0, maxLength) + '...' : name;
  };

  const processedData = topTreatments.map(treatment => ({
    ...treatment,
    shortName: truncateName(treatment.name, compact ? 15 : 20)
  }));

  return (
    <Card className={compact ? "h-72 sm:h-80" : ""}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg">Popularność zabiegów</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Najczęściej wykonywane zabiegi (Top {topTreatments.length})
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-6">
        <div className={`grid ${compact ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-2'} gap-4 sm:gap-6`}>
          {/* Bar Chart */}
          <div className={compact ? "h-28 sm:h-36 lg:h-40" : "h-40 sm:h-56 lg:h-64"}>
            <ChartContainer config={chartConfig} className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={processedData} margin={{ 
                  top: 5, 
                  right: compact ? 5 : 10, 
                  left: compact ? 5 : 10, 
                  bottom: compact ? 30 : 50 
                }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="shortName" 
                    className="text-[8px] sm:text-[9px] lg:text-[10px]"
                    tick={{ fontSize: compact ? 7 : 9 }}
                    angle={-45}
                    textAnchor="end"
                    height={compact ? 30 : 50}
                    interval={0}
                  />
                  <YAxis 
                    className="text-[8px] sm:text-[9px] lg:text-[10px]"
                    tick={{ fontSize: compact ? 8 : 10 }}
                    width={compact ? 25 : 35}
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
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          {/* Pie Chart - only show if not compact and on larger screens */}
          {!compact && (
            <div className="hidden xl:block h-48 sm:h-64 lg:h-72">
              <ChartContainer config={chartConfig} className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percentage }) => `${percentage}%`}
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
        <div className="space-y-2 sm:space-y-3">
          <h4 className="text-xs sm:text-sm font-medium">Szczegóły zabiegów</h4>
          <div className="space-y-1 sm:space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
            {topTreatments.slice(0, compact ? 3 : 5).map((treatment, index) => (
              <div key={treatment.name} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded text-xs sm:text-sm">
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                  <div 
                    className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{treatment.name}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500 truncate">{treatment.category}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="font-medium">{treatment.count} zabiegów</p>
                  <p className="text-[10px] sm:text-xs text-gray-500">{formatCurrency(treatment.revenue)}</p>
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
