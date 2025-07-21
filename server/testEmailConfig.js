const { createTransporter } = require('./services/emailService');
require('dotenv').config();

/**
 * Email Configuration Test Utility
 * Run this script to verify your email configuration works correctly
 */

async function testEmailConfiguration() {
  console.log('🔍 Testing Email Configuration...\n');

  try {
    // Test 1: Check environment variables
    console.log('1. Checking Environment Variables:');
    const requiredVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error(`❌ Missing environment variables: ${missingVars.join(', ')}`);
      return;
    }
    
    console.log('✅ All required environment variables are set');
    console.log(`   EMAIL_HOST: ${process.env.EMAIL_HOST}`);
    console.log(`   EMAIL_PORT: ${process.env.EMAIL_PORT}`);
    console.log(`   EMAIL_USER: ${process.env.EMAIL_USER}`);
    console.log(`   EMAIL_PASS: ${'*'.repeat(process.env.EMAIL_PASS.length)}\n`);

    // Test 2: Create transporter
    console.log('2. Creating Email Transporter:');
    const transporter = createTransporter();
    console.log('✅ Transporter created successfully\n');

    // Test 3: Verify connection
    console.log('3. Verifying SMTP Connection:');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully\n');

    // Test 4: Send test email
    console.log('4. Sending Test Email:');
    const testEmail = {
      from: `"Pharmacy Management System" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to self for testing
      subject: 'Email Configuration Test - Pharmacy Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
            <h1>Email Configuration Test</h1>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h2>✅ Success!</h2>
            <p>This email confirms that your email configuration is working correctly.</p>
            <p><strong>Test Details:</strong></p>
            <ul>
              <li>SMTP Host: ${process.env.EMAIL_HOST}</li>
              <li>SMTP Port: ${process.env.EMAIL_PORT}</li>
              <li>From Email: ${process.env.EMAIL_USER}</li>
              <li>Test Time: ${new Date().toISOString()}</li>
            </ul>
            <p>Your Pharmacy Management System is ready to send verification emails!</p>
          </div>
          <div style="text-align: center; color: #666; font-size: 12px; margin-top: 20px;">
            <p>© 2025 Pharmacy Management System. All rights reserved.</p>
          </div>
        </div>
      `,
      text: `
Email Configuration Test - Success!

This email confirms that your email configuration is working correctly.

Test Details:
- SMTP Host: ${process.env.EMAIL_HOST}
- SMTP Port: ${process.env.EMAIL_PORT}
- From Email: ${process.env.EMAIL_USER}
- Test Time: ${new Date().toISOString()}

Your Pharmacy Management System is ready to send verification emails!
      `
    };

    const result = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log(`   Message ID: ${result.messageId}`);
    console.log(`   Accepted: ${result.accepted.join(', ')}`);
    console.log(`   Rejected: ${result.rejected.join(', ')}`);

    console.log('\n🎉 Email Configuration Test Completed Successfully!');
    console.log('\n📧 Check your email inbox for the test message.');
    console.log('   If you don\'t see it, check your spam/junk folder.');

  } catch (error) {
    console.error('\n❌ Email Configuration Test Failed:');
    console.error(`   Error: ${error.message}`);
    
    if (error.code) {
      console.error(`   Error Code: ${error.code}`);
    }
    
    // Provide specific troubleshooting based on error
    if (error.code === 'EAUTH') {
      console.error('\n🔧 Troubleshooting:');
      console.error('   - Verify your email and app password are correct');
      console.error('   - Ensure 2-factor authentication is enabled on Gmail');
      console.error('   - Generate a new app password if needed');
    } else if (error.code === 'ECONNECTION') {
      console.error('\n🔧 Troubleshooting:');
      console.error('   - Check your internet connection');
      console.error('   - Verify SMTP host and port are correct');
      console.error('   - Check if firewall is blocking the connection');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('\n🔧 Troubleshooting:');
      console.error('   - Network timeout occurred');
      console.error('   - Try again in a few minutes');
      console.error('   - Check your server\'s internet connection');
    }
  }
}

// Run the test
if (require.main === module) {
  testEmailConfiguration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { testEmailConfiguration };
