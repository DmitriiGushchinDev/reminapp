export interface Appointment {
  id: string;
  date: string; // YYYY-MM-DD format
  startTime: string;
  endTime?: string; // Optional - calculated from service duration if not provided
  clientName: string;
  clientPhone: string;
  service: string;
  reminderMethod: "whatsapp" | "telegram" | "sms" | "email";
  template: string;
  status: "not-sent" | "scheduled" | "sent" | "failed" | "canceled";
  cancellationNoticeSent?: boolean;
}

export interface Template {
  id: string;
  name: string;
  content: string;
  variables: string[];
}

export interface Service {
  id: string;
  name: string;
  duration: number; // in minutes
  price?: number;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export type CalendarView = "DAY" | "WEEK" | "MONTH" | "YEAR";