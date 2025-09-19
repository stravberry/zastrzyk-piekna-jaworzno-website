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
  compact?: boolean;
}

const VisualCalendar: React.FC<VisualCalendarProps> = ({ selectedDate, onDateSelect, compact = false }) => {
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
    <Card className={cn("w-full", compact && "max-w-sm")}>
      <CardHeader className={cn("pb-2 px-3 sm:px-6 sm:pb-3", compact && "px-4 pb-2")}>
        <div className="flex items-center justify-between">
          <CardTitle className={cn("text-base sm:text-lg flex items-center gap-2", compact && "text-sm")}>
            <CalendarIcon className={cn("w-4 h-4 sm:w-5 sm:h-5", compact && "w-4 h-4")} />
            <span className={compact ? "hidden" : "hidden sm:inline"}>Kalendarz wizyt</span>
            <span className={compact ? "inline" : "sm:hidden"}>Kalendarz</span>
          </CardTitle>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className={cn("h-7 w-7 p-0 sm:h-8 sm:w-8", compact && "h-6 w-6")}
            >
              <ChevronLeft className={cn("w-3 h-3 sm:w-4 sm:h-4", compact && "w-3 h-3")} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date())}
              className={cn(
                "text-xs sm:text-sm font-medium min-w-[100px] sm:min-w-[120px] h-7 sm:h-8",
                compact && "text-xs min-w-[80px] h-6"
              )}
            >
              {format(currentMonth, compact ? 'MMM yyyy' : 'LLLL yyyy', { locale: pl })}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              className={cn("h-7 w-7 p-0 sm:h-8 sm:w-8", compact && "h-6 w-6")}
            >
              <ChevronRight className={cn("w-3 h-3 sm:w-4 sm:h-4", compact && "w-3 h-3")} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className={cn("pt-0 px-3 sm:px-6", compact && "px-4")}>
        {/* Legend */}
        <div className={cn(
          "flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4 text-xs flex-wrap",
          compact && "gap-1 mb-2"
        )}>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
            <span className={cn("text-xs", compact && "hidden sm:inline")}>Zakończone</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full"></div>
            <span className={cn("text-xs", compact && "hidden sm:inline")}>Zaplanowane</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
            <span className={cn("text-xs", compact && "hidden sm:inline")}>Anulowane</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className={cn("grid grid-cols-7 gap-0.5 sm:gap-1", compact && "gap-0.5")}>
          {/* Week day headers */}
          {weekDays.map(day => (
            <div key={day} className={cn(
              "p-1 sm:p-2 text-center text-xs font-medium text-muted-foreground",
              compact && "p-1 text-xs"
            )}>
              {compact ? day.charAt(0) : day}
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
                  "relative p-1 sm:p-2 text-xs sm:text-sm font-medium rounded border transition-all duration-200 aspect-square hover:bg-muted/50",
                  isCurrentMonth ? "text-foreground" : "text-muted-foreground",
                  isSelected && "ring-2 ring-primary bg-primary/10",
                  isToday && !isSelected && "bg-muted font-bold",
                  !isCurrentMonth && "opacity-50",
                  compact && "p-1 text-xs"
                )}
              >
                <span className="relative z-10">{format(day, 'd')}</span>
                
                {/* Appointment indicator */}
                {dayCount > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div 
                      className={cn(
                        "w-4 h-4 sm:w-6 sm:h-6 rounded-full opacity-20",
                        dayColor
                      )}
                    />
                    {dayCount > 1 && (
                      <div className="absolute -top-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-foreground text-background text-xs rounded-full flex items-center justify-center">
                        <span className="text-xs leading-none">{dayCount}</span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Single dot for single appointment */}
                {dayCount === 1 && (
                  <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1">
                    <div className={cn("w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full", dayColor)} />
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