import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from "date-fns";
import { Appointment } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatTime12h } from "@/lib/utils";

interface MonthViewProps {
  selectedDate: Date;
  appointments: Appointment[];
  onDateSelect: (date: Date) => void;
  onViewChange: (view: "DAY") => void;
}

export function MonthView({ selectedDate, appointments, onDateSelect, onViewChange }: MonthViewProps) {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = [];
  let currentDay = calendarStart;
  
  while (currentDay <= calendarEnd) {
    days.push(currentDay);
    currentDay = addDays(currentDay, 1);
  }

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // FIXED: Normalize appointment dates to match the dateStr format
    const filtered = appointments.filter(apt => {
      const appointmentDate = new Date(apt.date);
      const appointmentDateStr = format(appointmentDate, 'yyyy-MM-dd');
      
      return appointmentDateStr === dateStr;
    });
    
    // Debug logging for the first few dates
    if (Math.random() < 0.1) { // Only log 10% of the time to avoid spam
      console.log('�� MonthView Debug:', {
        dateStr,
        totalAppointments: appointments.length,
        filteredCount: filtered.length,
        sampleAppointmentDates: appointments.slice(0, 3).map(apt => apt.date)
      });
    }
    
    return filtered;
  };
  
  const handleDateClick = (date: Date) => {
    onDateSelect(date);
    onViewChange("DAY");
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="h-full bg-background p-3 md:p-6">
      <div className="grid grid-cols-7 gap-1 h-full">
        {/* Week day headers */}
        {weekDays.map((day) => (
          <div key={day} className="p-1 md:p-2 text-center text-xs md:text-sm font-medium text-muted-foreground border-b">
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day.charAt(0)}</span>
          </div>
        ))}

        {/* Calendar days */}
        {days.map((day, index) => {
          const dayAppointments = getAppointmentsForDate(day);
          const isCurrentMonth = isSameMonth(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          const isSelected = isSameDay(day, selectedDate);

          return (
            <div
              key={day.toISOString()}
              className={`p-1 md:p-2 min-h-16 md:min-h-24 cursor-pointer transition-all hover:bg-muted/50 border-r border-b ${
                !isCurrentMonth ? 'text-muted-foreground bg-muted/20' : ''
              } ${isSelected ? 'ring-2 ring-primary ring-inset' : ''} ${
                isToday ? 'bg-primary/5' : ''
              }`}
              onClick={() => handleDateClick(day)}
            >
              <div className="space-y-1">
                <div className={`text-xs md:text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
                  {format(day, 'd')}
                </div>

                <div className="space-y-1 max-h-10 md:max-h-16 overflow-hidden">
                  {dayAppointments.slice(0, window.innerWidth < 768 ? 1 : 2).map((appointment) => (
                    <div
                      key={appointment.id}
                      className="text-xs p-1 bg-primary/10 rounded truncate"
                      title={`${appointment.startTime} - ${appointment.clientName}: ${appointment.service}`}
                    >
                      <span className="hidden sm:inline">{formatTime12h(appointment.startTime)} {appointment.clientName}</span>
                      <span className="sm:hidden">•</span>
                    </div>
                  ))}
                  {dayAppointments.length > (window.innerWidth < 768 ? 1 : 2) && (
                    <div className="text-xs text-muted-foreground">
                      +{dayAppointments.length - (window.innerWidth < 768 ? 1 : 2)}
                    </div>
                  )}
                </div>

                {dayAppointments.length > 0 && (
                  <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                    {dayAppointments.length}
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}