# Email Setup Guide

This guide explains how to configure email sending for user invitations.

## Overview

When admins invite users, the system automatically:
1. Creates the user account
2. Generates a random secure password
3. **Sends credentials via email to the user**
4. Shows credentials to admin as backup

---

## Gmail Setup (Recommended for Development)

### Step 1: Enable 2-Factor Authentication

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already enabled
3. Complete the 2FA setup process

### Step 2: Generate App Password

1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select app: **Mail**
3. Select device: **Other (Custom name)** → Enter "OneFlow" or your app name
4. Click **Generate**
5. Copy the 16-character password (format: `xxxx xxxx xxxx xxxx`)

### Step 3: Update .env File

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM_NAME=OneFlow
SMTP_FROM_EMAIL=your-email@gmail.com
```

**Important:** Use the app password, not your regular Gmail password!

---

## Alternative SMTP Services

### Outlook/Office 365

```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### SendGrid

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### Mailgun

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
```

### AWS SES

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-ses-smtp-username
SMTP_PASS=your-ses-smtp-password
```

---

## Testing Email Configuration

### Method 1: Using the Admin Dashboard

1. Log in as admin
2. Go to Admin Panel
3. Try inviting a test user
4. Check if the success message says "credentials sent via email"
5. Check the recipient's inbox (and spam folder)

### Method 2: Server Logs

Check the console output when sending invitations:
```
Email sent successfully: <message-id>
```

Or if it fails:
```
Error sending email: [error details]
```

---

## Troubleshooting

### "Email sending failed" Message

**Possible causes:**

1. **Invalid credentials**
   - Double-check SMTP_USER and SMTP_PASS
   - For Gmail, ensure you're using App Password, not regular password

2. **Firewall/Network issues**
   - Port 587 might be blocked
   - Try using port 465 with SMTP_SECURE=true

3. **Less secure app access (Gmail)**
   - Gmail doesn't allow this anymore
   - You MUST use App Passwords with 2FA enabled

4. **Rate limiting**
   - Gmail: 500 emails/day for free accounts
   - 2000 emails/day for Google Workspace accounts

### Email Goes to Spam

To improve deliverability:

1. **Use a custom domain** (not Gmail)
2. **Set up SPF records** for your domain
3. **Set up DKIM** for email authentication
4. **Use a professional email service** (SendGrid, Mailgun, AWS SES)

### Testing Without Real Email

For development, you can use:

1. **Mailtrap** (https://mailtrap.io)
   - Catches all emails without sending them
   - Perfect for testing

2. **Ethereal Email** (https://ethereal.email)
   - Free fake SMTP service
   - Generates test accounts instantly

Example for Mailtrap:
```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-username
SMTP_PASS=your-mailtrap-password
```

---

## Email Template Customization

The email template is located in: `src/lib/mailer.js`

You can customize:
- Email subject
- HTML layout and styling
- Company branding
- Email content and messaging

---

## Production Recommendations

For production use:

1. **Use a dedicated email service** (SendGrid, Mailgun, AWS SES, etc.)
2. **Set up a custom domain** for better deliverability
3. **Configure SPF, DKIM, and DMARC** records
4. **Monitor email delivery rates**
5. **Handle bounce and complaint notifications**
6. **Add email queue system** for reliability (Bull, BullMQ, etc.)

---

## Security Notes

⚠️ **Important:**

- Never commit `.env` file to version control
- Use environment variables in production
- Rotate SMTP passwords regularly
- Monitor for suspicious email activity
- Implement rate limiting for invitation endpoints

---

## Support

If you continue to have issues:

1. Check server logs for detailed error messages
2. Test SMTP credentials using an email client
3. Verify firewall/network settings
4. Contact your SMTP provider's support
