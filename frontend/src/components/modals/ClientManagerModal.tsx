import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2, Plus, Phone, Mail, User } from "lucide-react";
import { Client } from "@/types";

interface ClientManagerModalProps {
  clients: Client[];
  onClientCreate: (clientData: Omit<Client, "id" | "createdAt" | "updatedAt">) => void;
  onClientUpdate: (id: string, updates: Partial<Client>) => void;
  onClientDelete: (id: string) => void;
  trigger?: React.ReactNode;
}

export function ClientManagerModal({
  clients,
  onClientCreate,
  onClientUpdate,
  onClientDelete,
  trigger
}: ClientManagerModalProps) {
  const [open, setOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    notes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      return;
    }

    if (editingClient) {
      onClientUpdate(editingClient.id, {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        notes: formData.notes.trim() || undefined
      });
    } else {
      onClientCreate({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        notes: formData.notes.trim() || undefined
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      notes: ""
    });
    setEditingClient(null);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      phone: client.phone,
      email: client.email || "",
      notes: client.notes || ""
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this client?")) {
      onClientDelete(id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) {
        resetForm();
      }
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full">
            <User className="h-4 w-4 mr-2" />
            Manage Clients
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Clients</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Client Form */}
          <Card>
            <CardHeader>
              <CardTitle>
                {editingClient ? "Edit Client" : "Add New Client"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="client-name">Name *</Label>
                  <Input
                    id="client-name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Client full name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="client-phone">Phone *</Label>
                  <Input
                    id="client-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1234567890"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="client-email">Email</Label>
                  <Input
                    id="client-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="client@example.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="client-notes">Notes</Label>
                  <Textarea
                    id="client-notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes about the client..."
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    <Plus className="h-4 w-4 mr-2" />
                    {editingClient ? "Update Client" : "Add Client"}
                  </Button>
                  {editingClient && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
          
          {/* Clients List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Clients ({clients.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {clients.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No clients yet. Add your first client!
                  </p>
                ) : (
                  clients.map((client) => (
                    <Card key={client.id} className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground truncate">
                            {client.name}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Phone className="h-3 w-3" />
                            <span className="truncate">{client.phone}</span>
                          </div>
                          {client.email && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <Mail className="h-3 w-3" />
                              <span className="truncate">{client.email}</span>
                            </div>
                          )}
                          {client.notes && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {client.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(client)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(client.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}