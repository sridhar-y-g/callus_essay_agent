OTP_EMAIL_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Verify Your Email – Callus</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f7fb;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding:60px 20px;">
        <table role="presentation" width="100%" style="max-width:600px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.08);" cellspacing="0" cellpadding="0" border="0">

          <!-- HEADER GRADIENT -->
          <tr>
            <td style="background:linear-gradient(135deg, #FF6B6B 0%, #a06ee1 50%, #4facfe 100%);padding:40px 20px;text-align:center;">
              <span style="font-family:Georgia,'Times New Roman',serif;font-size:36px;font-weight:bold;color:#ffffff;letter-spacing:1px;text-shadow:0 2px 10px rgba(0,0,0,0.2);">
                Callus<sup style="font-size:16px;vertical-align:super;">®</sup>
              </span>
              <h1 style="margin:20px 0 0 0;font-size:28px;font-weight:700;color:#ffffff;text-shadow:0 2px 4px rgba(0,0,0,0.1);">Welcome to the Studio!</h1>
            </td>
          </tr>

          <!-- BODY CONTENT -->
          <tr>
            <td style="padding:48px 40px;text-align:center;">
              
              <div style="width:80px;height:80px;background:#f0f4ff;border-radius:50%;display:inline-block;line-height:80px;text-align:center;font-size:36px;margin-bottom:24px;box-shadow:0 10px 20px rgba(79,172,254,0.15);">
                ✨
              </div>

              <p style="margin:0 0 32px 0;font-size:18px;color:#334155;line-height:1.6;">
                You're just one step away from building your unique college narrative. Use the colorful code below to verify your email.
              </p>

              <!-- OTP BLOCK -->
              <div style="display:inline-block;background:linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);border:2px dashed #a06ee1;border-radius:20px;padding:24px 48px;box-shadow:0 10px 25px rgba(160,110,225,0.15);">
                <span style="font-family:'Courier New',Courier,monospace;font-size:48px;font-weight:800;background:linear-gradient(135deg, #FF6B6B, #4facfe);-webkit-background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:16px;word-spacing:-8px;">
                  {otp}
                </span>
              </div>
              
              <p style="margin:32px 0 0 0;font-size:14px;color:#94a3b8;line-height:1.6;">
                Valid for <strong style="color:#64748b;">10 minutes</strong>. Do not share this code.
              </p>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#f8fafc;padding:30px 40px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:13px;color:#64748b;line-height:1.7;">
                If you didn't request this, please ignore this email.<br/>
                Made with ❤️ by Callus Inc.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""
