import nodemailer from 'nodemailer';

interface SendEmailParams {
  to: string;
  subject: string;
  title: string;
  code: string;
  type: 'CONFIRMATION' | '2FA';
}

/**
 * Sends an automated luxury HTML security email with a 6-digit confirmation or 2FA OTP code.
 * Supports:
 * 1. Resend API (via RESEND_API_KEY) - Recommended for Vercel / serverless
 * 2. Standard SMTP (Gmail, Brevo, custom SMTP via SMTP_HOST, SMTP_USER, SMTP_PASS)
 * 3. Ethereal / Local preview fallback
 */
export async function sendSecurityEmail({ to, subject, title, code, type }: SendEmailParams) {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0A1120; color: #FAF8F5; margin: 0; padding: 40px 20px; }
        .container { max-width: 540px; margin: 0 auto; background-color: #121C30; border: 1px solid rgba(197, 160, 89, 0.4); border-radius: 16px; padding: 40px 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); text-align: center; }
        .logo { font-size: 22px; font-weight: 700; letter-spacing: 5px; color: #C5A059; text-transform: uppercase; margin-bottom: 20px; display: inline-block; }
        .badge { background-color: rgba(197, 160, 89, 0.15); color: #C5A059; border: 1px solid rgba(197, 160, 89, 0.3); font-size: 11px; letter-spacing: 2px; text-transform: uppercase; padding: 6px 16px; border-radius: 20px; font-weight: 600; display: inline-block; margin-bottom: 24px; }
        h1 { font-size: 24px; font-weight: 300; margin: 0 0 12px 0; color: #FAF8F5; }
        p { font-size: 13px; color: rgba(250, 248, 245, 0.75); line-height: 1.6; margin-bottom: 24px; }
        .code-box { background: #070D18; border: 1.5px solid #C5A059; border-radius: 12px; padding: 18px 24px; font-size: 38px; font-weight: 700; letter-spacing: 12px; color: #C5A059; font-family: 'Courier New', Courier, monospace; margin: 24px auto; text-align: center; display: inline-block; box-shadow: 0 8px 25px rgba(197, 160, 89, 0.15); }
        .notice { font-size: 12px; color: #C5A059; margin-top: 16px; font-weight: 500; }
        .footer { font-size: 10px; color: rgba(250, 248, 245, 0.4); margin-top: 36px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px; font-family: monospace; letter-spacing: 1px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">VILLA REGIA</div><br>
        <div class="badge">${type === 'CONFIRMATION' ? 'Validation de Compte' : 'Authentification Forte 2FA'}</div>
        <h1>${title}</h1>
        <p>Veuillez utiliser votre code de sécurité personnel à 6 chiffres pour valider votre opération sur le portail Villa Regia :</p>
        
        <div class="code-box">${code}</div>

        <p class="notice">🔒 Ce code est strictement confidentiel et reste valable 15 minutes.</p>

        <div class="footer">
          © 2026 VILLA REGIA • IMMOBILIER DE PRESTIGE & HOSPITALITÉ DE LUXE
        </div>
      </div>
    </body>
    </html>
  `;

  // ── METHOD 1: RESEND HTTP API (Fastest & most reliable on Vercel) ──
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const fromAddress = process.env.EMAIL_FROM || 'Villa Regia <onboarding@resend.dev>';
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [to],
          subject,
          html: htmlContent,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        console.log(`[REAL EMAIL DISPATCHED VIA RESEND TO ${to}] Email ID: ${data.id}`);
        return { success: true, provider: 'resend', id: data.id };
      } else {
        console.error('[RESEND API ERROR]:', data);
      }
    } catch (resendErr) {
      console.error('Failed to send via Resend API:', resendErr);
    }
  }

  // ── METHOD 2: STANDARD SMTP (Gmail, Brevo, OVH, custom mail server) ──
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || `Villa Regia <${user || 'security@villaregia.tn'}>`;

  if (host && user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      const info = await transporter.sendMail({
        from,
        to,
        subject,
        html: htmlContent,
        text: `${title}\n\nVotre code de vérification à 6 chiffres est : ${code}\n\nValable pendant 15 minutes.`,
      });

      console.log(`[REAL EMAIL DISPATCHED VIA SMTP TO ${to}] Message ID: ${info.messageId}`);
      return { success: true, provider: 'smtp', messageId: info.messageId };
    } catch (smtpErr) {
      console.error('[SMTP ERROR]:', smtpErr);
    }
  }

  // ── METHOD 3: ETHEREAL TEST ACCOUNT FALLBACK ──
  try {
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });

    const info = await transporter.sendMail({
      from: 'Villa Regia Sécurité <security@villaregia.tn>',
      to,
      subject,
      html: htmlContent,
      text: `${title}\n\nVotre code à 6 chiffres est : ${code}`,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`[TEST EMAIL SENT TO ${to}] Inbox URL: ${previewUrl}`);
    return { success: true, provider: 'ethereal', previewUrl };
  } catch (err) {
    console.warn('Fallback JSON transport used for code:', code);
    return { success: true, provider: 'fallback', code };
  }
}
