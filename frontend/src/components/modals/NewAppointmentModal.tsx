import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Plus, CalendarDays, Check, ChevronsUpDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn, formatTime12h } from "@/lib/utils";
import { Appointment, Service, Client } from "@/types";
import { ReminderMethodToggle } from "@/components/calendar/ReminderMethodToggle";
import { useAuthenticatedApi } from "@/hooks/useAuthenticatedApi";
import { createClientService } from "@/services/clientService";

interface NewAppointmentModalProps {
  services: Service[];
  selectedDate: Date;
  onAppointmentCreate: (appointment: Omit<Appointment, "id">, isNewClient: boolean) => void;
  trigger?: React.ReactNode;
}

export function NewAppointmentModal({ 
  services, 
  selectedDate, 
  onAppointmentCreate,
  trigger 
}: NewAppointmentModalProps) {
  const { authenticatedFetch } = useAuthenticatedApi();
  const clientService = createClientService(authenticatedFetch);
  
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>(selectedDate);
  const [clientSearch, setClientSearch] = useState("");
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  const [formData, setFormData] = useState({
    clientName: "",
    clientPhone: "",
    service: "",
    startTime: "",
  });

  // Calculate end time based on service duration
  const calculateEndTime = (startTime: string, serviceName: string): string => {
    const service = services.find(s => s.name === serviceName);
    if (!startTime || !service) return "";
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + service.duration;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  const calculatedEndTime = calculateEndTime(formData.startTime, formData.service);

  // Search clients when clientSearch changes
  useEffect(() => {
    const searchClients = async () => {
      if (clientSearch.length > 0) {
        try {
          const results = await clientService.searchClients(clientSearch);
          setClients(results);
        } catch (error) {
          console.error('Error searching clients:', error);
          setClients([]);
        }
      } else {
        setClients([]);
      }
    };

    const timeoutId = setTimeout(searchClients, 300);
    return () => clearTimeout(timeoutId);
  }, [clientSearch, clientService]);

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setFormData(prev => ({
      ...prev,
      clientName: client.name,
      clientPhone: client.phone
    }));
    setClientSearch(client.name);
    setClientDropdownOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientName || !formData.clientPhone || !formData.service || !formData.startTime) {
      return;
    }

    const appointment: Omit<Appointment, "id"> = {
      date: format(date, 'yyyy-MM-dd'),
      startTime: formData.startTime,
      endTime: calculatedEndTime || undefined,
      clientName: formData.clientName,
      clientPhone: formData.clientPhone,
      service: formData.service,
      reminderMethod: "email", // Default - feature coming soon
      template: "", // Templates removed
      status: "not-sent"
    };

    // If no existing client was selected, it's a new client
    const isNewClient = selectedClient === null;

    onAppointmentCreate(appointment, isNewClient);
    setOpen(false);
    
    // Reset form
    setFormData({
      clientName: "",
      clientPhone: "",
      service: "",
      startTime: "",
    });
    setClientSearch("");
    setSelectedClient(null);
    setClients([]);
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
          <Button className="bg-primary hover:bg-primary-hover">
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Appointment</DialogTitle>
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
              <Label>End Time {formData.service && <span className="text-muted-foreground text-xs">(auto-calculated)</span>}</Label>
              <div className="h-10 px-3 py-2 rounded-md border border-input bg-muted/50 text-sm flex items-center">
                {calculatedEndTime ? formatTime12h(calculatedEndTime) : <span className="text-muted-foreground">Select start time & service</span>}
              </div>
            </div>
          </div>

          {/* Client Information */}
          <div className="space-y-2">
            <Label>Client Name</Label>
            <Popover open={clientDropdownOpen} onOpenChange={setClientDropdownOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={clientDropdownOpen}
                  className="w-full justify-between"
                  type="button"
                >
                  {formData.clientName || "Search or enter client name..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput
                    placeholder="Search clients or type new name..."
                    value={clientSearch}
                    onValueChange={(value) => {
                      setClientSearch(value);
                      setFormData(prev => ({ ...prev, clientName: value }));
                      setSelectedClient(null);
                    }}
                  />
                  <CommandList>
                    <CommandEmpty>
                      <div className="p-2">
                        <div className="text-sm text-muted-foreground mb-2">
                          {clientSearch ? `Use "${clientSearch}" as new client` : "Start typing to search or add new client"}
                        </div>
                      </div>
                    </CommandEmpty>
                    <CommandGroup>
                      {clients.map((client) => (
                        <CommandItem
                          key={client.id}
                          value={client.name}
                          onSelect={() => handleClientSelect(client)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedClient?.id === client.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span>{client.name}</span>
                            <span className="text-xs text-muted-foreground">{client.phone}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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

          {/* Reminder Method - Coming Soon */}
          <div className="space-y-2">
            <Label>Reminder Method</Label>
            <ReminderMethodToggle />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary-hover">
              Create Appointment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}