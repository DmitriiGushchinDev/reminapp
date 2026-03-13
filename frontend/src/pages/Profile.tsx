import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useAuthenticatedApi } from "@/hooks/useAuthenticatedApi";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ClientManagerModal } from "@/components/modals/ClientManagerModal";
import { User, Edit, Save, X, ArrowLeft, Crown, Check, Zap, Loader2 } from "lucide-react";
import { Client } from "@/types";
import { createClientService } from "@/services/clientService";
import { api } from "@/services/api";
import { stripeService } from "@/services/stripeService";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone_number?: string;
  telegram_id?: string;
  business_name?: string;
  is_provider: boolean;
  is_subscribed: boolean;
  subscription_type?: string;
  subscription_status?: string;
  created_at: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, getToken } = useAuth();
  const { authenticatedFetch } = useAuthenticatedApi();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    business_name: "",
    phone_number: "",
    telegram_id: "",
  });

  const clientService = useMemo(() => 
    createClientService(authenticatedFetch), 
    [authenticatedFetch]
  );

  useEffect(() => {
    loadProfileData();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      toast({
        title: "Subscription activated!",
        description: "Your subscription has been successfully activated.",
      });
      window.history.replaceState({}, '', '/profile');
    } else if (params.get('canceled') === 'true') {
      toast({
        title: "Subscription canceled",
        description: "Your subscription purchase was canceled.",
        variant: "destructive",
      });
      window.history.replaceState({}, '', '/profile');
    }
  }, [toast]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const [profileData, clientsData] = await Promise.all([
        authenticatedFetch('/auth/profile'),
        clientService.getClients(),
      ]);
      
      setProfile(profileData);
      setClients(clientsData);
      setFormData({
        name: profileData.name || "",
        business_name: profileData.business_name || "",
        phone_number: profileData.phone_number || "",
        telegram_id: profileData.telegram_id || "",
      });
    } catch (error) {
      console.error('Failed to load profile data:', error);
      const { error: errorMessage } = api.handleError(error);
      toast({
        title: "Error loading profile",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const updatedProfile = await authenticatedFetch('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      
      setProfile(updatedProfile);
      setEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      const { error: errorMessage } = api.handleError(error);
      toast({
        title: "Error updating profile",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      name: profile?.name || "",
      business_name: profile?.business_name || "",
      phone_number: profile?.phone_number || "",
      telegram_id: profile?.telegram_id || "",
    });
    setEditing(false);
  };

  const handleClientCreate = async (clientData: Omit<Client, 'id'>) => {
    try {
      const newClient = await clientService.createClient(clientData);
      setClients(prev => [...prev, newClient]);
      toast({
        title: "Client created",
        description: "The client has been successfully created.",
      });
    } catch (error) {
      const { error: errorMessage } = api.handleError(error);
      toast({
        title: "Error creating client",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleClientUpdate = async (id: string, updates: Partial<Client>) => {
    try {
      const updatedClient = await clientService.updateClient(id, updates);
      setClients(prev =>
        prev.map(client => client.id === id ? updatedClient : client)
      );
      toast({
        title: "Client updated",
        description: "The client has been successfully updated.",
      });
    } catch (error) {
      const { error: errorMessage } = api.handleError(error);
      toast({
        title: "Error updating client",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleClientDelete = async (id: string) => {
    try {
      await clientService.deleteClient(id);
      setClients(prev => prev.filter(client => client.id !== id));
      toast({
        title: "Client deleted",
        description: "The client has been successfully deleted.",
      });
    } catch (error) {
      const { error: errorMessage } = api.handleError(error);
      toast({
        title: "Error deleting client",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleSubscribe = async (priceId: string, planName: string) => {
    if (!profile?.email) {
      toast({
        title: "Error",
        description: "Email address not found",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubscribing(true);
      const token = await getToken();
      
      const successUrl = `${window.location.origin}/profile?success=true`;
      const cancelUrl = `${window.location.origin}/profile?canceled=true`;

      const response = await stripeService.createSubscriptionCheckout({
        price_id: priceId,
        customer_email: profile.email,
        success_url: successUrl,
        cancel_url: cancelUrl,
      }, token || undefined);

      if (response.url) {
        window.location.href = response.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      const { error: errorMessage } = api.handleError(error);
      toast({
        title: "Error creating checkout",
        description: errorMessage,
        variant: "destructive",
      });
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load profile data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Appointments
          </Button>
          <div className="flex items-center gap-3 ml-4">
            <User className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Profile</h1>
              <p className="text-muted-foreground">Manage your profile information and clients</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Information */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your account details and contact information</CardDescription>
              </div>
              {!editing ? (
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveProfile}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="business_name">Business Name / Username</Label>
                  <p className="text-xs text-muted-foreground">
                    This name will be shown in notifications sent to your clients.
                  </p>
                  {editing ? (
                    <Input
                      id="business_name"
                      value={formData.business_name}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, business_name: e.target.value }))
                      }
                      placeholder="e.g., John's Barbershop"
                    />
                  ) : (
                    <p className="text-sm font-medium mt-1">
                      {profile.business_name || "Not provided"}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="name">Full Name</Label>
                  {editing ? (
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p className="text-sm font-medium mt-1">{profile.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <p className="text-sm text-muted-foreground mt-1">{profile.email}</p>
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  {editing ? (
                    <Input
                      id="phone"
                      value={formData.phone_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <p className="text-sm font-medium mt-1">{profile.phone_number || "Not provided"}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="telegram">Telegram ID</Label>
                  {editing ? (
                    <Input
                      id="telegram"
                      value={formData.telegram_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, telegram_id: e.target.value }))}
                      placeholder="Enter your Telegram ID"
                    />
                  ) : (
                    <p className="text-sm font-medium mt-1">{profile.telegram_id || "Not provided"}</p>
                  )}
                </div>

                <Separator />

                <div className="flex flex-wrap gap-2">
                  {profile.is_provider && (
                    <Badge variant="default">Provider</Badge>
                  )}
                  {profile.is_subscribed && (
                    <Badge variant="secondary">
                      {profile.subscription_type || "Subscribed"}
                    </Badge>
                  )}
                  {profile.subscription_status && (
                    <Badge variant={profile.subscription_status === 'active' ? 'default' : 'outline'}>
                      {profile.subscription_status}
                    </Badge>
                  )}
                </div>

                <div>
                  <Label>Member Since</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Management */}
          <Card>
            <CardHeader>
              <CardTitle>Client Management</CardTitle>
              <CardDescription>Manage your clients and their information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Total Clients</p>
                    <p className="text-2xl font-bold text-primary">{clients.length}</p>
                  </div>
                  <ClientManagerModal
                    clients={clients}
                    onClientCreate={handleClientCreate}
                    onClientUpdate={handleClientUpdate}
                    onClientDelete={handleClientDelete}
                    trigger={
                      <Button>
                        Manage Clients
                      </Button>
                    }
                  />
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium mb-2">Recent Clients</p>
                  <div className="space-y-2">
                    {clients.slice(0, 3).map((client) => (
                      <div key={client.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium text-sm">{client.name}</p>
                          <p className="text-xs text-muted-foreground">{client.phone}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {new Date(client.createdAt).toLocaleDateString()}
                        </Badge>
                      </div>
                    ))}
                    {clients.length === 0 && (
                      <p className="text-sm text-muted-foreground">No clients yet</p>
                    )}
                    {clients.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{clients.length - 3} more clients
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Crown className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Subscription Plans</CardTitle>
                <CardDescription>Choose the plan that works best for you</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              {/* Free Plan */}
              <Card className={`relative ${!profile.is_subscribed ? 'border-2 border-primary' : ''}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Free
                  </CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$0</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success" />
                      Up to 10 appointments
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success" />
                      Basic calendar view
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success" />
                      Email notifications
                    </li>
                    <li className="flex items-center gap-2 text-sm text-muted-foreground">
                      <X className="h-4 w-4" />
                      SMS reminders
                    </li>
                    <li className="flex items-center gap-2 text-sm text-muted-foreground">
                      <X className="h-4 w-4" />
                      WhatsApp integration
                    </li>
                  </ul>
                  <Button 
                    variant={!profile.is_subscribed ? "default" : "outline"}
                    className="w-full"
                    disabled={!profile.is_subscribed}
                  >
                    {!profile.is_subscribed ? "Current Plan" : "Downgrade"}
                  </Button>
                </CardContent>
              </Card>

              {/* Pro Plan */}
              <Card className={`relative ${profile.subscription_type === 'pro' ? 'border-2 border-primary' : ''}`}>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary">Popular</Badge>
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Pro
                  </CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$10</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success" />
                      Unlimited appointments
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success" />
                      Advanced calendar views
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success" />
                      Email & SMS notifications
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success" />
                      WhatsApp integration
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success" />
                      Custom templates
                    </li>
                  </ul>
                  <Button 
                    className="w-full"
                    variant={profile.subscription_type === 'pro' ? "default" : "outline"}
                    disabled={profile.subscription_type === 'pro' || subscribing}
                    onClick={() => handleSubscribe('price_1STF9GHTaW3mWPNvgaPg4e8s', 'Pro')}
                  >
                    {subscribing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      profile.subscription_type === 'pro' ? "Current Plan" : "Upgrade to Pro"
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Enterprise Plan */}
              <Card className={`relative ${profile.subscription_type === 'enterprise' ? 'border-2 border-primary' : ''}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-primary" />
                    Enterprise
                  </CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$49</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success" />
                      Everything in Pro
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success" />
                      Telegram integration
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success" />
                      Revenue analytics
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success" />
                      Priority support
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success" />
                      API access
                    </li>
                  </ul>
                  <Button 
                    className="w-full"
                    variant={profile.subscription_type === 'enterprise' ? "default" : "outline"}
                    disabled={profile.subscription_type === 'enterprise' || subscribing}
                    onClick={() => handleSubscribe('price_1XYZ789abc...', 'Enterprise')} // Replace with your actual Stripe Price ID
                  >
                    {subscribing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      profile.subscription_type === 'enterprise' ? "Current Plan" : "Upgrade to Enterprise"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}