# Email Configuration for User/Employee Registration

Add these environment variables to your .env file in the server directory:

## Required Email Configuration

```
# Email Service Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL for verification links
FRONTEND_URL=http://localhost:5173
```

## How to setup Gmail SMTP:

1. Enable 2-factor authentication on your Gmail account
2. Generate an "App Password" (not your regular password)
3. Use this app password as EMAIL_PASS
4. Set EMAIL_USER to your full Gmail address

## Alternative Email Services:

### Outlook/Hotmail:
```
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

### Yahoo:
```
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
```

### Custom SMTP:
```
EMAIL_HOST=your-smtp-server.com
EMAIL_PORT=587
EMAIL_USER=your-username
EMAIL_PASS=your-password
```

## For Production:

Update FRONTEND_URL to your production domain:
```
FRONTEND_URL=https://your-domain.com
```

## Testing:

For development testing, you can use services like:
- Ethereal Email (temporary testing emails)
- MailHog (local email testing)
- Mailtrap (email testing service)
