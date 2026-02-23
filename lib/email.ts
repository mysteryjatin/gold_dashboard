import nodemailer from 'nodemailer'

export interface LoginNotificationData {
  email: string
  ipAddress: string
  userAgent: string
  location?: {
    city?: string
    region?: string
    country?: string
    timezone?: string
    coordinates?: {
      lat?: number
      lon?: number
    }
  }
  deviceInfo: {
    browser?: string
    os?: string
    device?: string
  }
  timestamp: Date
}

function getSmtpConfig() {
  const smtpHost = process.env.SMTP_HOST || process.env.EMAIL_HOST
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER
  const smtpPassword = process.env.SMTP_PASSWORD || process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD
  const smtpPort = process.env.SMTP_PORT || process.env.EMAIL_PORT
  const smtpSecure = process.env.SMTP_SECURE || process.env.EMAIL_SECURE
  const smtpFrom = process.env.SMTP_FROM || process.env.EMAIL_FROM || smtpUser

  if (!smtpHost || !smtpUser || !smtpPassword) {
    throw new Error('SMTP configuration is missing')
  }

  const port = smtpPort ? parseInt(smtpPort) : 587
  const isSecure = port === 465 || smtpSecure === 'true'
  const connectionTimeout = parseInt(process.env.SMTP_TIMEOUT || process.env.EMAIL_TIMEOUT || '30000')

  return {
    host: smtpHost,
    port,
    secure: isSecure,
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
    connectionTimeout,
    greetingTimeout: connectionTimeout,
    socketTimeout: connectionTimeout * 2,
    tls: {
      rejectUnauthorized: (process.env.SMTP_REJECT_UNAUTHORIZED || process.env.EMAIL_REJECT_UNAUTHORIZED) !== 'false',
    },
    from: smtpFrom,
  }
}

function formatTimestamp(date: Date, timezone?: string): string {
  try {
    // Use the server's local timezone (system time) instead of converting
    // This shows the actual time when the login occurred on the server
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const month = monthNames[date.getMonth()]
    const day = date.getDate()
    const year = date.getFullYear()
    let hours = date.getHours()
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12
    hours = hours ? hours : 12
    
    // Get timezone abbreviation if available
    const timezoneName = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
    
    return `${month} ${day}, ${year}, ${hours}:${minutes} ${ampm}`
  } catch (error) {
    // Fallback formatting
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const month = monthNames[date.getMonth()]
    const day = date.getDate()
    const year = date.getFullYear()
    let hours = date.getHours()
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12
    hours = hours ? hours : 12
    return `${month} ${day}, ${year}, ${hours}:${minutes} ${ampm}`
  }
}

export interface PasswordChangeNotificationData {
  email: string
  name?: string
  ipAddress: string
  userAgent: string
  timestamp: Date
}

