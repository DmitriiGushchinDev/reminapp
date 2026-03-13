import { Appointment, Template, Service } from "@/types";

export const mockTemplates: Template[] = [
  {
    id: "appointment-reminder",
    name: "Standard Reminder",
    content: "Hi {clientName}, this is a friendly reminder about your {service} appointment tomorrow at {time}. Please reply to confirm. Thank you!",
    variables: ["clientName", "service", "time"]
  },
  {
    id: "premium-reminder",
    name: "Premium Service",
    content: "Dear {clientName}, we look forward to seeing you for your premium {service} session tomorrow at {time}. Our team is prepared to provide you with exceptional service.",
    variables: ["clientName", "service", "time"]
  },
  {
    id: "first-time-client",
    name: "First Time Client",
    content: "Welcome {clientName}! We're excited for your first {service} appointment tomorrow at {time}. Please arrive 15 minutes early for check-in.",
    variables: ["clientName", "service", "time"]
  },
  {
    id: "follow-up",
    name: "Follow-up",
    content: "Hi {clientName}, thank you for choosing us! Your {service} appointment is scheduled for tomorrow at {time}. We hope to see you again soon!",
    variables: ["clientName", "service", "time"]
  }
];

export const mockServices: Service[] = [
  { id: "deep-tissue", name: "Deep Tissue Massage", duration: 60, price: 120 },
  { id: "swedish", name: "Swedish Massage", duration: 60, price: 100 },
  { id: "hot-stone", name: "Hot Stone Therapy", duration: 90, price: 150 },
  { id: "sports", name: "Sports Massage", duration: 45, price: 110 },
  { id: "prenatal", name: "Prenatal Massage", duration: 60, price: 110 },
  { id: "couples", name: "Couples Massage", duration: 90, price: 200 }
];

// Generate appointments for multiple days
const generateAppointmentsForDate = (date: string, appointments: Omit<Appointment, "id" | "date">[]): Appointment[] => {
  return appointments.map((apt, index) => ({
    ...apt,
    id: `${date}-${index + 1}`,
    date
  }));
};

const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const dayAfter = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

export const mockAppointments: Appointment[] = [
  // Today's appointments
  ...generateAppointmentsForDate(today, [
    {
      startTime: "09:00",
      endTime: "09:45",
      clientName: "Sarah Johnson",
      clientPhone: "+1234567890",
      service: "Deep Tissue Massage",
      reminderMethod: "whatsapp",
      template: "appointment-reminder",
      status: "not-sent",
    },
    {
      startTime: "10:30",
      endTime: "11:15",
      clientName: "Mike Chen",
      clientPhone: "+1987654321",
      service: "Swedish Massage",
      reminderMethod: "sms",
      template: "appointment-reminder",
      status: "sent",
    },
    {
      startTime: "14:00",
      endTime: "15:00",
      clientName: "Emily Davis",
      clientPhone: "+1122334455",
      service: "Hot Stone Therapy",
      reminderMethod: "email",
      template: "premium-reminder",
      status: "scheduled",
    },
    {
      startTime: "16:30",
      endTime: "17:15",
      clientName: "David Wilson",
      clientPhone: "+1555666777",
      service: "Sports Massage",
      reminderMethod: "telegram",
      template: "appointment-reminder",
      status: "not-sent",
    }
  ]),
  // Tomorrow's appointments
  ...generateAppointmentsForDate(tomorrow, [
    {
      startTime: "10:00",
      endTime: "11:00",
      clientName: "Jessica Brown",
      clientPhone: "+1333444555",
      service: "Prenatal Massage",
      reminderMethod: "whatsapp",
      template: "first-time-client",
      status: "not-sent",
    },
    {
      startTime: "15:30",
      endTime: "17:00",
      clientName: "Alex & Sam",
      clientPhone: "+1666777888",
      service: "Couples Massage",
      reminderMethod: "sms",
      template: "premium-reminder",
      status: "not-sent",
    }
  ]),
  // Day after tomorrow
  ...generateAppointmentsForDate(dayAfter, [
    {
      startTime: "11:00",
      endTime: "12:00",
      clientName: "Robert Kim",
      clientPhone: "+1777888999",
      service: "Swedish Massage",
      reminderMethod: "email",
      template: "follow-up",
      status: "not-sent",
    }
  ])
];