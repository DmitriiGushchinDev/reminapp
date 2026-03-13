import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Filter, MessageSquare, Phone, Mail, Send, FileText, TrendingUp, DollarSign, Lock, CreditCard } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ServiceManagerModal } from "./modals/ServiceManagerModal";
import { RevenueModal } from "./modals/RevenueModal";
import { mockServices } from "@/data/mockData";
import { Service, Appointment } from "@/types";

interface AppSidebarProps {
  services: Service[];
  appointments?: Appointment[];
  onServiceCreate: (service: Omit<Service, "id">) => void;
  onServiceUpdate: (id: string, service: Partial<Service>) => void;
  onServiceDelete: (id: string) => void;
  onNavigateToToday?: () => void;
}

const filters = [
  { name: "WhatsApp", icon: MessageSquare, color: "whatsapp", count: 12 },
  { name: "Telegram", icon: Send, color: "telegram", count: 8 },
  { name: "SMS", icon: Phone, color: "sms", count: 5 },
  { name: "Email", icon: Mail, color: "email", count: 15 },
];

const statusFilters = [
  { name: "Sent Today", count: 23, color: "success" },
  { name: "Pending", count: 7, color: "warning" },
  { name: "Failed", count: 2, color: "destructive" },
];

export function AppSidebar({ 
  services, 
  appointments,
  onServiceCreate,
  onServiceUpdate,
  onServiceDelete,
  onNavigateToToday
}: AppSidebarProps) {
  const navigate = useNavigate();
  const { state } = useSidebar();
  const isMobile = useIsMobile();
  const isCollapsed = state === "collapsed" && !isMobile;
  const [showRevenueModal, setShowRevenueModal] = useState(false);

  // Calculate actual counts from appointments data
  const allAppointments = appointments || [];
  const sentTodayCount = allAppointments.filter(apt => apt.status === "sent").length;
  const pendingCount = allAppointments.filter(apt => 
    apt.status === "not-sent" || apt.status === "scheduled"
  ).length;
  const failedCount = allAppointments.filter(apt => apt.status === "failed").length;

  // Calculate current revenue from completed appointments
  const completedAppointments = allAppointments.filter(apt => apt.status === "sent");
  const currentRevenue = completedAppointments.reduce((sum, apt) => {
    const service = mockServices.find(s => s.name === apt.service);
    return sum + (service?.price || 100);
  }, 0);

  // Status filters with real data
  const statusFilters = [
    { name: "Sent Today", count: sentTodayCount, color: "success" },
    { name: "Pending", count: pendingCount, color: "warning" },
    { name: "Failed", count: failedCount, color: "destructive" },
  ];

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-72"} collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <span className="font-semibold text-sidebar-foreground">AppointmentPro</span>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        {/* Schedule */}
        <SidebarGroup>
          <SidebarGroupLabel>Calendars</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onNavigateToToday}>
                  <Calendar className="h-4 w-4" />
                  {!isCollapsed && <span>Schedule</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Management Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <ServiceManagerModal
                  services={services}
                  onServiceCreate={onServiceCreate}
                  onServiceUpdate={onServiceUpdate}
                  onServiceDelete={onServiceDelete}
                  trigger={
                    <SidebarMenuButton className="w-full justify-start">
                      <FileText className="h-4 w-4" />
                      {!isCollapsed && (
                        <div className="flex items-center justify-between w-full">
                          <span>Services</span>
                          <Badge variant="outline" className="text-xs">
                            {services.length}
                          </Badge>
                        </div>
                      )}
                    </SidebarMenuButton>
                  }
                />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* Revenue Section - Locked */}
        <SidebarGroup>
          <SidebarGroupLabel>Revenue</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  className="w-full justify-start cursor-not-allowed opacity-60"
                  onClick={() => setShowRevenueModal(true)}
                >
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  {!isCollapsed && (
                    <div className="flex items-center justify-between w-full">
                      <span>Analytics</span>
                      <Badge variant="outline" className="text-xs">
                        Locked
                      </Badge>
                    </div>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
              {!isCollapsed && (
                <SidebarMenuItem>
                  <div className="p-3 bg-muted/30 rounded-lg border border-border mx-2 relative">
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg backdrop-blur-sm">
                      <div className="text-center">
                        <Lock className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                        <span className="text-sm font-medium text-muted-foreground">Available Soon</span>
                      </div>
                    </div>
                    <div className="opacity-20">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-sm font-medium">Current Revenue</span>
                      </div>
                      <div className="text-xl font-bold">${currentRevenue}</div>
                      <div className="text-xs text-muted-foreground">
                        {completedAppointments.length} completed
                      </div>
                    </div>
                  </div>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator />

        {/* Status Filters */}
        <SidebarGroup>
          <SidebarGroupLabel>Status</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {statusFilters.map((status) => (
                <SidebarMenuItem key={status.name}>
                  <SidebarMenuButton>
                    <div className={`w-2 h-2 rounded-full bg-${status.color}`} />
                    {!isCollapsed && (
                      <div className="flex items-center justify-between w-full">
                        <span>{status.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {status.count}
                        </Badge>
                      </div>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator />

        {/* Subscription */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate('/profile')}>
                  <CreditCard className="h-4 w-4" />
                  {!isCollapsed && <span>Manage Subscription</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <RevenueModal
        open={showRevenueModal}
        onOpenChange={setShowRevenueModal}
        appointments={appointments || []}
      />
    </Sidebar>
  );
}