export async function sendPasswordChangeNotification(data: PasswordChangeNotificationData): Promise<void> {
  try {
    const config = getSmtpConfig()
    const transporter = nodemailer.createTransport(config)

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            margin: 0; 
            padding: 0; 
            background-color: #f5f5f5; 
            color: #333333;
            line-height: 1.6;
          }
          .email-wrapper { 
            max-width: 650px; 
            margin: 40px auto; 
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: linear-gradient(135deg, #E6C15A 0%, #D4AF37 100%); 
            color: #0B0B0B; 
            padding: 40px 30px; 
            text-align: center;
            position: relative;
          }
          .header::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent);
          }
          .header h1 { 
            margin: 0 0 10px 0;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.5px;
          }
          .header .subtitle {
            font-size: 14px;
            opacity: 0.8;
            font-weight: 500;
          }
          .content { 
            padding: 40px 30px; 
            background-color: #ffffff;
          }
          .alert-banner {
            background: linear-gradient(135deg, rgba(230, 193, 90, 0.15) 0%, rgba(212, 175, 55, 0.1) 100%);
            border-left: 4px solid #E6C15A;
            padding: 20px;
            margin-bottom: 30px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 15px;
          }
          .alert-icon {
            font-size: 32px;
            flex-shrink: 0;
          }
          .alert-content {
            flex: 1;
          }
          .alert-content strong {
            display: block;
            color: #0B0B0B;
            font-size: 16px;
            margin-bottom: 5px;
            font-weight: 600;
          }
          .alert-content p {
            margin: 0;
            color: #333;
            font-size: 14px;
            opacity: 0.9;
          }
          .info-card {
            background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
            border: 1px solid #e9ecef;
            border-radius: 10px;
            padding: 25px;
            margin-bottom: 20px;
          }
          .card-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #E6C15A;
          }
          .card-icon {
            font-size: 24px;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #E6C15A 0%, #D4AF37 100%);
            border-radius: 8px;
            color: #0B0B0B;
            font-weight: bold;
          }
          .card-title {
            color: #0B0B0B;
            font-size: 18px;
            font-weight: 600;
            margin: 0;
          }
          .info-item {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 12px 0;
            border-bottom: 1px solid #e9ecef;
          }
          .info-item:last-child {
            border-bottom: none;
          }
          .info-label {
            color: #666;
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            min-width: 120px;
          }
          .info-value {
            color: #0B0B0B;
            font-size: 14px;
            font-weight: 500;
            text-align: right;
            word-break: break-word;
            flex: 1;
            margin-left: 15px;
          }
          .security-warning {
            background: linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 107, 107, 0.05) 100%);
            border-left: 4px solid #ff6b6b;
            padding: 20px;
            margin-top: 30px;
            border-radius: 8px;
            display: flex;
            align-items: flex-start;
            gap: 15px;
          }
          .warning-icon {
            font-size: 28px;
            flex-shrink: 0;
          }
          .warning-content {
            flex: 1;
          }
          .warning-content strong {
            display: block;
            color: #d32f2f;
            font-size: 16px;
            margin-bottom: 8px;
            font-weight: 600;
          }
          .warning-content p {
            margin: 0;
            color: #333;
            font-size: 14px;
            line-height: 1.6;
          }
          .footer { 
            text-align: center; 
            padding: 30px;
            background-color: #f8f9fa;
            border-top: 1px solid #e9ecef;
          }
          .footer p {
            margin: 5px 0;
            color: #666;
            font-size: 12px;
          }
          .footer .brand {
            color: #E6C15A;
            font-weight: 600;
            font-size: 14px;
          }
          @media only screen and (max-width: 600px) {
            .email-wrapper {
              margin: 0;
              border-radius: 0;
            }
            .header, .content, .footer {
              padding: 25px 20px;
            }
            .info-item {
              flex-direction: column;
              align-items: flex-start;
            }
            .info-value {
              text-align: left;
              margin-left: 0;
              margin-top: 5px;
            }
          }
        </style>
      </head>
      <body>
        <div style="background-color: #f5f5f5; padding: 20px 0;">
          <div class="email-wrapper">
            <div class="header">
              <h1>🔒 Password Changed</h1>
              <div class="subtitle">Security Notification</div>
            </div>
            
            <div class="content">
              <div class="alert-banner">
                <div class="alert-icon">✅</div>
                <div class="alert-content">
                  <strong>Password Successfully Changed</strong>
                  <p>Your password has been updated successfully. If you did not make this change, please contact support immediately.</p>
                </div>
              </div>

              <div class="info-card">
                <div class="card-header">
                  <div class="card-icon">📋</div>
                  <h3 class="card-title">Change Details</h3>
                </div>
                <div class="info-item">
                  <span class="info-label">Account</span>
                  <span class="info-value">${data.email}</span>
                </div>
                ${data.name ? `
                <div class="info-item">
                  <span class="info-label">Name</span>
                  <span class="info-value">${data.name}</span>
                </div>
                ` : ''}
                <div class="info-item">
                  <span class="info-label">Time</span>
                  <span class="info-value">${formatTimestamp(data.timestamp)}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">IP Address</span>
                  <span class="info-value">${data.ipAddress}</span>
                </div>
              </div>

              <div class="security-warning">
                <div class="warning-icon">⚠️</div>
                <div class="warning-content">
                  <strong>Security Notice</strong>
                  <p>If you did not change your password, your account may have been compromised. Please contact support immediately and consider changing your password again from a secure device.</p>
                </div>
              </div>
            </div>

            <div class="footer">
              <p><span class="brand">GoldenEdge AI</span> Dashboard</p>
              <p>This is an automated security notification.</p>
              <p style="margin-top: 15px; opacity: 0.7;">© ${new Date().getFullYear()} GoldenEdge AI. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    const text = `
Password Changed - GoldenEdge AI Dashboard

Your password has been successfully changed.

Change Details:
- Account: ${data.email}
${data.name ? `- Name: ${data.name}` : ''}
- Time: ${formatTimestamp(data.timestamp)}
- IP Address: ${data.ipAddress}

⚠️ Security Notice:
If you did not change your password, your account may have been compromised. Please contact support immediately and consider changing your password again from a secure device.

This is an automated security notification from GoldenEdge AI Dashboard.
    `

    await transporter.sendMail({
      from: config.from,
      to: data.email,
      subject: '🔒 Password Changed - GoldenEdge AI Dashboard',
      html,
      text,
    })
  } catch (error) {
    console.error('Failed to send password change notification email:', error)
    // Don't throw - we don't want email failures to block password change
  }
}

