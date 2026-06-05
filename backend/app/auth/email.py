import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# Load .env from backend root
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

SMTP_HOST     = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT     = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM     = os.getenv("SMTP_FROM", SMTP_USERNAME)


def send_verification_email(email: str, name: str, token: str):
    verification_link = f"http://localhost:8000/api/auth/verify?token={token}"

    # Always print to terminal as a fallback / debug reference
    print(f"\n==================================================")
    print(f"VERIFICATION LINK FOR {email}:")
    print(verification_link)
    print(f"==================================================\n")

    subject = "Verify Your Account - SCMS Complaint Management System"

    body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;
                   max-width: 600px; margin: 0 auto; padding: 20px;
                   border: 1px solid #e2e8f0; border-radius: 8px;">

        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #1E3A8A; margin: 0;">SCMS</h2>
          <p style="color: #64748b; font-size: 0.9em; margin: 4px 0 0;">Smart Complaint Management System</p>
        </div>

        <h3 style="color: #1E3A8A;">Welcome, {name}! 👋</h3>
        <p>Thank you for registering on SCMS. Please verify your email address to activate your account and start submitting complaints.</p>

        <p style="margin: 30px 0; text-align: center;">
          <a href="{verification_link}"
             style="background-color: #2563eb; color: white; padding: 12px 28px;
                    text-decoration: none; border-radius: 6px; font-weight: bold;
                    display: inline-block; font-size: 15px;">
            ✅ Verify Email Address
          </a>
        </p>

        <p style="color: #475569; font-size: 0.9em;">
          If the button doesn't work, copy and paste this link in your browser:
        </p>
        <p style="word-break: break-all;">
          <a href="{verification_link}" style="color: #2563eb;">{verification_link}</a>
        </p>

        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        <p style="font-size: 0.8em; color: #94a3b8; text-align: center;">
          This link expires in 24 hours. Do not reply to this email.
        </p>
      </body>
    </html>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = f"SCMS No-Reply <{SMTP_FROM}>"
    msg["To"]      = email
    msg.attach(MIMEText(body, "html"))

    if not SMTP_USERNAME or not SMTP_PASSWORD:
        print("[EMAIL] SMTP credentials missing — email not sent (use terminal link above).")
        return False

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM, [email], msg.as_string())
        print(f"[EMAIL] ✅ Verification email sent successfully to {email}")
        return True
    except smtplib.SMTPAuthenticationError:
        print("[EMAIL] ❌ SMTP Authentication failed — check Gmail address and App Password in .env")
        return False
    except Exception as e:
        print(f"[EMAIL] ❌ Failed to send email: {e}")
        return False
