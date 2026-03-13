import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { Appointment } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTime12h } from "@/lib/utils";

interface WeekViewProps {
  selectedDate: Date;
  appointments: Appointment[];
  onDateSelect: (date: Date) => void;
  onViewChange: (view: "DAY") => void;
}

export function WeekView({ selectedDate, appointments, onDateSelect, onViewChange }: WeekViewProps) {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Start with Monday
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // FIXED: Normalize appointment dates to match the dateStr format
    return appointments.filter(apt => {
      const appointmentDate = new Date(apt.date);
      const appointmentDateStr = format(appointmentDate, 'yyyy-MM-dd');
      
      return appointmentDateStr === dateStr;
    });
  };
  
  const handleDateClick = (date: Date) => {
    onDateSelect(date);
    onViewChange("DAY");
  };

  return (
    <div className="h-full bg-background p-3 md:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-7 gap-3 md:gap-4 h-full">
        {days.map((day) => {
          const dayAppointments = getAppointmentsForDate(day);
          const isToday = isSameDay(day, new Date());
          const isSelected = isSameDay(day, selectedDate);

          return (
            <Card 
              key={day.toISOString()} 
              className={`p-3 md:p-4 cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary' : ''
              } ${isToday ? 'bg-primary/5 border-primary/20' : ''}`}
              onClick={() => handleDateClick(day)}
            >
              <div className="space-y-2 md:space-y-3">
                <div className="text-center">
                  <div className="text-xs md:text-sm font-medium text-muted-foreground">
                    {format(day, 'EEE')}
                  </div>
                  <div className={`text-base md:text-lg font-semibold ${isToday ? 'text-primary' : ''}`}>
                    {format(day, 'd')}
                  </div>
                </div>

                <div className="space-y-1 md:space-y-2 max-h-64 md:max-h-96 overflow-y-auto">
                  {dayAppointments.length === 0 ? (
                    <div className="text-xs text-muted-foreground text-center py-2">
                      No appointments
                    </div>
                  ) : (
                    dayAppointments
                      .sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''))
                      .slice(0, window.innerWidth < 768 ? 2 : 5)
                      .map((appointment) => (
                        <div
                          key={appointment.id}
                          className="p-2 bg-muted/50 rounded-lg space-y-1"
                        >
                          <div className="text-xs font-medium truncate">
                            <span className="hidden sm:inline">{formatTime12h(appointment.startTime)} - </span>
                            {appointment.clientName}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {appointment.service}
                          </div>
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                appointment.reminderMethod === "whatsapp" ? "border-whatsapp/50 text-whatsapp" :
                                appointment.reminderMethod === "telegram" ? "border-telegram/50 text-telegram" :
                                appointment.reminderMethod === "sms" ? "border-sms/50 text-sms" :
                                "border-email/50 text-email"
                              }`}
                            >
                              {appointment.reminderMethod.charAt(0).toUpperCase()}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                appointment.status === "sent" ? "border-success/50 text-success" :
                                appointment.status === "scheduled" ? "border-primary/50 text-primary" :
                                appointment.status === "failed" ? "border-destructive/50 text-destructive" :
                                appointment.status === "canceled" ? "border-destructive/50 text-destructive" :
                                "border-warning/50 text-warning"
                              }`}
                            >
                              {appointment.status === "not-sent" ? "Ready" : appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      ))
                  )}
                  {dayAppointments.length > (window.innerWidth < 768 ? 2 : 5) && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{dayAppointments.length - (window.innerWidth < 768 ? 2 : 5)} more
                    </div>
                  )}
                </div>

                {dayAppointments.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDateClick(day);
                    }}
                  >
                    View Day ({dayAppointments.length})
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}