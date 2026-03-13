import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { DayView } from "./calendar/DayView";
import { WeekView } from "./calendar/WeekView";
import { MonthView } from "./calendar/MonthView";
import { YearView } from "./calendar/YearView";
import { NewAppointmentModal } from "./modals/NewAppointmentModal";
import { ServiceManagerModal } from "./modals/ServiceManagerModal";
import { BusinessNameModal } from "./modals/BusinessNameModal";
import { CalendarView, Appointment, Service, Client } from "@/types";
import { createServiceService } from "@/services/serviceService";
import { createClientService } from "@/services/clientService";
import { api, API_BASE_URL } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useAuthenticatedApi } from "@/hooks/useAuthenticatedApi";
import { createAppointmentService } from "@/services/appointmentService";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";

// Helper function to retry API calls with exponential backoff
const fetchWithRetry = async <T,>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 2000
): Promise<T> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      console.log(`Attempt ${i + 1} failed, ${retries - i - 1} retries left`);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  throw new Error('All retries failed');
};

// Wake up server by pinging health endpoint
const wakeUpServer = async (): Promise<boolean> => {
  // API_BASE_URL ends with /api, but health is at root
  const baseUrl = API_BASE_URL.replace('/api', '');
  try {
    console.log('🔄 Waking up server...', baseUrl);
    const response = await fetch(`${baseUrl}/health`, { 
      method: 'GET',
      signal: AbortSignal.timeout(15000)
    });
    console.log('✅ Server is awake');
    return response.ok;
  } catch (e) {
    console.log('⚠️ Server wake-up ping failed, will retry with main requests');
    return false;
  }
};

