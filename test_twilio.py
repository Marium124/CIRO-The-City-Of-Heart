import os
from twilio.rest import Client

# Your Twilio credentials
account_sid = os.environ.get('TWILIO_ACCOUNT_SID', 'YOUR_ACCOUNT_SID')
auth_token = os.environ.get('TWILIO_AUTH_TOKEN', 'YOUR_AUTH_TOKEN')
try:
    client = Client(account_sid, auth_token)

    # Make sure the 'from_' number is the one provided by Twilio
    message = client.messages.create(
        body="Hello from CIRO! This is a real test SMS.",
        from_='+1XXXXXXXXXX',  # Your Twilio trial number
        to='+92XXXXXXXXXX'     # Your personal phone number to receive the test
    )

    print(f"Message sent with SID: {message.sid}")
except Exception as e:
    print(f"Failed to send message: {e}")
