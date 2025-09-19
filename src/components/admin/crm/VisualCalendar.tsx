import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  getDay, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  startOfWeek,
  endOfWeek
} from "date-fns";
import { pl } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface VisualCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const VisualCalendar: React.FC<VisualCalendarProps> = ({ selectedDate, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  // Fetch appointments for the current month
  const { data: monthAppointments } = useQuery({
    queryKey: ['visual-calendar-appointments', format(currentMonth, 'yyyy-MM')],
    queryFn: async () => {
      const startDate = startOfMonth(currentMonth);
      const endDate = endOfMonth(currentMonth);

      const { data, error } = await supabase
        .from('patient_appointments')
        .select(`
          id,
          scheduled_date,
          status
        `)
        .gte('scheduled_date', startDate.toISOString())
        .lte('scheduled_date', endDate.toISOString());

      if (error) throw error;

      // Group appointments by date
      const appointmentsByDate: Record<string, { count: number; statuses: string[] }> = {};
      
      data?.forEach(appointment => {
        const dateKey = format(new Date(appointment.scheduled_date), 'yyyy-MM-dd');
        if (!appointmentsByDate[dateKey]) {
          appointmentsByDate[dateKey] = { count: 0, statuses: [] };
        }
        appointmentsByDate[dateKey].count++;
        appointmentsByDate[dateKey].statuses.push(appointment.status);
      });

      return appointmentsByDate;
    },
  });

  const getDayColor = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayData = monthAppointments?.[dateKey];
    
    if (!dayData || dayData.count === 0) return '';
    
    // Check status priorities: completed > scheduled > cancelled/no_show
    const hasCompleted = dayData.statuses.includes('completed');
    const hasScheduled = dayData.statuses.includes('scheduled');
    const hasCancelled = dayData.statuses.includes('cancelled') || dayData.statuses.includes('no_show');
    
    if (hasCompleted) return 'bg-green-500';
    if (hasScheduled) return 'bg-blue-500';
    if (hasCancelled) return 'bg-red-500';
    
    return 'bg-gray-500';
  };

  const getDayCount = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return monthAppointments?.[dateKey]?.count || 0;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(direction === 'next' ? addMonths(currentMonth, 1) : subMonths(currentMonth, 1));
  };

  // Generate calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start on Monday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  const weekDays = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nie'];

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Kalendarz wizyt
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date())}
              className="text-sm font-medium min-w-[120px]"
            >
              {format(currentMonth, 'LLLL yyyy', { locale: pl })}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Legend */}
        <div className="flex items-center gap-4 mb-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Zakończone</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Zaplanowane</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Anulowane</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Week day headers */}
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map(day => {
            const dayCount = getDayCount(day);
            const dayColor = getDayColor(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            
            return (
              <button
                key={day.toISOString()}
                onClick={() => onDateSelect(day)}
                className={cn(
                  "relative p-2 text-sm font-medium rounded-lg border transition-all duration-200 hover:bg-gray-100",
                  isCurrentMonth ? "text-gray-900" : "text-gray-400",
                  isSelected && "ring-2 ring-blue-500 bg-blue-50",
                  isToday && !isSelected && "bg-gray-100 font-bold",
                  !isCurrentMonth && "hover:bg-gray-50"
                )}
              >
                <span className="relative z-10">{format(day, 'd')}</span>
                
                {/* Appointment indicator */}
                {dayCount > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div 
                      className={cn(
                        "w-6 h-6 rounded-full opacity-20",
                        dayColor
                      )}
                    />
                    {dayCount > 1 && (
                      <div className="absolute top-0 right-0 w-4 h-4 bg-gray-700 text-white text-xs rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1">
                        {dayCount}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Single dot for single appointment */}
                {dayCount === 1 && (
                  <div className="absolute top-1 right-1">
                    <div className={cn("w-2 h-2 rounded-full", dayColor)} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default VisualCalendar;