import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

print(f"SMTP Server: {SMTP_SERVER}:{SMTP_PORT}")
print(f"SMTP User: {SMTP_USERNAME}")

msg = MIMEMultipart("alternative")
msg["Subject"] = "Test from Callus Admissions Agent"
msg["From"] = SMTP_USERNAME
msg["To"] = "karnatakarrrit@yopmail.com"

part = MIMEText("<h1>This is a test email</h1>", "html")
msg.attach(part)

try:
    server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
    server.set_debuglevel(1)
    server.starttls()
    server.login(SMTP_USERNAME, SMTP_PASSWORD)
    server.sendmail(msg["From"], msg["To"], msg.as_string())
    server.quit()
    print("Email sent successfully!")
except Exception as e:
    print(f"Error sending email: {e}")
