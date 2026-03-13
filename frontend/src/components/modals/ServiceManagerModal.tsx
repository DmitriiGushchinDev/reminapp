import { useState } from "react";
import { Edit, Trash2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Service } from "@/types";

interface ServiceManagerModalProps {
  services: Service[];
  onServiceCreate: (service: Omit<Service, "id">) => void;
  onServiceUpdate: (id: string, service: Partial<Service>) => void;
  onServiceDelete: (id: string) => void;
  trigger?: React.ReactNode;
}

export function ServiceManagerModal({
  services,
  onServiceCreate,
  onServiceUpdate,
  onServiceDelete,
  trigger
}: ServiceManagerModalProps) {
  const [open, setOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    duration: "",
    price: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.duration) return;

    const serviceData = {
      name: formData.name,
      duration: parseInt(formData.duration),
      price: formData.price ? parseFloat(formData.price) : undefined
    };

    if (editingService) {
      onServiceUpdate(editingService.id, serviceData);
    } else {
      onServiceCreate(serviceData);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: "", duration: "", price: "" });
    setEditingService(null);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      duration: service.duration.toString(),
      price: service.price?.toString() || ""
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this service?")) {
      onServiceDelete(id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Manage Services
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Service Manager</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Service Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {editingService ? "Edit Service" : "Create New Service"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Service Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter service name"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="60"
                      min="1"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Price (optional)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="100.00"
                      min="0"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  {editingService && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  )}
                  <Button type="submit" className="bg-primary hover:bg-primary-hover">
                    {editingService ? "Update" : "Create"} Service
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Existing Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Existing Services</h3>
            <div className="space-y-3">
              {services.map((service) => (
                <Card key={service.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <h4 className="font-medium">{service.name}</h4>
                        <div className="text-sm text-muted-foreground">
                          {service.duration} minutes
                          {service.price && ` • $${service.price}`}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(service)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(service.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
