import { format } from "date-fns";
import { Appointment, Service } from "@/types";
import { AppointmentCard } from "./AppointmentCard";
import { DayPanel } from "./DayPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, Users, AlertTriangle } from "lucide-react";

// Helper to detect overlapping appointments
const findOverlappingAppointments = (appointments: Appointment[]): Set<string> => {
  const overlappingIds = new Set<string>();
  
  for (let i = 0; i < appointments.length; i++) {
    for (let j = i + 1; j < appointments.length; j++) {
      const a = appointments[i];
      const b = appointments[j];
      
      const aStart = a.startTime?.replace(':', '') || '0000';
      const aEnd = a.endTime?.replace(':', '') || '0000';
      const bStart = b.startTime?.replace(':', '') || '0000';
      const bEnd = b.endTime?.replace(':', '') || '0000';
      
      if (aStart < bEnd && bStart < aEnd) {
        overlappingIds.add(a.id);
        overlappingIds.add(b.id);
      }
    }
  }
  
  return overlappingIds;
};

interface DayViewProps {
  selectedDate: Date;
  appointments: Appointment[];
  services: Service[];
  onAppointmentUpdate: (id: string, updates: Partial<Appointment>) => void;
  onAppointmentDelete: (id: string) => void;
  onSendReminder: (id: string) => void;
}

export function DayView({ selectedDate, appointments, services, onAppointmentUpdate, onAppointmentDelete, onSendReminder }: DayViewProps) {
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  
  const dayAppointments = appointments.filter(apt => {
    const appointmentDate = new Date(apt.date);
    const appointmentDateStr = format(appointmentDate, 'yyyy-MM-dd');
    return appointmentDateStr === dateStr;
  });

  const updateAppointment = (id: string, updates: Partial<Appointment>) => {
    onAppointmentUpdate(id, updates);
  };

  const overlappingIds = findOverlappingAppointments(dayAppointments);

  const stats = {
    ready: dayAppointments.filter(apt => apt.status === "not-sent").length,
    sent: dayAppointments.filter(apt => apt.status === "sent").length,
    scheduled: dayAppointments.filter(apt => apt.status === "scheduled").length,
    failed: dayAppointments.filter(apt => apt.status === "failed").length,
    canceled: dayAppointments.filter(apt => apt.status === "canceled").length,
    overlapping: overlappingIds.size,
  };

  const handleBulkSend = () => {
    const readyAppointments = dayAppointments.filter(apt => apt.status === "not-sent");
    readyAppointments.forEach(apt => {
      updateAppointment(apt.id, { status: "sent" });
    });
  };

  return (
    <div className="flex flex-col lg:flex-row h-full bg-background">
      {/* Mobile Stats Bar */}
      <div className="lg:hidden p-4 border-b border-border bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">
              {format(selectedDate, 'MMM d')}
            </h2>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {dayAppointments.length}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-success bg-success/10 text-xs">
              {stats.ready}
            </Badge>
            <Badge variant="outline" className="text-primary bg-primary/10 text-xs">
              {stats.sent}
            </Badge>
            {stats.ready > 0 && (
              <Button size="sm" onClick={handleBulkSend} className="ml-2">
                <Send className="h-4 w-4 mr-1" />
                Send
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Appointments Column */}
        <div className="flex-1 p-3 md:p-6 overflow-y-auto">
          <div className="space-y-4">
            {/* Desktop Header */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold">
                  Today's Appointments
                </h2>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {dayAppointments.length} appointments
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-success bg-success/10">
                  Ready: {stats.ready}
                </Badge>
                <Badge variant="outline" className="text-primary bg-primary/10">
                  Sent: {stats.sent}
                </Badge>
                {stats.canceled > 0 && (
                  <Badge variant="outline" className="text-destructive bg-destructive/10">
                    Canceled: {stats.canceled}
                  </Badge>
                )}
                {stats.overlapping > 0 && (
                  <Badge variant="outline" className="text-warning bg-warning/10 border-warning/30">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {stats.overlapping} Overlapping
                  </Badge>
                )}
              </div>
            </div>

            {/* Appointment Cards */}
            <div className="space-y-3">
              {dayAppointments
                .sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''))
                .map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    services={services}
                    onUpdate={(updates) => updateAppointment(appointment.id, updates)}
                    onDelete={() => onAppointmentDelete(appointment.id)}
                    onSendReminder={() => onSendReminder(appointment.id)}
                    isOverlapping={overlappingIds.has(appointment.id)}
                  />
                ))}
              
              {dayAppointments.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No appointments scheduled for {format(selectedDate, 'MMMM d, yyyy')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Hidden on mobile */}
        <div className="hidden lg:block w-80 border-l border-border bg-muted/20">
          <DayPanel
            appointments={dayAppointments}
            onBulkSend={handleBulkSend}
            stats={stats}
          />
        </div>
      </div>
    </div>
  );
}
