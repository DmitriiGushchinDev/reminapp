import { Clock, Phone, Edit, Send, CheckCircle, AlertCircle, XCircle, X, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReminderMethodToggle } from "./ReminderMethodToggle";
import { EditAppointmentModal } from "../modals/EditAppointmentModal";
import { Appointment, Service } from "@/types";
import { cn, formatTime12h } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface AppointmentCardProps {
  appointment: Appointment;
  services: Service[];
  onUpdate: (updates: Partial<Appointment>) => void;
  onDelete: () => void;
  onSendReminder: () => Promise<void> | void;
  isOverlapping?: boolean;
}

const getStatusIcon = (status: Appointment["status"]) => {
  switch (status) {
    case "sent":
      return <CheckCircle className="h-4 w-4 text-success" />;
    case "scheduled":
      return <Clock className="h-4 w-4 text-warning" />;
    case "failed":
      return <XCircle className="h-4 w-4 text-destructive" />;
    case "canceled":
      return <X className="h-4 w-4 text-destructive" />;
    default:
      return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
  }
};

const getStatusLabel = (status: Appointment["status"]) => {
  switch (status) {
    case "sent":
      return "Sent";
    case "scheduled":
      return "Scheduled";
    case "failed":
      return "Failed";
    case "canceled":
      return "Canceled";
    default:
      return "Not Sent";
  }
};

const getStatusVariant = (status: Appointment["status"]) => {
  switch (status) {
    case "sent":
      return "default" as const;
    case "scheduled":
      return "secondary" as const;
    case "failed":
      return "destructive" as const;
    case "canceled":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
};

export function AppointmentCard({ appointment, services, onUpdate, onDelete, onSendReminder, isOverlapping = false }: AppointmentCardProps) {
  const { toast } = useToast();

  const handleReminderMethodChange = (method: Appointment["reminderMethod"]) => {
    onUpdate({ reminderMethod: method });
  };

  const handleSendNow = () => {
    toast({
      title: "Coming Soon",
      description: "Send reminders feature will be available soon!",
    });
  };

  const handleCancel = () => {
    onUpdate({ 
      status: "canceled"
    });
  };

  const handleSendCancellation = () => {
    console.log(`Sending cancellation via ${appointment.reminderMethod} to ${appointment.clientPhone}`);
    onUpdate({ cancellationNoticeSent: true });
  };

  return (
    <div className={cn(
      "appointment-card p-3 md:p-4 space-y-3 md:space-y-4 relative",
      appointment.status === 'canceled' && 'opacity-75 bg-destructive/5 border-destructive/20',
      isOverlapping && 'ring-2 ring-warning ring-offset-2 ring-offset-background bg-warning/5 border-warning/30'
    )}>
      {/* Overlap Warning Banner */}
      {isOverlapping && (
        <div className="absolute -top-2 left-4 flex items-center gap-1 px-2 py-0.5 bg-warning text-warning-foreground text-xs font-medium rounded-full shadow-sm">
          <AlertTriangle className="h-3 w-3" />
          <span>Time Conflict</span>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="text-sm font-medium text-primary">
            {formatTime12h(appointment.startTime)}{appointment.endTime ? ` - ${formatTime12h(appointment.endTime)}` : ''}
          </div>
          <div className="flex items-center gap-1">
            {getStatusIcon(appointment.status)}
            <Badge variant={getStatusVariant(appointment.status)} className="text-xs">
              {getStatusLabel(appointment.status)}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <EditAppointmentModal
            appointment={appointment}
            services={services}
            onAppointmentUpdate={onUpdate}
            trigger={
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            }
          />
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onDelete}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Client Info */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
          <h3 className="font-medium text-card-foreground">{appointment.clientName}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Phone className="h-3 w-3" />
            <span className="text-xs sm:text-sm">{appointment.clientPhone}</span>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground">{appointment.service}</p>
      </div>

      {/* Reminder Settings */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="text-sm font-medium">Reminder Method</span>
          <div className="flex items-center gap-2">
            <div className="opacity-50 pointer-events-none">
              <ReminderMethodToggle
                selected={appointment.reminderMethod}
                onChange={handleReminderMethodChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Canceled Message */}
      {appointment.status === "canceled" && (
        <div className="flex items-center justify-center py-2 text-destructive bg-destructive/10 rounded-md">
          <X className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">Appointment has been canceled</span>
        </div>
      )}

      {/* Actions */}
      {appointment.status !== "canceled" && (
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-border/50">
          <Button variant="outline" size="sm" onClick={handleCancel} className="w-full sm:w-auto">
            Cancel
          </Button>
          
          {appointment.status === "not-sent" && (
            <Button 
              size="sm" 
              onClick={handleSendNow} 
              variant="secondary"
              className="w-full sm:w-auto opacity-60 cursor-not-allowed"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Now
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
