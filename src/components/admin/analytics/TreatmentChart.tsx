
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
      <CardContent className="space-y-6 p-4 sm:p-6 pb-8 sm:pb-12">
        <div className={`grid ${compact ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-2'} gap-4 sm:gap-6`}>
          {/* Bar Chart */}
          <div className={compact ? "h-36 xs:h-44 sm:h-48 lg:h-52" : "h-48 sm:h-64 lg:h-72"}>
            <ChartContainer config={chartConfig} className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={processedData} margin={{ 
                  top: 5, 
                  right: 0, 
                  left: 0, 
                  bottom: compact ? 35 : 55 
                }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="shortName" 
                    className="text-[7px] xs:text-[8px] sm:text-[9px] lg:text-[10px]"
                    tick={{ fontSize: compact ? 7 : 9 }}
                    angle={-45}
                    textAnchor="end"
                    height={compact ? 35 : 55}
                    interval={0}
                  />
                  <YAxis 
                    className="text-[7px] xs:text-[8px] sm:text-[9px] lg:text-[10px]"
                    tick={{ fontSize: compact ? 7 : 9 }}
                    width={20}
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
        <div className="space-y-4 mb-6 sm:mb-8">
          <h4 className="text-sm sm:text-base font-medium">Szczegóły zabiegów</h4>
          <div className="space-y-3 max-h-72 sm:max-h-96 overflow-y-auto pr-2">
            {topTreatments.slice(0, compact ? 3 : 5).map((treatment, index) => (
              <div key={treatment.name} className="flex items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg text-xs sm:text-sm gap-4">
                <div className="flex items-start sm:items-center space-x-4 min-w-0 flex-1">
                  <div 
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0 mt-1 sm:mt-0" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="font-medium text-xs sm:text-sm break-words leading-relaxed">{treatment.name}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500 break-words leading-relaxed">{treatment.category}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 space-y-1">
                  <p className="font-medium text-xs sm:text-sm whitespace-nowrap">{treatment.count} zabiegów</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 whitespace-nowrap">{formatCurrency(treatment.revenue)}</p>
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
