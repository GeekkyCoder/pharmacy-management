const nodemailer = require('nodemailer');


const createTransporter = () => {
  
  const config = {
    host: process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || process.env.SMTP_PORT) || 587,
    secure: false, 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },

    tls: {
      rejectUnauthorized: false 
    },
    connectionTimeout: 60000, 
    greetingTimeout: 30000,   
    socketTimeout: 60000,    
  };

 
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Email configuration error: EMAIL_USER and EMAIL_PASS are required');
    throw new Error('Email credentials not configured properly');
  }

  // Log configuration (without sensitive data) for debugging
  console.log('Email transporter config:', {
    host: config.host,
    port: config.port,
    secure: config.secure,
    hasUser: !!config.auth.user,
    hasPass: !!config.auth.pass,
  });

  return nodemailer.createTransport(config);
};

// Email templates
const getVerificationEmailTemplate = (userName, email, password, verificationLink) => {
  return {
    subject: 'Welcome to Pharmacy Management System - Verify Your Account',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .credentials { background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .button { 
            display: inline-block; 
            background-color: #4CAF50; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
          }
          .warning { color: #d32f2f; font-weight: bold; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Pharmacy Management System</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>Your account has been created successfully. Please find your login credentials below:</p>
            
            <div class="credentials">
              <h3>Login Credentials:</h3>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Temporary Password:</strong> ${password}</p>
            </div>
            
            <p class="warning">⚠️ Important: For security reasons, you must update your password before you can access the system.</p>
            
            <p>Please click the button below to verify your account and set up your new password:</p>
            
            <a href="${verificationLink}" class="button">Verify Account & Update Password</a>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all;">${verificationLink}</p>
            
            <p>This verification link will expire in 24 hours for security reasons.</p>
          </div>
          <div class="footer">
            <p>© 2025 Pharmacy Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Welcome to Pharmacy Management System!
      
      Hello ${userName},
      
      Your account has been created successfully.
      
      Login Credentials:
      Email: ${email}
      Temporary Password: ${password}
      
      IMPORTANT: For security reasons, you must update your password before you can access the system.
      
      Please visit this link to verify your account and set up your new password:
      ${verificationLink}
      
      This verification link will expire in 24 hours.
      
      © 2025 Pharmacy Management System. All rights reserved.
    `
  };
};

// Send verification email with enhanced error handling
const sendVerificationEmail = async (to, userName, email, password, verificationLink) => {
  try {
    console.log(`Attempting to send verification email to: ${to}`);
    
    const transporter = createTransporter();
    
    // Verify transporter configuration
    await transporter.verify();
    console.log('Email transporter verified successfully');
    
    const emailTemplate = getVerificationEmailTemplate(userName, email, password, verificationLink);
    
    const mailOptions = {
      from: `"Pharmacy Management System" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', {
      messageId: result.messageId,
      to: to,
      accepted: result.accepted,
      rejected: result.rejected
    });
    
    return { 
      success: true, 
      messageId: result.messageId,
      accepted: result.accepted,
      rejected: result.rejected
    };
  } catch (error) {
    console.error('Error sending verification email:', {
      error: error.message,
      code: error.code,
      command: error.command,
      to: to
    });
    
    return { 
      success: false, 
      error: error.message,
      code: error.code 
    };
  }
};

module.exports = {
  sendVerificationEmail,
  createTransporter, // Export for testing purposes
};
