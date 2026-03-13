import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UpgradePlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpgradePlanModal({ open, onOpenChange }: UpgradePlanModalProps) {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate('/profile');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Upgrade to Pro
          </DialogTitle>
          <DialogDescription>
            Unlock all reminder methods and premium features
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">All Reminder Methods</p>
                <p className="text-sm text-muted-foreground">WhatsApp, Telegram, SMS, and Email</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Unlimited Appointments</p>
                <p className="text-sm text-muted-foreground">No limits on scheduling</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Priority Support</p>
                <p className="text-sm text-muted-foreground">Get help when you need it</p>
              </div>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">$10</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Maybe Later
          </Button>
          <Button onClick={handleUpgrade} className="gap-2">
            <Crown className="h-4 w-4" />
            Upgrade Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
