import smtplib
from email.mime.text import MIMEText
import config


def send_email(to_email, subject, body, reply_to=None):
    try:
        msg = MIMEText(body, "plain")

        msg["From"] = config.ADMIN_EMAIL
        msg["To"] = to_email
        msg["Subject"] = subject

        if reply_to:
            msg["Reply-To"] = reply_to

        server = smtplib.SMTP(config.SMTP_HOST, config.SMTP_PORT)
        server.starttls()

        server.login(
            config.ADMIN_EMAIL,
            config.ADMIN_EMAIL_PASSWORD
        )

        server.sendmail(
            config.ADMIN_EMAIL,
            to_email,
            msg.as_string()
        )

        server.quit()

        return True

    except Exception as e:
        print("EMAIL ERROR:", e)
        return False
