# Email Configuration for Production Deployment

## Overview
This guide explains how to configure email sending for the Pharmacy Management System in production environments.

## Current Configuration

The system uses Gmail SMTP for sending verification emails to new users/employees.

### Environment Variables Required

```env
# Email Service Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=farazahmedk955@gmail.com
EMAIL_PASS=aqfo ubsm jtwr mffj

# Frontend URL for verification links
FRONTEND_URL=https://pharmacy-management-sys.netlify.app

# Environment
NODE_ENV=production
```

## Gmail Setup Instructions

### 1. Enable 2-Factor Authentication
- Go to your Google Account settings
- Navigate to Security → 2-Step Verification
- Enable 2-Step Verification

### 2. Generate App Password
- Go to Security → App passwords
- Select "Mail" as the app
- Generate a 16-character app password
- Use this password as `EMAIL_PASS` (not your regular Gmail password)

### 3. Verify Configuration
The email service includes automatic verification and detailed logging:
- Connection verification on startup
- Detailed error logging with error codes
- Success confirmation with message IDs

## Production Considerations

### Security Features
- TLS encryption for email transmission
- App-specific passwords (not account passwords)
- Timeout configurations for reliability
- Input validation and sanitization

### Error Handling
- Graceful fallback if email service is unavailable
- Detailed error logging without exposing sensitive data
- Retry mechanisms for temporary failures

### Performance Optimizations
- Connection pooling for high volume
- Timeout settings optimized for production
- Async email sending to avoid blocking requests

## Alternative Email Providers

### SendGrid (Recommended for High Volume)
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your_sendgrid_api_key
```

### Amazon SES
```env
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=your_ses_smtp_username
EMAIL_PASS=your_ses_smtp_password
```

### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your_app_password
```

## Testing Email Configuration

### 1. Test Transporter Connection
The service automatically verifies the email configuration on startup and logs the results.

### 2. Monitor Logs
Check server logs for email-related messages:
- Configuration verification
- Send attempts and results
- Error details with codes

### 3. Test User Registration
- Create a test admin/employee account
- Verify email is received
- Test verification link functionality

## Troubleshooting

### Common Issues

**Authentication Failed (535)**
- Verify app password is correct
- Ensure 2FA is enabled on Gmail
- Check EMAIL_USER matches the Gmail account

**Connection Timeout**
- Verify EMAIL_HOST and EMAIL_PORT
- Check firewall/network restrictions
- Ensure server has internet access

**Invalid Recipients**
- Verify email addresses are valid
- Check for typos in recipient emails
- Ensure email domain exists

### Debug Mode
To enable detailed email debugging, the service logs:
- Transporter configuration (without passwords)
- Connection verification results
- Send attempt details
- Error codes and messages

## Email Template Customization

The verification email includes:
- Professional HTML template
- Temporary credentials
- Verification link with token
- Security warnings
- Company branding

To customize the template, modify the `getVerificationEmailTemplate` function in `/server/services/emailService.js`.

## Security Best Practices

1. **Never commit email passwords to version control**
2. **Use app-specific passwords, not account passwords**
3. **Enable 2FA on email accounts**
4. **Monitor email sending for abuse**
5. **Implement rate limiting for email endpoints**
6. **Regularly rotate email credentials**

## Monitoring and Alerts

Consider implementing:
- Email delivery rate monitoring
- Failed send attempt alerts
- Credential expiration warnings
- Volume-based alerts for abuse detection

## Support

For email configuration issues:
1. Check server logs for specific error codes
2. Verify environment variables are set correctly
3. Test email credentials manually
4. Contact email provider support if needed
