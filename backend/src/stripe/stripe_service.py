import stripe
import os
from dotenv import load_dotenv

load_dotenv()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

class StripeService:
    
    @staticmethod
    def create_customer(email: str, name: str):
        """Create a Stripe customer"""
        try:
            customer = stripe.Customer.create(
                email=email,
                name=name
            )
            return customer
        except Exception as e:
            raise Exception(f"Failed to create customer: {str(e)}")
    
    @staticmethod
    def create_checkout_session(price_id: str, customer_email: str, success_url: str, cancel_url: str):
        """Create a Stripe Checkout session for one-time payment"""
        try:
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price': price_id,
                    'quantity': 1,
                }],
                mode='payment',
                customer_email=customer_email,
                success_url=success_url,
                cancel_url=cancel_url,
            )
            return session
        except Exception as e:
            raise Exception(f"Failed to create checkout session: {str(e)}")
    
    @staticmethod
    def create_subscription_checkout(price_id: str, customer_email: str, success_url: str, cancel_url: str):
        """Create a Stripe Checkout session for subscription"""
        try:
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price': price_id,
                    'quantity': 1,
                }],
                mode='subscription',
                customer_email=customer_email,
                success_url=success_url,
                cancel_url=cancel_url,
            )
            return session
        except Exception as e:
            raise Exception(f"Failed to create subscription checkout: {str(e)}")
    
    @staticmethod
    def cancel_subscription(subscription_id: str):
        """Cancel a subscription"""
        try:
            subscription = stripe.Subscription.delete(subscription_id)
            return subscription
        except Exception as e:
            raise Exception(f"Failed to cancel subscription: {str(e)}")
    
    @staticmethod
    def get_subscription(subscription_id: str):
        """Get subscription details"""
        try:
            subscription = stripe.Subscription.retrieve(subscription_id)
            return subscription
        except Exception as e:
            raise Exception(f"Failed to retrieve subscription: {str(e)}")
    
    @staticmethod
    def create_portal_session(customer_id: str, return_url: str):
        """Create a billing portal session"""
        try:
            session = stripe.billing_portal.Session.create(
                customer=customer_id,
                return_url=return_url,
            )
            return session
        except Exception as e:
            raise Exception(f"Failed to create portal session: {str(e)}")