export function AppLayout() {
  const { toast } = useToast();
  const { authenticatedFetch } = useAuthenticatedApi();
  const { needsBusinessName, updateBusinessName } = useUser();
  
  const appointmentService = useMemo(() => 
    createAppointmentService(authenticatedFetch), 
    [authenticatedFetch]
  );
  
  const clientService = useMemo(() => 
    createClientService(authenticatedFetch), 
    [authenticatedFetch]
  );
  
  const serviceService = useMemo(() => 
    createServiceService(authenticatedFetch), 
    [authenticatedFetch]
  );
  const [currentView, setCurrentView] = useState<CalendarView>("DAY");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const hasLoadedRef = useRef(false);

  // Keep a local open state so the modal can reliably close immediately after save,
  // even if the profile refresh is briefly stale.
  const [businessNameModalOpen, setBusinessNameModalOpen] = useState(false);

  useEffect(() => {
    if (needsBusinessName) setBusinessNameModalOpen(true);
  }, [needsBusinessName]);

  // Load data function with retry logic
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setConnectionError(false);
      console.log('🚀 Starting API calls to backend...');
      
      // First, try to wake up the server
      await wakeUpServer();
      // Give server a moment to fully initialize
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const [appointmentsData, servicesData, clientsData] = await Promise.all([
        fetchWithRetry(() => appointmentService.getAppointments()),
        fetchWithRetry(() => serviceService.getServices()),
        fetchWithRetry(() => clientService.getClients()),
      ]);

      const normalizeArray = <T,>(value: unknown, label: string): T[] => {
        if (Array.isArray(value)) return value as T[];
        console.warn(`⚠️ Unexpected ${label} response (expected array):`, value);
        return [];
      };

      const safeAppointments = normalizeArray<Appointment>(appointmentsData, "appointments");
      const safeServices = normalizeArray<Service>(servicesData, "services");
      const safeClients = normalizeArray<Client>(clientsData, "clients");

      console.log('✅ API calls successful:', {
        appointments: safeAppointments.length,
        services: safeServices.length,
        clients: safeClients.length,
      });

      // Log the actual data structure to debug format issues
      console.log('🔍 Appointments data structure:', safeAppointments);
      if (safeAppointments.length > 0) {
        console.log('🔍 First appointment:', safeAppointments[0]);
      }

      setAppointments(safeAppointments);
      setServices(safeServices);
      setClients(safeClients);
    } catch (error) {
      console.error('❌ API calls failed:', error);
      const { status } = api.handleError(error);

      setConnectionError(true);

      const description =
        status === 401 || status === 403
          ? "Your session may have expired. Please refresh and sign in again."
          : "The server may be starting up. Please wait a moment and click 'Retry'.";

      // Show error state but don't leave user with blank screen
      toast({
        title: "Connection failed",
        description,
        variant: "destructive",
      });

      // Set empty arrays so views can render
      setAppointments([]);
      setServices([]);
      setClients([]);
    } finally {
      setLoading(false);
      console.log('🏁 Data loading completed');
    }
  }, [appointmentService, serviceService, clientService, toast]);

  // Handle business name submission
  const handleBusinessNameSubmit = async (name: string) => {
    try {
      await updateBusinessName(name);
      setBusinessNameModalOpen(false);
      toast({
        title: "Welcome!",
        description: "Your business name has been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save business name. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Initial data load
  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    loadData();
  }, [loadData]);

  // Retry handler
  const handleRetry = useCallback(() => {
    hasLoadedRef.current = false;
    loadData();
  }, [loadData]);

  const handleAppointmentCreate = async (appointmentData: Omit<Appointment, "id">, isNewClient: boolean) => {
    try {
      // If it's a new client, create the client first
      if (isNewClient && appointmentData.clientName && appointmentData.clientPhone) {
        try {
          const newClient = await clientService.createClient({
            name: appointmentData.clientName,
            phone: appointmentData.clientPhone,
          });
          // Add the new client to the local state
          setClients(prev => [...prev, newClient]);
        } catch (clientError) {
          console.error('Error creating client:', clientError);
          // Continue with appointment creation even if client creation fails
        }
      }

      const newAppointment = await appointmentService.createAppointment(appointmentData);
      setAppointments(prev => [...prev, newAppointment]);
      toast({
        title: "Appointment created",
        description: "The appointment has been successfully created.",
      });
    } catch (error) {
      const { error: errorMessage } = api.handleError(error);
      toast({
        title: "Error creating appointment",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleAppointmentUpdate = async (id: string, updates: Partial<Appointment>) => {
    try {
      const updatedAppointment = await appointmentService.updateAppointment(id, updates);
      setAppointments(prev =>
        prev.map(apt => apt.id === id ? updatedAppointment : apt)
      );
      toast({
        title: "Appointment updated",
        description: "The appointment has been successfully updated.",
      });
    } catch (error) {
      const { error: errorMessage } = api.handleError(error);
      toast({
        title: "Error updating appointment",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleAppointmentDelete = async (id: string) => {
    try {
      await appointmentService.deleteAppointment(id);
      setAppointments(prev => prev.filter(apt => apt.id !== id));
      toast({
        title: "Appointment deleted",
        description: "The appointment has been successfully deleted.",
      });
    } catch (error) {
      const { error: errorMessage } = api.handleError(error);
      toast({
        title: "Error deleting appointment",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleServiceCreate = async (serviceData: Omit<Service, "id">) => {
    try {
      const newService = await serviceService.createService(serviceData);
      setServices(prev => [...prev, newService]);
      toast({
        title: "Service created",
        description: "The service has been successfully created.",
      });
    } catch (error) {
      const { error: errorMessage } = api.handleError(error);
      toast({
        title: "Error creating service",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleServiceUpdate = async (id: string, updates: Partial<Service>) => {
    try {
      const updatedService = await serviceService.updateService(id, updates);
      setServices(prev =>
        prev.map(svc => svc.id === id ? updatedService : svc)
      );
      toast({
        title: "Service updated",
        description: "The service has been successfully updated.",
      });
    } catch (error) {
      const { error: errorMessage } = api.handleError(error);
      toast({
        title: "Error updating service",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleServiceDelete = async (id: string) => {
    try {
      await serviceService.deleteService(id);
      setServices(prev => prev.filter(svc => svc.id !== id));
      toast({
        title: "Service deleted",
        description: "The service has been successfully deleted.",
      });
    } catch (error) {
      const { error: errorMessage } = api.handleError(error);
      toast({
        title: "Error deleting service",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleSendReminder = async (id: string) => {
    try {
      await appointmentService.sendReminder(id);
      // Update appointment status to "sent"
      setAppointments(prev =>
        prev.map(apt => apt.id === id ? { ...apt, status: "sent" } : apt)
      );
      toast({
        title: "Reminder sent",
        description: "The appointment reminder has been sent successfully.",
      });
    } catch (error) {
      const { error: errorMessage } = api.handleError(error);
      toast({
        title: "Error sending reminder",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };


  if (connectionError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive font-medium">Connection failed</p>
          <p className="text-sm text-muted-foreground mt-1">
            The server may be starting up. Please wait a moment and try again.
          </p>
          <Button 
            onClick={handleRetry}
            className="mt-4"
          >
            Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-background">
          <AppSidebar
            services={services}
            appointments={appointments}
            onServiceCreate={handleServiceCreate}
            onServiceUpdate={handleServiceUpdate}
            onServiceDelete={handleServiceDelete}
            onNavigateToToday={() => {
              setSelectedDate(new Date());
              setCurrentView("DAY");
            }}
          />
        
        <div className="flex-1 flex flex-col min-w-0">
          <AppHeader 
            currentView={currentView}
            onViewChange={setCurrentView}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onAppointmentCreate={handleAppointmentCreate}
            services={services}
          />
          
          <main className="flex-1 overflow-hidden">
            {currentView === "DAY" && (
              <DayView 
                selectedDate={selectedDate}
                appointments={appointments}
                services={services}
                onAppointmentUpdate={handleAppointmentUpdate}
                onAppointmentDelete={handleAppointmentDelete}
                onSendReminder={handleSendReminder}
              />
            )}
            {currentView === "WEEK" && (
              <WeekView 
                selectedDate={selectedDate}
                appointments={appointments}
                onDateSelect={setSelectedDate}
                onViewChange={() => setCurrentView("DAY")}
              />
            )}
            {currentView === "MONTH" && (
              <MonthView 
                selectedDate={selectedDate}
                appointments={appointments}
                onDateSelect={setSelectedDate}
                onViewChange={() => setCurrentView("DAY")}
              />
            )}
            {currentView === "YEAR" && (
              <YearView 
                selectedDate={selectedDate}
                appointments={appointments}
                onDateSelect={setSelectedDate}
                onViewChange={() => setCurrentView("MONTH")}
              />
            )}
          </main>
        </div>
      </div>
      
      {/* Business Name Modal - shown on first login */}
      <BusinessNameModal 
        open={businessNameModalOpen} 
        onSubmit={handleBusinessNameSubmit} 
      />
    </SidebarProvider>
  );
}
