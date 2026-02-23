# Login Email Notifications

This dashboard now sends automated email notifications for every successful login attempt with comprehensive security information.

## Features

### Email Notification Includes:

1. **Login Details**
   - Email address
   - Login timestamp (with timezone)
   - IP address

2. **Location Information**
   - City, Region, Country
   - Geographic coordinates (latitude/longitude)
   - Timezone

3. **Device & System Information**
   - Browser type (Chrome, Firefox, Safari, Edge, etc.)
   - Operating System (Windows, macOS, Linux, iOS, Android)
   - Device type (Desktop, Mobile, Tablet)
   - Full User Agent string

4. **Security Alerts**
   - Warning message if login was unauthorized
   - Instructions to secure account if needed

## Configuration

The email notifications use the SMTP configuration from your `.env` file:

```env
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=info@goldenedge.ai
SMTP_PASSWORD=Edgegold@2026
SMTP_FROM=info@goldenedge.ai
SMTP_REJECT_UNAUTHORIZED=false
```

## How It Works

1. **User logs in** → Authentication is verified
2. **System collects information**:
   - Extracts IP address from request headers (supports proxies, Cloudflare, etc.)
   - Parses User Agent for browser/OS/device info
   - Fetches location data from IP geolocation API (ipapi.co)
3. **Email is sent** → Non-blocking (login completes even if email fails)
4. **User receives notification** → Detailed security email with all information

## IP Geolocation

The system uses **ipapi.co** for IP geolocation (free tier: 1000 requests/day).

- Automatically detects real IP from various proxy headers
- Falls back gracefully if geolocation fails
- Handles localhost/private IPs appropriately

## Security Features

- ✅ Email notifications don't block login (non-blocking)
- ✅ Handles email failures gracefully
- ✅ Supports various proxy configurations (Cloudflare, etc.)
- ✅ Detects device fingerprinting information
- ✅ Provides actionable security warnings

## Email Template

The email uses a professional HTML template with:
- GoldenEdge AI branding
- Dark theme matching dashboard design
- Clear information sections
- Security warnings
- Responsive design

## Testing

To test the email notifications:

1. Make sure SMTP settings are configured in `.env`
2. Log in to the dashboard
3. Check the email inbox for the login notification
4. Verify all information is displayed correctly

## Troubleshooting

### Email not sending?
- Check SMTP credentials in `.env`
- Verify SMTP server is accessible
- Check server logs for email errors
- Ensure `SMTP_REJECT_UNAUTHORIZED=false` if using self-signed certificates

### Location not showing?
- IP geolocation API may be rate-limited
- Private/localhost IPs won't show location
- Check API quota for ipapi.co
- Location fetch failures don't block login

### Missing device info?
- User Agent parsing may not detect all browsers/devices
- Some browsers may send limited User Agent strings
- System falls back to "Unknown" if detection fails