export async function sendLoginNotification(data: LoginNotificationData): Promise<void> {
  try {
    const config = getSmtpConfig()
    const transporter = nodemailer.createTransport(config)

    const locationText = data.location
      ? `${data.location.city || 'Unknown'}, ${data.location.region || ''}, ${data.location.country || 'Unknown'}`
      : 'Unable to determine location'

    const coordinatesText = data.location?.coordinates
      ? `${data.location.coordinates.lat}, ${data.location.coordinates.lon}`
      : 'Not available'

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            margin: 0; 
            padding: 0; 
            background-color: #f5f5f5; 
            color: #333333;
            line-height: 1.6;
          }
          .email-wrapper { 
            max-width: 650px; 
            margin: 40px auto; 
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: linear-gradient(135deg, #E6C15A 0%, #D4AF37 100%); 
            color: #0B0B0B; 
            padding: 40px 30px; 
            text-align: center;
            position: relative;
          }
          .header::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent);
          }
          .header h1 { 
            margin: 0 0 10px 0;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.5px;
          }
          .header .subtitle {
            font-size: 14px;
            opacity: 0.8;
            font-weight: 500;
          }
          .content { 
            padding: 40px 30px; 
            background-color: #ffffff;
          }
          .alert-banner {
            background: linear-gradient(135deg, rgba(230, 193, 90, 0.15) 0%, rgba(212, 175, 55, 0.1) 100%);
            border-left: 4px solid #E6C15A;
            padding: 20px;
            margin-bottom: 30px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 15px;
          }
          .alert-icon {
            font-size: 32px;
            flex-shrink: 0;
          }
          .alert-content {
            flex: 1;
          }
          .alert-content strong {
            display: block;
            color: #0B0B0B;
            font-size: 16px;
            margin-bottom: 5px;
            font-weight: 600;
          }
          .alert-content p {
            margin: 0;
            color: #333;
            font-size: 14px;
            opacity: 0.9;
          }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
          }
          .info-card {
            background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
            border: 1px solid #e9ecef;
            border-radius: 10px;
            padding: 25px;
            transition: transform 0.2s, box-shadow 0.2s;
          }
          .info-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          }
          .card-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #E6C15A;
          }
          .card-icon {
            font-size: 24px;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #E6C15A 0%, #D4AF37 100%);
            border-radius: 8px;
            color: #0B0B0B;
            font-weight: bold;
          }
          .card-title {
            color: #0B0B0B;
            font-size: 18px;
            font-weight: 600;
            margin: 0;
          }
          .info-item {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 12px 0;
            border-bottom: 1px solid #e9ecef;
          }
          .info-item:last-child {
            border-bottom: none;
          }
          .info-label {
            color: #666;
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            min-width: 120px;
          }
          .info-value {
            color: #0B0B0B;
            font-size: 14px;
            font-weight: 500;
            text-align: right;
            word-break: break-word;
            flex: 1;
            margin-left: 15px;
          }
          .badge {
            display: inline-block;
            padding: 6px 12px;
            background: linear-gradient(135deg, #E6C15A 0%, #D4AF37 100%);
            color: #0B0B0B;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-left: 8px;
          }
          .security-warning {
            background: linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 107, 107, 0.05) 100%);
            border-left: 4px solid #ff6b6b;
            padding: 20px;
            margin-top: 30px;
            border-radius: 8px;
            display: flex;
            align-items: flex-start;
            gap: 15px;
          }
          .warning-icon {
            font-size: 28px;
            flex-shrink: 0;
          }
          .warning-content {
            flex: 1;
          }
          .warning-content strong {
            display: block;
            color: #d32f2f;
            font-size: 16px;
            margin-bottom: 8px;
            font-weight: 600;
          }
          .warning-content p {
            margin: 0;
            color: #333;
            font-size: 14px;
            line-height: 1.6;
          }
          .footer { 
            text-align: center; 
            padding: 30px;
            background-color: #f8f9fa;
            border-top: 1px solid #e9ecef;
          }
          .footer p {
            margin: 5px 0;
            color: #666;
            font-size: 12px;
          }
          .footer .brand {
            color: #E6C15A;
            font-weight: 600;
            font-size: 14px;
          }
          .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #e9ecef, transparent);
            margin: 25px 0;
          }
          @media only screen and (max-width: 600px) {
            .email-wrapper {
              margin: 0;
              border-radius: 0;
            }
            .header, .content, .footer {
              padding: 25px 20px;
            }
            .info-grid {
              grid-template-columns: 1fr;
            }
            .info-item {
              flex-direction: column;
              align-items: flex-start;
            }
            .info-value {
              text-align: left;
              margin-left: 0;
              margin-top: 5px;
            }
          }
        </style>
      </head>
      <body>
        <div style="background-color: #f5f5f5; padding: 20px 0;">
          <div class="email-wrapper">
            <div class="header">
              <h1>🔐 New Login Detected</h1>
              <div class="subtitle">Security Notification</div>
            </div>
            
            <div class="content">
              <div class="alert-banner">
                <div class="alert-icon">⚠️</div>
                <div class="alert-content">
                  <strong>Security Alert</strong>
                  <p>A new login to your GoldenEdge AI Dashboard account was detected. Please review the details below.</p>
                </div>
              </div>

              <div class="info-grid">
                <div class="info-card">
                  <div class="card-header">
                    <div class="card-icon">📧</div>
                    <h3 class="card-title">Login Details</h3>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Email</span>
                    <span class="info-value">${data.email}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Time</span>
                    <span class="info-value">${formatTimestamp(data.timestamp, data.location?.timezone)}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">IP Address</span>
                    <span class="info-value">${data.ipAddress}</span>
                  </div>
                </div>

                <div class="info-card">
                  <div class="card-header">
                    <div class="card-icon">📍</div>
                    <h3 class="card-title">Location</h3>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Location</span>
                    <span class="info-value">${locationText}</span>
                  </div>
                  ${data.location?.coordinates ? `
                  <div class="info-item">
                    <span class="info-label">Coordinates</span>
                    <span class="info-value">${coordinatesText}</span>
                  </div>
                  ` : ''}
                  ${data.location?.timezone ? `
                  <div class="info-item">
                    <span class="info-label">Timezone</span>
                    <span class="info-value">${data.location.timezone}</span>
                  </div>
                  ` : ''}
                </div>

                <div class="info-card">
                  <div class="card-header">
                    <div class="card-icon">💻</div>
                    <h3 class="card-title">Device Info</h3>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Browser</span>
                    <span class="info-value">${data.deviceInfo.browser || 'Unknown'}<span class="badge">${data.deviceInfo.browser || 'N/A'}</span></span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">OS</span>
                    <span class="info-value">${data.deviceInfo.os || 'Unknown'}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Device</span>
                    <span class="info-value">${data.deviceInfo.device || 'Unknown'}</span>
                  </div>
                </div>
              </div>

              <div class="divider"></div>

              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                  <span style="font-size: 18px;">🔍</span>
                  <strong style="color: #0B0B0B; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">User Agent</strong>
                </div>
                <code style="display: block; color: #666; font-size: 11px; word-break: break-all; line-height: 1.5; background-color: #ffffff; padding: 12px; border-radius: 6px; border: 1px solid #e9ecef;">${data.userAgent}</code>
              </div>

              <div class="security-warning">
                <div class="warning-icon">🚨</div>
                <div class="warning-content">
                  <strong>Security Notice</strong>
                  <p>If you did not perform this login, please secure your account immediately by changing your password. This could indicate unauthorized access to your account.</p>
                </div>
              </div>
            </div>

            <div class="footer">
              <p><span class="brand">GoldenEdge AI</span> Dashboard</p>
              <p>This is an automated security notification.</p>
              <p style="margin-top: 15px; opacity: 0.7;">© ${new Date().getFullYear()} GoldenEdge AI. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    const text = `
New Login Detected - GoldenEdge AI Dashboard

Security Alert: A new login to your account was detected.

Login Details:
- Email: ${data.email}
- Time: ${formatTimestamp(data.timestamp, data.location?.timezone)}
- IP Address: ${data.ipAddress}

Location Information:
- Location: ${locationText}
${data.location?.coordinates ? `- Coordinates: ${coordinatesText}` : ''}
${data.location?.timezone ? `- Timezone: ${data.location.timezone}` : ''}

Device & System Information:
- Browser: ${data.deviceInfo.browser || 'Unknown'}
- Operating System: ${data.deviceInfo.os || 'Unknown'}
- Device Type: ${data.deviceInfo.device || 'Unknown'}
- User Agent: ${data.userAgent}

⚠️ Security Notice:
If you did not perform this login, please secure your account immediately by changing your password.

This is an automated security notification from GoldenEdge AI Dashboard.
    `

    await transporter.sendMail({
      from: config.from,
      to: data.email,
      subject: '🔐 New Login Detected - GoldenEdge AI Dashboard',
      html,
      text,
    })
  } catch (error) {
    console.error('Failed to send login notification email:', error)
    // Don't throw - we don't want email failures to block login
  }
}
