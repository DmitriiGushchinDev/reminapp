import os
from twilio.rest import Client


def send_sms(to: str, message: str) -> bool:
    """
    Send an SMS message using Twilio.
    
    Args:
        to: Phone number to send SMS to (E.164 format, e.g., +1234567890)
        message: Message body to send
        
    Returns:
        True if message was sent successfully, False otherwise
    """
    account_sid = os.environ.get("TWILIO_ACCOUNT_SID")
    auth_token = os.environ.get("TWILIO_AUTH_TOKEN")
    messaging_service_sid = os.environ.get("TWILIO_MESSAGING_SERVICE_SID")
    
    if not account_sid or not auth_token:
        print("❌ Twilio credentials not configured")
        return False
    
    if not messaging_service_sid:
        print("❌ Twilio Messaging Service SID not configured")
        return False
    
    try:
        client = Client(account_sid, auth_token)
        
        # Use messages.create() to send SMS
        message_response = client.messages.create(
            messaging_service_sid=messaging_service_sid,
            body=message,
            to=to
        )
        
        print(f"✅ SMS sent successfully: {message_response.sid}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to send SMS: {str(e)}")
        return False
