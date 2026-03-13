import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2 } from "lucide-react";

interface BusinessNameModalProps {
  open: boolean;
  onSubmit: (businessName: string) => void;
}

export function BusinessNameModal({ open, onSubmit }: BusinessNameModalProps) {
  const [businessName, setBusinessName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(businessName.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <DialogHeader>
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Welcome! Let's get started</DialogTitle>
          <DialogDescription className="text-center">
            Enter your business or username. This will be displayed in notifications sent to your clients.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name / Username</Label>
            <Input
              id="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g., John's Barbershop"
              required
              autoFocus
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary-hover"
            disabled={!businessName.trim() || isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Continue"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
