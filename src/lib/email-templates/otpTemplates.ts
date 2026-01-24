export function otpEmailTemplate(otp: string) {
    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="background:#f5f7fa;padding:0;margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;padding:40px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);overflow:hidden;">
            
            <!-- Header with Gradient -->
            <tr>
              <td style="padding:0;background:linear-gradient(135deg, hsl(220, 80%, 55%), hsl(180, 70%, 50%));text-align:center;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:40px 40px 35px;">
                      <div style="background:rgba(255,255,255,0.15);backdrop-filter:blur(10px);border-radius:12px;padding:20px;display:inline-block;border:1px solid rgba(255,255,255,0.2);">
                        <img src="/logo.webp" width="80" style="display:block;" alt="SR Portraits & Events Logo" />
                      </div>
                      <h1 style="margin:20px 0 0;font-size:28px;color:white;font-weight:600;letter-spacing:-0.5px;">
                        SR Portraits & Events
                      </h1>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Main Content -->
            <tr>
              <td style="padding:45px 50px;">
                <h2 style="margin:0 0 12px;font-size:24px;color:#1a1a1a;font-weight:600;letter-spacing:-0.3px;">
                  Verify Your Email Address
                </h2>
                <p style="font-size:15px;color:#6b7280;line-height:1.6;margin:0 0 35px;">
                  We've sent you this code to verify your email address. Enter the code below to complete your registration.
                </p>

                <!-- OTP Container -->
                <div style="background:linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);border-radius:12px;padding:35px;margin-bottom:35px;border:2px dashed #e2e8f0;">
                  <p style="font-size:13px;color:#64748b;margin:0 0 20px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">
                    Your Verification Code
                  </p>
                  
                  <!-- OTP Digits -->
                  <table align="center" cellpadding="0" cellspacing="0">
                    <tr>
                      ${otp
                          .split("")
                          .map(
                              (digit, index) => `
                        <td style="padding:0 6px;">
                          <div style="
                            width:55px;
                            height:65px;
                            background:linear-gradient(135deg, hsl(220, 80%, 55%), hsl(180, 70%, 50%));
                            color:white;
                            font-size:32px;
                            font-weight:700;
                            border-radius:12px;
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            box-shadow:0 4px 12px rgba(59, 130, 246, 0.3);
                            letter-spacing:0;
                            font-family:Consolas,Monaco,'Courier New',monospace;
                          ">
                            <table width="100%" height="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td align="center" valign="middle" style="color:white;font-size:32px;font-weight:700;">
                                  ${digit}
                                </td>
                              </tr>
                            </table>
                          </div>
                        </td>`
                          )
                          .join("")}
                    </tr>
                  </table>
                  
                  <p style="margin:25px 0 0;color:#64748b;font-size:13px;text-align:center;">
                    <strong style="color:#334155;">Expires in 10 minutes</strong>
                  </p>
                </div>

                <!-- Security Notice -->
                <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:16px 20px;border-radius:8px;margin-bottom:30px;">
                  <p style="margin:0;font-size:14px;color:#92400e;line-height:1.5;">
                    <strong style="display:block;margin-bottom:4px;">🔒 Security Tip</strong>
                    Never share this code with anyone. SR Portraits & Events will never ask for your verification code.
                  </p>
                </div>

                <!-- Alternative Action -->
                <p style="font-size:14px;color:#6b7280;line-height:1.6;margin:0;text-align:center;">
                  Didn't request this code? You can safely ignore this email.
                </p>
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="padding:0 50px;">
                <div style="height:1px;background:linear-gradient(to right, transparent, #e2e8f0, transparent);"></div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:30px 50px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="text-align:center;">
                      <p style="margin:0 0 15px;color:#9ca3af;font-size:13px;">
                        Need help? Contact our support team
                      </p>
                      <p style="margin:0 0 20px;">
                        <a href="mailto:support@srportraits.com" style="color:#3b82f6;text-decoration:none;font-size:14px;font-weight:500;">
                          support@srportraits.com
                        </a>
                      </p>
                      <div style="border-top:1px solid #e5e7eb;padding-top:20px;margin-top:10px;">
                        <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">
                          © ${new Date().getFullYear()} SR Portraits & Events. All rights reserved.<br>
                          <span style="color:#d1d5db;">Professional Photography & Event Management Services</span>
                        </p>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}