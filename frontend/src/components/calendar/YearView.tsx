import { format, startOfYear, addMonths, getDaysInMonth, startOfMonth, addDays, isSameDay } from "date-fns";
import { Appointment } from "@/types";
import { Card } from "@/components/ui/card";

interface YearViewProps {
  selectedDate: Date;
  appointments: Appointment[];
  onDateSelect: (date: Date) => void;
  onViewChange: (view: "MONTH") => void;
}

export function YearView({ selectedDate, appointments, onDateSelect, onViewChange }: YearViewProps) {
  const yearStart = startOfYear(selectedDate);
  const months = Array.from({ length: 12 }, (_, i) => addMonths(yearStart, i));

  const getAppointmentCountForMonth = (month: Date) => {
    const monthStr = format(month, 'yyyy-MM');
    
    // FIXED: Normalize appointment dates to match the monthStr format
    return appointments.filter(apt => {
      const appointmentDate = new Date(apt.date);
      const appointmentMonthStr = format(appointmentDate, 'yyyy-MM');
      
      return appointmentMonthStr === monthStr;
    }).length;
  };
  

  const getAppointmentCountForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // FIXED: Normalize appointment dates to match the dateStr format
    return appointments.filter(apt => {
      const appointmentDate = new Date(apt.date);
      const appointmentDateStr = format(appointmentDate, 'yyyy-MM-dd');
      
      return appointmentDateStr === dateStr;
    }).length;
  };
  
  const handleMonthClick = (month: Date) => {
    onDateSelect(month);
    onViewChange("MONTH");
  };

  const getIntensityClass = (count: number) => {
    if (count === 0) return '';
    if (count <= 2) return 'bg-primary/20';
    if (count <= 4) return 'bg-primary/40';
    if (count <= 6) return 'bg-primary/60';
    return 'bg-primary/80';
  };

  return (
    <div className="h-full bg-background p-3 md:p-6">
      <div className="text-center mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold">{format(selectedDate, 'yyyy')}</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
        {months.map((month) => {
          const monthAppointments = getAppointmentCountForMonth(month);
          const daysInMonth = getDaysInMonth(month);
          const monthStart = startOfMonth(month);
          
          return (
            <Card
              key={month.toISOString()}
              className="p-3 md:p-4 cursor-pointer transition-all hover:shadow-md"
              onClick={() => handleMonthClick(month)}
            >
              <div className="space-y-2 md:space-y-3">
                <div className="text-center">
                  <h3 className="text-sm font-semibold">{format(month, 'MMM')}</h3>
                  <p className="text-xs text-muted-foreground">
                    {monthAppointments} appointments
                  </p>
                </div>

                {/* Mini calendar grid - Hidden on mobile */}
                <div className="hidden sm:grid grid-cols-7 gap-1">
                  {/* Week headers */}
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                    <div key={i} className="text-xs text-center text-muted-foreground p-1">
                      {day}
                    </div>
                  ))}

                  {/* Days */}
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = addDays(monthStart, i);
                    const dayOfWeek = (day.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
                    const appointmentCount = getAppointmentCountForDay(day);
                    const isToday = isSameDay(day, new Date());

                    return (
                      <div key={i} className="flex justify-center">
                        {i === 0 && Array.from({ length: dayOfWeek }, (_, j) => (
                          <div key={`empty-${j}`} className="w-4 h-4" />
                        ))}
                        <div
                          className={`w-4 h-4 text-xs flex items-center justify-center rounded-sm ${
                            getIntensityClass(appointmentCount)
                          } ${isToday ? 'ring-2 ring-primary' : ''}`}
                          title={`${format(day, 'MMM d')}: ${appointmentCount} appointments`}
                        >
                          {appointmentCount > 0 && (
                            <div className="w-2 h-2 bg-foreground rounded-full" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Mobile intensity indicator */}
                <div className="sm:hidden flex justify-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    getIntensityClass(monthAppointments)
                  } ${monthAppointments > 0 ? 'text-white' : 'text-muted-foreground bg-muted'}`}>
                    {monthAppointments}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}