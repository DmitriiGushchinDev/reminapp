import { CalendarDays, ChevronLeft, ChevronRight, Plus, Search, User, Settings, LogOut, UserCog } from "lucide-react";
import { format } from "date-fns";
import { useUser, useClerk } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarView, Service, Appointment } from "@/types";
import { NewAppointmentModal } from "./modals/NewAppointmentModal";

interface AppHeaderProps {
  currentView: CalendarView;
  onViewChange: (view: CalendarView) => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onAppointmentCreate: (appointment: Omit<Appointment, "id">) => void;
  services: Service[];
}

const viewOptions: { value: CalendarView; label: string }[] = [
  { value: "DAY", label: "Day" },
  { value: "WEEK", label: "Week" },
  { value: "MONTH", label: "Month" },
  { value: "YEAR", label: "Year" },
];

export function AppHeader({ currentView, onViewChange, selectedDate, onDateChange, onAppointmentCreate, services }: AppHeaderProps) {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const navigate = useNavigate();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { 
      weekday: "long", 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });
  };

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    
    switch (currentView) {
      case "DAY":
        newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
        break;
      case "WEEK":
        newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
        break;
      case "MONTH":
        newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
        break;
      case "YEAR":
        newDate.setFullYear(newDate.getFullYear() + (direction === "next" ? 1 : -1));
        break;
    }
    
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between px-3 md:px-6 py-3">
        <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
          <SidebarTrigger />
          
          {/* Date Navigation */}
          <div className="flex items-center gap-1 md:gap-2 min-w-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate("prev")}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1 md:gap-2 min-w-0">
              <CalendarDays className="h-4 w-4 text-muted-foreground hidden sm:block" />
              <span className="font-medium text-foreground truncate text-sm md:text-base">
                {currentView === "DAY" ? format(selectedDate, "MMM d") : 
                 currentView === "MONTH" ? format(selectedDate, "MMM yyyy") :
                 currentView === "YEAR" ? format(selectedDate, "yyyy") :
                 format(selectedDate, "MMM d")}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate("next")}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="sm" onClick={goToToday} className="hidden sm:flex">
              Today
            </Button>
          </div>
        </div>

        {/* Center - View Switcher - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-1 bg-muted rounded-lg p-1">
          {viewOptions.map((option) => (
            <Button
              key={option.value}
              variant={currentView === option.value ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onViewChange(option.value)}
              className={currentView === option.value ? "bg-background shadow-sm" : ""}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {/* Mobile View Switcher */}
        <div className="md:hidden">
          <select 
            value={currentView} 
            onChange={(e) => onViewChange(e.target.value as CalendarView)}
            className="bg-background border border-border rounded px-2 py-1 text-sm"
          >
            {viewOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Search - Hidden on mobile */}
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              className="pl-9 w-48 xl:w-64"
            />
          </div>
          
          <NewAppointmentModal
            services={services}
            selectedDate={selectedDate}
            onAppointmentCreate={onAppointmentCreate}
          />
          
          {/* Custom Account Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.fullName ? getInitials(user.fullName) : <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 bg-background border border-border z-50" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.fullName || "User"}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={openUserProfile} className="cursor-pointer">
                <UserCog className="mr-2 h-4 w-4" />
                <span>Switch Account</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}