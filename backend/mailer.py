import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from .email_templates import OTP_EMAIL_TEMPLATE

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

def send_verification_email(to_email: str, otp: str):
    html_content = OTP_EMAIL_TEMPLATE.format(otp=otp)

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"{otp} is your Callus verification code"
    msg["From"] = SMTP_USERNAME or "no-reply@callus.com"
    msg["To"] = to_email

    part = MIMEText(html_content, "html")
    msg.attach(part)

    if not SMTP_USERNAME or not SMTP_PASSWORD:
        print(f"--- MOCK EMAIL to {to_email} ---")
        print(f"OTP: {otp}")
        print("-------------------------------")
        return

    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.sendmail(msg["From"], msg["To"], msg.as_string())
        server.quit()
        print(f"OTP email sent to {to_email}")
    except Exception as e:
        print(f"Error sending email: {e}")
