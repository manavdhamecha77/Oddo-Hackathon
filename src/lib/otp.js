import nodemailer from 'nodemailer'

// In-memory store for OTPs (in production, use Redis or database)
const otpStore = new Map()

// Generate 4-digit OTP
export function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

// Store OTP with expiration (5 minutes)
export function storeOTP(email, otp) {
  const expiresAt = Date.now() + 5 * 60 * 1000 // 5 minutes
  otpStore.set(email, { otp, expiresAt })
}

// Verify OTP
export function verifyOTP(email, otp) {
  const stored = otpStore.get(email)
  
  if (!stored) {
    return { valid: false, message: 'OTP not found or expired' }
  }
  
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(email)
    return { valid: false, message: 'OTP expired' }
  }
  
  if (stored.otp !== otp) {
    return { valid: false, message: 'Invalid OTP' }
  }
  
  // OTP is valid, remove it
  otpStore.delete(email)
  return { valid: true, message: 'OTP verified successfully' }
}

// Create email transporter
function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  })
}

// Email template matching the app theme
function getOTPEmailTemplate(otp, userName) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); overflow: hidden;">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Email Verification</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                    Hello ${userName || 'there'},
                  </p>
                  
                  <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.6;">
                    Thank you for registering! To complete your registration, please use the following One-Time Password (OTP):
                  </p>
                  
                  <!-- OTP Box -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <div style="background-color: #f3f4f6; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; display: inline-block;">
                          <span style="font-size: 36px; font-weight: 700; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                            ${otp}
                          </span>
                        </div>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 30px 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                    This OTP will expire in <strong>5 minutes</strong>.
                  </p>
                  
                  <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                    If you didn't request this verification, please ignore this email.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                    This is an automated message, please do not reply.
                  </p>
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                    © ${new Date().getFullYear()} Your Company. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

// Send OTP email
export async function sendOTPEmail(email, otp, userName) {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: `"Your App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email - OTP Code',
      html: getOTPEmailTemplate(otp, userName),
    }
    
    await transporter.sendMail(mailOptions)
    return { success: true, message: 'OTP sent successfully' }
  } catch (error) {
    console.error('Error sending OTP email:', error)
    return { success: false, message: 'Failed to send OTP email' }
  }
}
