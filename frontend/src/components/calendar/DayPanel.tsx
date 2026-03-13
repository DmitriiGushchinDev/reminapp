import { useState } from "react";
import { Send, Eye, Users, CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Appointment } from "@/types";
import { formatTime12h } from "@/lib/utils";

interface DayPanelProps {
  appointments: Appointment[];
  onBulkSend: () => void;
  stats: {
    ready: number;
    sent: number;
    scheduled: number;
    failed: number;
  };
}

export function DayPanel({ appointments, onBulkSend, stats }: DayPanelProps) {
  const readyAppointments = appointments.filter(apt => apt.status === "not-sent");

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Today's Overview</h2>
        <p className="text-sm text-muted-foreground">
          Manage reminders for {appointments.length} appointments
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <div>
              <div className="text-lg font-semibold">{stats.ready}</div>
              <div className="text-xs text-muted-foreground">Ready</div>
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-success" />
            <div>
              <div className="text-lg font-semibold">{stats.sent}</div>
              <div className="text-xs text-muted-foreground">Sent</div>
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <div>
              <div className="text-lg font-semibold">{stats.scheduled}</div>
              <div className="text-xs text-muted-foreground">Scheduled</div>
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-destructive" />
            <div>
              <div className="text-lg font-semibold">{stats.failed}</div>
              <div className="text-xs text-muted-foreground">Failed</div>
            </div>
          </div>
        </Card>
      </div>

      <Separator />

      {/* Clients List */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <h3 className="font-medium">Today's Clients</h3>
        </div>
        
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{appointment.clientName}</div>
                <div className="text-xs text-muted-foreground">{formatTime12h(appointment.startTime)}</div>
              </div>
              <Badge
                variant="outline"
                className={`text-xs ml-2 ${
                  appointment.reminderMethod === "whatsapp" ? "border-whatsapp/50 text-whatsapp" :
                  appointment.reminderMethod === "telegram" ? "border-telegram/50 text-telegram" :
                  appointment.reminderMethod === "sms" ? "border-sms/50 text-sms" :
                  "border-email/50 text-email"
                }`}
              >
                {appointment.reminderMethod.toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      <Separator />

    </div>
  );
}
