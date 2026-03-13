import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';

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

interface UserContextType {
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  updateBusinessName: (name: string) => Promise<void>;
  isFreePlan: boolean;
  needsBusinessName: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { authenticatedFetch } = useAuthenticatedApi();

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = await authenticatedFetch('/auth/profile');
      // Preserve locally-set business_name if the backend response is briefly stale.
      setProfile(prev => ({
        ...(profileData as UserProfile),
        business_name: (profileData as UserProfile).business_name ?? prev?.business_name,
      }));
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBusinessName = async (name: string) => {
    try {
      await authenticatedFetch('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ business_name: name }),
      });

      // Update local state immediately (optimistic UI)
      setProfile(prev => (prev ? { ...prev, business_name: name } : prev));

      // Refresh profile in background to ensure state is consistent.
      void loadProfile();
    } catch (error) {
      console.error('Failed to update business name:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const isFreePlan = !profile?.subscription_type || profile?.subscription_type === 'free';
  const needsBusinessName = !!profile && !profile.business_name;

  return (
    <UserContext.Provider value={{ 
      profile, 
      loading, 
      refreshProfile: loadProfile, 
      updateBusinessName,
      isFreePlan,
      needsBusinessName 
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
