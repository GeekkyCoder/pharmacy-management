const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const isTokenValid = async (token) => {
  const decodedMessage = jwt.verify(token, process.env.JWT_SECRET);
  return decodedMessage;
};

// Generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Create verification link
const createVerificationLink = (token, userType) => {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  return `${baseUrl}/update-password?token=${token}&type=${userType}`;
};

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // You can change this to other services like 'outlook', 'yahoo', etc.
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS, // Your email password or app password
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Alternative configuration for custom SMTP
// const createCustomTransporter = () => {
//   return nodemailer.createTransporter({
//     host: process.env.SMTP_HOST, // e.g., 'smtp.gmail.com'
//     port: process.env.SMTP_PORT || 587,
//     secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });
// };

// Send email function
const sendEmail = async (options) => {
  try {
    // Validate required options
    if (!options.to || !options.subject) {
      throw new Error('Email recipient and subject are required');
    }

    // Create transporter
    const transporter = createTransporter();

    // Email options
    const mailOptions = {
      from: {
        name: options.fromName || 'Pharmacy Management System',
        address: process.env.EMAIL_USER
      },
      to: options.to,
      subject: options.subject,
      text: options.text, // Plain text body
      html: options.html, // HTML body
      attachments: options.attachments || [], // Optional attachments
    };

    // Send email
    const result = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', result.messageId);
    return {
      success: true,
      messageId: result.messageId,
      message: 'Email sent successfully'
    };

  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to send email'
    };
  }
};

