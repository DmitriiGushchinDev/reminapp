import { MessageSquare, Send, Phone, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ReminderMethodToggleProps {
  disabled?: boolean;
}

const methods = [
  {
    value: "whatsapp" as const,
    icon: MessageSquare,
    label: "WA",
  },
  {
    value: "telegram" as const,
    icon: Send,
    label: "TG",
  },
  {
    value: "sms" as const,
    icon: Phone,
    label: "SMS",
  },
  {
    value: "email" as const,
    icon: Mail,
    label: "Email",
  },
];

export function ReminderMethodToggle({ disabled }: ReminderMethodToggleProps) {
  const { toast } = useToast();

  const handleClick = () => {
    toast({
      title: "Coming Soon",
      description: "This function will be available soon.",
    });
  };

  return (
    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg opacity-60">
      {methods.map((method) => {
        const Icon = method.icon;
        
        return (
          <Button
            key={method.value}
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs font-medium transition-all hover:bg-secondary"
            onClick={handleClick}
            disabled={disabled}
            type="button"
          >
            <Icon className="h-3 w-3 mr-1" />
            {method.label}
          </Button>
        );
      })}
      <div className="ml-1 flex items-center text-xs text-muted-foreground">
        <Clock className="h-3 w-3 mr-1" />
        Soon
      </div>
    </div>
  );
}