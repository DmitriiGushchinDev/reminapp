import { fetchWithErrorHandling } from './api';

export interface CheckoutSessionRequest {
  price_id: string;
  customer_email: string;
  success_url: string;
  cancel_url: string;
}

export interface SubscriptionRequest {
  price_id: string;
  customer_email: string;
  success_url: string;
  cancel_url: string;
}

export interface CancelSubscriptionRequest {
  subscription_id: string;
}

export interface PortalRequest {
  customer_id: string;
  return_url: string;
}

export const stripeService = {
  createCheckoutSession: async (data: CheckoutSessionRequest, token?: string) => {
    return await fetchWithErrorHandling('/stripe/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    });
  },

  createSubscriptionCheckout: async (data: SubscriptionRequest, token?: string) => {
    return await fetchWithErrorHandling('/stripe/create-subscription-checkout', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    });
  },

  cancelSubscription: async (data: CancelSubscriptionRequest, token?: string) => {
    return await fetchWithErrorHandling('/stripe/cancel-subscription', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    });
  },

  createPortalSession: async (data: PortalRequest, token?: string) => {
    return await fetchWithErrorHandling('/stripe/create-portal-session', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    });
  },
};