// Email templates
const emailTemplates = {
  // Welcome email for new employees
  welcomeEmployee: (employeeName, adminName, loginCredentials) => ({
    subject: 'Welcome to Pharmacy Management System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0070a4;">Welcome to Pharmacy Management System</h2>
        <p>Dear ${employeeName},</p>
        <p>Welcome to our pharmacy management system! You have been added as an employee by <strong>${adminName}</strong>.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>Your Login Credentials:</h3>
          <p><strong>Email:</strong> ${loginCredentials.email}</p>
          <p><strong>Temporary Password:</strong> ${loginCredentials.password}</p>
        </div>
        
        <p style="color: #d9534f;"><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
        
        <p>If you have any questions, please contact your administrator.</p>
        
        <p>Best regards,<br>Pharmacy Management System</p>
      </div>
    `,
    text: `Welcome to Pharmacy Management System\n\nDear ${employeeName},\n\nYou have been added as an employee by ${adminName}.\n\nLogin Credentials:\nEmail: ${loginCredentials.email}\nPassword: ${loginCredentials.password}\n\nPlease change your password after first login.\n\nBest regards,\nPharmacy Management System`
  }),

  // Low stock alert
  lowStockAlert: (medicines, adminName) => ({
    subject: 'Low Stock Alert - Pharmacy Management System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d9534f;">⚠️ Low Stock Alert</h2>
        <p>Dear ${adminName},</p>
        <p>The following medicines are running low in stock:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Medicine Name</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Current Stock</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${medicines.map(med => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${med.Med_Name}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${med.Med_Qty}</td>
                <td style="border: 1px solid #ddd; padding: 8px; color: ${med.Med_Qty <= 0 ? '#d9534f' : '#f0ad4e'};">
                  ${med.Med_Qty <= 0 ? 'Out of Stock' : 'Low Stock'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <p>Please restock these medicines as soon as possible.</p>
        
        <p>Best regards,<br>Pharmacy Management System</p>
      </div>
    `,
    text: `Low Stock Alert\n\nDear ${adminName},\n\nThe following medicines are running low:\n\n${medicines.map(med => `${med.Med_Name}: ${med.Med_Qty} units`).join('\n')}\n\nPlease restock soon.\n\nBest regards,\nPharmacy Management System`
  }),

  // Medicine expiry alert
  expiryAlert: (medicines, adminName) => ({
    subject: 'Medicine Expiry Alert - Pharmacy Management System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d9534f;">⚠️ Medicine Expiry Alert</h2>
        <p>Dear ${adminName},</p>
        <p>The following medicines are expiring soon or have expired:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Medicine Name</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Expiry Date</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${medicines.map(med => {
              const isExpired = new Date(med.Expiry_Date) < new Date();
              return `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">${med.Med_Name}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${new Date(med.Expiry_Date).toLocaleDateString()}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; color: ${isExpired ? '#d9534f' : '#f0ad4e'};">
                    ${isExpired ? 'Expired' : 'Expiring Soon'}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        
        <p>Please take appropriate action for these medicines.</p>
        
        <p>Best regards,<br>Pharmacy Management System</p>
      </div>
    `
  }),

  // Daily report template
  dailyReport: (reportData, recipientName) => {
    const formattedRevenue = new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR'
    }).format(reportData.todayRevenue || 0.00);

    return {
      subject: `Daily Pharmacy Report - ${reportData.date}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">📊 Daily Pharmacy Report</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">${reportData.date}</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <p style="margin-top: 0;">Dear ${recipientName},</p>
            <p>Here's your daily pharmacy management report:</p>
            
            <!-- Summary Cards -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0;">
              <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h3 style="margin: 0 0 5px 0; color: #28a745; font-size: 16px;">💰 Today's Revenue</h3>
                <p style="margin: 0; font-size: 20px; font-weight: bold;">${formattedRevenue}</p>
              </div>
              
              <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h3 style="margin: 0 0 5px 0; color: #007bff; font-size: 16px;">🛒 Today's Sales</h3>
                <p style="margin: 0; font-size: 20px; font-weight: bold;">${reportData.todaySales} transactions</p>
              </div>
              
              <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #6f42c1; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h3 style="margin: 0 0 5px 0; color: #6f42c1; font-size: 16px;">💊 Total Medicines</h3>
                <p style="margin: 0; font-size: 20px; font-weight: bold;">${reportData.totalMedicines}</p>
              </div>
              
              <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #17a2b8; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h3 style="margin: 0 0 5px 0; color: #17a2b8; font-size: 16px;">👥 Total Employees</h3>
                <p style="margin: 0; font-size: 20px; font-weight: bold;">${reportData.totalEmployees}</p>
              </div>
            </div>
            
            ${reportData.lowStockMedicines && reportData.lowStockMedicines.length > 0 ? `
            <!-- Low Stock Alert -->
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #856404;">⚠️ Low Stock Alert (${reportData.lowStockMedicines.length} items)</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #ffeaa7;">
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Medicine Name</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Current Stock</th>
                  </tr>
                </thead>
                <tbody>
                  ${reportData.lowStockMedicines.map(med => `
                    <tr>
                      <td style="border: 1px solid #ddd; padding: 8px;">${med.Med_Name}</td>
                      <td style="border: 1px solid #ddd; padding: 8px; color: ${med.Med_Qty <= 0 ? '#dc3545' : '#ffc107'};">
                        ${med.Med_Qty} ${med.Med_Qty <= 0 ? '(Out of Stock)' : '(Low Stock)'}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            ` : ''}
            
            ${reportData.expiringMedicines && reportData.expiringMedicines.length > 0 ? `
            <!-- Expiry Alert -->
            <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #721c24;">🗓️ Medicines Expiring Soon (${reportData.expiringMedicines.length} items)</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #f5c6cb;">
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Medicine Name</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Expiry Date</th>
                  </tr>
                </thead>
                <tbody>
                  ${reportData.expiringMedicines.map(med => `
                    <tr>
                      <td style="border: 1px solid #ddd; padding: 8px;">${med.Med_Name}</td>
                      <td style="border: 1px solid #ddd; padding: 8px;">${new Date(med.Expiry_Date).toLocaleDateString()}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            ` : ''}
            
            <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 8px; border: 1px solid #e9ecef;">
              <p style="margin: 0; color: #6c757d; font-size: 14px;">
                📧 This is an automated daily report generated at 8:00 AM. 
                For any questions or concerns, please contact your system administrator.
              </p>
            </div>
            
            <p style="margin-top: 20px;">Best regards,<br><strong>Pharmacy Management System</strong></p>
          </div>
        </div>
      `,
      text: `Daily Pharmacy Report - ${reportData.date}
      
Dear ${recipientName},

Today's Summary:
- Revenue: ${formattedRevenue}
- Sales Transactions: ${reportData.todaySales}
- Total Medicines: ${reportData.totalMedicines}
- Total Employees: ${reportData.totalEmployees}

${reportData.lowStockMedicines && reportData.lowStockMedicines.length > 0 ? `
Low Stock Items (${reportData.lowStockMedicines.length}):
${reportData.lowStockMedicines.map(med => `- ${med.Med_Name}: ${med.Med_Qty} units`).join('\n')}
` : ''}

${reportData.expiringMedicines && reportData.expiringMedicines.length > 0 ? `
Expiring Soon (${reportData.expiringMedicines.length}):
${reportData.expiringMedicines.map(med => `- ${med.Med_Name}: ${new Date(med.Expiry_Date).toLocaleDateString()}`).join('\n')}
` : ''}

Best regards,
Pharmacy Management System`
    };
  }
};

module.exports = {
  isTokenValid,
  sendEmail,
  emailTemplates,
  generateVerificationToken,
  createVerificationLink
};