import { useState } from "react";
import { format } from "date-fns";
import { Edit, CalendarDays } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn, formatTime12h } from "@/lib/utils";
import { Appointment, Service } from "@/types";
import { ReminderMethodToggle } from "@/components/calendar/ReminderMethodToggle";
import { useUser } from "@/contexts/UserContext";

interface EditAppointmentModalProps {
  appointment: Appointment;
  services: Service[];
  onAppointmentUpdate: (updates: Partial<Appointment>) => void;
  trigger?: React.ReactNode;
}

export function EditAppointmentModal({ 
  appointment,
  services, 
  onAppointmentUpdate,
  trigger 
}: EditAppointmentModalProps) {
  const { isFreePlan } = useUser();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>(new Date(appointment.date));
  const [formData, setFormData] = useState({
    clientName: appointment.clientName,
    clientPhone: appointment.clientPhone,
    service: appointment.service,
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    reminderMethod: appointment.reminderMethod
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientName || !formData.clientPhone || !formData.service || !formData.startTime || !formData.endTime) {
      return;
    }

    const updates: Partial<Appointment> = {
      date: format(date, 'yyyy-MM-dd'),
      startTime: formData.startTime,
      endTime: formData.endTime,
      clientName: formData.clientName,
      clientPhone: formData.clientPhone,
      service: formData.service,
      reminderMethod: formData.reminderMethod,
      status: "not-sent"
    };

    onAppointmentUpdate(updates);
    setOpen(false);
  };

  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Appointment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date Selection */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Select value={formData.startTime} onValueChange={(value) => setFormData(prev => ({ ...prev, startTime: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Start time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {formatTime12h(time)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Select value={formData.endTime} onValueChange={(value) => setFormData(prev => ({ ...prev, endTime: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="End time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {formatTime12h(time)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Client Information */}
          <div className="space-y-2">
            <Label>Client Name</Label>
            <Input
              value={formData.clientName}
              onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
              placeholder="Enter client name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Client Phone</Label>
            <Input
              value={formData.clientPhone}
              onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
              placeholder="+1234567890"
              required
            />
          </div>

          {/* Service Selection */}
          <div className="space-y-2">
            <Label>Service</Label>
            <Select value={formData.service} onValueChange={(value) => setFormData(prev => ({ ...prev, service: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.name}>
                    {service.name} ({service.duration}min)
                    {service.price && ` - $${service.price}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reminder Method */}
          <div className="space-y-2">
            <Label>Reminder Method</Label>
            <ReminderMethodToggle
              selected={formData.reminderMethod}
              onChange={(value) => setFormData(prev => ({ ...prev, reminderMethod: value }))}
              disabled={isFreePlan}
            />
            {isFreePlan && (
              <p className="text-xs text-muted-foreground">
                Upgrade to Pro to change reminder methods
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary-hover">
              Update Appointment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
