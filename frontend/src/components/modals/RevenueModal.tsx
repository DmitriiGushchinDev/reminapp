import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { TrendingUp, DollarSign, Calendar, Target, Lock } from "lucide-react";
import { Appointment } from "@/types";
import { mockServices } from "@/data/mockData";

interface RevenueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointments: Appointment[];
}

type TimePeriod = "week" | "month" | "quarter" | "year";

const generateRevenueData = (appointments: Appointment[], period: TimePeriod) => {
  const completedAppointments = appointments.filter(apt => apt.status === "sent");
  const getServicePrice = (serviceName: string) => {
    const service = mockServices.find(s => s.name === serviceName);
    return service?.price || 100; // default price
  };

  // Generate mock data for different periods
  const now = new Date();
  let data: { name: string; revenue: number; appointments: number }[] = [];

  switch (period) {
    case "week":
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dayAppointments = completedAppointments.filter(apt => 
          apt.date === date.toISOString().split('T')[0]
        );
        const revenue = dayAppointments.reduce((sum, apt) => sum + getServicePrice(apt.service), 0);
        data.push({
          name: date.toLocaleDateString('en', { weekday: 'short' }),
          revenue,
          appointments: dayAppointments.length
        });
      }
      break;
    case "month":
      for (let i = 29; i >= 0; i -= 3) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const revenue = Math.floor(Math.random() * 2000) + 500;
        data.push({
          name: `${date.getDate()}`,
          revenue,
          appointments: Math.floor(revenue / 120)
        });
      }
      break;
    case "quarter":
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const revenue = Math.floor(Math.random() * 8000) + 2000;
        data.push({
          name: months[date.getMonth()],
          revenue,
          appointments: Math.floor(revenue / 120)
        });
      }
      break;
    case "year":
      for (let i = 4; i >= 0; i--) {
        const year = now.getFullYear() - i;
        const revenue = Math.floor(Math.random() * 50000) + 20000;
        data.push({
          name: year.toString(),
          revenue,
          appointments: Math.floor(revenue / 120)
        });
      }
      break;
  }

  return data;
};

export function RevenueModal({ open, onOpenChange, appointments }: RevenueModalProps) {
  const [period, setPeriod] = useState<TimePeriod>("month");
  const [chartType, setChartType] = useState<"bar" | "line">("bar");

  const data = generateRevenueData(appointments, period);
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalAppointments = data.reduce((sum, item) => sum + item.appointments, 0);
  const avgPerAppointment = totalAppointments > 0 ? totalRevenue / totalAppointments : 0;

  const completedAppointments = appointments.filter(apt => apt.status === "sent");
  const actualRevenue = completedAppointments.reduce((sum, apt) => {
    const service = mockServices.find(s => s.name === apt.service);
    return sum + (service?.price || 100);
  }, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] overflow-y-auto bg-muted/40">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            Revenue Analytics
          </DialogTitle>
        </DialogHeader>

        <div className="relative space-y-6">
          {/* Locked Overlay */}
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-lg">
            <div className="text-center p-8 bg-card rounded-lg border-2 border-border shadow-lg">
              <Lock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Available Soon</h3>
              <p className="text-muted-foreground">Revenue analytics will be unlocked in the next update</p>
            </div>
          </div>

          <div className="opacity-30 pointer-events-none">
          {/* Controls */}
          <div className="flex items-center gap-4">
            <Select value={period} onValueChange={(value) => setPeriod(value as TimePeriod)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="quarter">Quarter</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>

            <Select value={chartType} onValueChange={(value) => setChartType(value as "bar" | "line")}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="line">Line Chart</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">${actualRevenue}</div>
                <p className="text-xs text-muted-foreground">From completed appointments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">For selected period</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalAppointments}</div>
                <p className="text-xs text-muted-foreground">Total bookings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg per Appointment</CardTitle>
                <Target className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${avgPerAppointment.toFixed(0)}</div>
                <p className="text-xs text-muted-foreground">Average revenue</p>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend - {period.charAt(0).toUpperCase() + period.slice(1)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "bar" ? (
                    <BarChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-muted-foreground" />
                      <YAxis className="text-muted-foreground" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : (
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-muted-foreground" />
                      <YAxis className="text-muted-foreground" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}