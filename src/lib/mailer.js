import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send welcome email with credentials to new user
 * @param {Object} params - Email parameters
 * @param {string} params.to - Recipient email
 * @param {string} params.companyId - Company ID
 * @param {string} params.companyName - Company name
 * @param {string} params.email - User's email
 * @param {string} params.password - Generated password
 * @param {string} params.role - User's role
 */
export async function sendWelcomeEmail({ to, companyId, companyName, email, password, role }) {
  const loginUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'OneFlow'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to,
    subject: `Welcome to ${companyName} - Your Account Credentials`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .credentials { background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .credential-item { margin: 15px 0; }
          .credential-label { font-weight: bold; color: #667eea; display: block; margin-bottom: 5px; }
          .credential-value { background: #f0f0f0; padding: 10px; border-radius: 5px; font-family: 'Courier New', monospace; font-size: 14px; word-break: break-all; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to ${companyName}!</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>Your account has been created successfully. You can now access the system using the credentials below.</p>
            
            <div class="credentials">
              <h3 style="margin-top: 0; color: #667eea;">Your Login Credentials</h3>
              
              <div class="credential-item">
                <span class="credential-label">Company ID:</span>
                <div class="credential-value">${companyId}</div>
              </div>
              
              <div class="credential-item">
                <span class="credential-label">Email:</span>
                <div class="credential-value">${email}</div>
              </div>
              
              <div class="credential-item">
                <span class="credential-label">Password (temporary):</span>
                <div class="credential-value">${password}</div>
              </div>
              
              <div class="credential-item">
                <span class="credential-label">Role:</span>
                <div class="credential-value">${role.replace(/_/g, ' ').toUpperCase()}</div>
              </div>
            </div>
            
            <div class="warning">
              <strong>⚠️ Important Security Notes:</strong>
              <ul style="margin: 10px 0;">
                <li>Please keep these credentials secure and do not share them with anyone.</li>
                <li>We recommend changing your password after your first login.</li>
                <li>All three credentials (Company ID, Email, and Password) are required to log in.</li>
              </ul>
            </div>
            
            <center>
              <a href="${loginUrl}/login" class="button">Login to Your Account</a>
            </center>
            
            <p style="margin-top: 30px;">If you have any questions or need assistance, please don't hesitate to contact your administrator.</p>
            
            <p>Best regards,<br><strong>${companyName} Team</strong></p>
          </div>
          
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Welcome to ${companyName}!

Your account has been created successfully. Here are your login credentials:

Company ID: ${companyId}
Email: ${email}
Password: ${password}
Role: ${role.replace(/_/g, ' ').toUpperCase()}

Login URL: ${loginUrl}/login

IMPORTANT: Please keep these credentials secure. All three (Company ID, Email, and Password) are required to log in.

Best regards,
${companyName} Team
    `.trim(),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Verify email configuration
 */
export async function verifyEmailConfig() {
  try {
    await transporter.verify();
    console.log('Email server is ready to send messages');
    return true;
  } catch (error) {
    console.error('Email server verification failed:', error);
    return false;
  }
}
