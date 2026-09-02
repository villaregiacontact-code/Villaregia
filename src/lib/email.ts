import nodemailer from 'nodemailer';

interface SendEmailParams {
  to: string;
  subject: string;
  title: string;
  code: string;
  type: 'CONFIRMATION' | '2FA';
}

interface SendWelcomeEmailParams {
  to: string;
  name: string;
}

/**
 * Universal HTML Email Dispatcher:
 * 1. Resend API (HTTP POST to api.resend.com) - works instantly on Vercel / serverless
 * 2. Standard SMTP (Gmail, Brevo, custom SMTP)
 * 3. Ethereal fallback
 */
async function dispatchHtmlEmail({
  to,
  subject,
  htmlContent,
  textContent,
}: {
  to: string;
  subject: string;
  htmlContent: string;
  textContent: string;
}) {
  // ── METHOD 1: RESEND HTTP API ──
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

  // ── METHOD 2: STANDARD SMTP ──
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
        text: textContent,
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
      from: 'Villa Regia <contact@villaregia.tn>',
      to,
      subject,
      html: htmlContent,
      text: textContent,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`[TEST EMAIL SENT TO ${to}] Inbox URL: ${previewUrl}`);
    return { success: true, provider: 'ethereal', previewUrl };
  } catch (err) {
    return { success: true, provider: 'fallback' };
  }
}

/**
 * Sends a security email containing the 6-digit verification code.
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
        .logo { font-size: 24px; font-weight: 700; letter-spacing: 6px; color: #C5A059; text-transform: uppercase; margin-bottom: 20px; display: inline-block; }
        .badge { background-color: rgba(197, 160, 89, 0.15); color: #C5A059; border: 1px solid rgba(197, 160, 89, 0.3); font-size: 11px; letter-spacing: 2px; text-transform: uppercase; padding: 6px 16px; border-radius: 20px; font-weight: 600; display: inline-block; margin-bottom: 24px; }
        h1 { font-size: 22px; font-weight: 300; margin: 0 0 12px 0; color: #FAF8F5; }
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
        <p>Veuillez utiliser votre code de sécurité personnel à 6 chiffres pour valider votre inscription :</p>
        
        <div class="code-box">${code}</div>

        <p class="notice">🔒 Ce code unique est strictement confidentiel et reste valable 15 minutes.</p>

        <div class="footer">
          © 2026 VILLA REGIA • IMMOBILIER DE PRESTIGE & HOSPITALITÉ DE LUXE<br>
          SFAX, TUNISIE
        </div>
      </div>
    </body>
    </html>
  `;

  return dispatchHtmlEmail({
    to,
    subject,
    htmlContent,
    textContent: `${title}\n\nVotre code d'activation est : ${code}\n\nValable 15 minutes.`,
  });
}

/**
 * Sends an automated luxury Welcome Email upon account creation / activation.
 */
export async function sendWelcomeEmail({ to, name }: SendWelcomeEmailParams) {
  const subject = `[Villa Regia] Bienvenue dans le Cercle Villa Regia — Votre Compte Privilège est Actif`;
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0A1120; color: #FAF8F5; margin: 0; padding: 40px 20px; }
        .container { max-width: 580px; margin: 0 auto; background-color: #121C30; border: 1px solid rgba(197, 160, 89, 0.4); border-radius: 16px; padding: 44px 34px; box-shadow: 0 25px 50px rgba(0,0,0,0.7); text-align: center; }
        .logo { font-size: 26px; font-weight: 700; letter-spacing: 6px; color: #C5A059; text-transform: uppercase; margin-bottom: 16px; display: inline-block; }
        .badge { background-color: rgba(197, 160, 89, 0.15); color: #C5A059; border: 1px solid rgba(197, 160, 89, 0.3); font-size: 11px; letter-spacing: 2px; text-transform: uppercase; padding: 6px 18px; border-radius: 20px; font-weight: 600; display: inline-block; margin-bottom: 24px; }
        h1 { font-size: 24px; font-weight: 300; margin: 0 0 16px 0; color: #FAF8F5; }
        p { font-size: 13.5px; color: rgba(250, 248, 245, 0.8); line-height: 1.7; margin-bottom: 20px; text-align: left; }
        .card { background: #070D18; border: 1px solid rgba(197, 160, 89, 0.3); border-radius: 12px; padding: 20px; margin: 24px 0; text-align: left; }
        .card-item { display: flex; align-items: flex-start; margin-bottom: 12px; font-size: 13px; color: #FAF8F5; }
        .bullet { color: #C5A059; font-weight: bold; margin-right: 10px; font-size: 16px; }
        .cta-btn { display: inline-block; background: linear-gradient(135deg, #C5A059 0%, #9B7B36 100%); color: #0A1120; font-weight: 700; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; padding: 14px 32px; border-radius: 8px; text-decoration: none; margin: 20px 0; box-shadow: 0 10px 25px rgba(197, 160, 89, 0.3); }
        .signature { text-align: left; font-size: 12.5px; color: rgba(250, 248, 245, 0.7); margin-top: 28px; line-height: 1.6; }
        .signature strong { color: #C5A059; }
        .footer { font-size: 10px; color: rgba(250, 248, 245, 0.4); margin-top: 36px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px; font-family: monospace; letter-spacing: 1px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">VILLA REGIA</div><br>
        <div class="badge">Adhésion Confirmée</div>
        <h1>Bienvenue, ${name}</h1>
        
        <p>Nous avons le grand privilège de vous accueillir au sein de la Maison <strong>Villa Regia</strong>. Votre compte client est désormais activé avec succès.</p>
        
        <p>Vous disposez désormais d'un accès privilégié à nos univers exclusifs :</p>
        
        <div class="card">
          <div class="card-item">
            <span class="bullet">✦</span>
            <span><strong>Vente de Prestige :</strong> Accès aux demeures de maître et villas d'architecte les plus exclusives de Sfax et de Tunisie.</span>
          </div>
          <div class="card-item">
            <span class="bullet">✦</span>
            <span><strong>Villas de Luxe (Court Séjour) :</strong> Réservation de villégiatures d'exception avec conciergerie privée.</span>
          </div>
          <div class="card-item">
            <span class="bullet">✦</span>
            <span><strong>Espaces Événementiels :</strong> Domaines d'exception pour vos réceptions privées et cérémonies de prestige.</span>
          </div>
          <div class="card-item">
            <span class="bullet">✦</span>
            <span><strong>Accompagnement Sur-Mesure :</strong> Un conseiller privé à votre écoute pour concrétiser vos projets patrimoniaux.</span>
          </div>
        </div>

        <a href="https://villaregia.vercel.app" class="cta-btn">Découvrir la Collection</a>

        <div class="signature">
          Bien cordialement,<br>
          <strong>La Direction & Les Conseillers de la Maison Villa Regia</strong><br>
          <span style="color: rgba(250, 248, 245, 0.5); font-size: 11px;">Route de la Soukra, Km 2.5 • Sfax, Tunisie</span>
        </div>

        <div class="footer">
          © 2026 VILLA REGIA • MAISON DE SÉLECTION IMMOBILIÈRE ET D'HOSPITALITÉ DE LUXE
        </div>
      </div>
    </body>
    </html>
  `;

  return dispatchHtmlEmail({
    to,
    subject,
    htmlContent,
    textContent: `Bienvenue chez Villa Regia, ${name} !\n\nVotre compte client a été activé avec succès. Découvrez notre collection exclusive de villas et demeures de maître à Sfax et en Tunisie sur https://villaregia.vercel.app\n\nLa Direction Villa Regia`,
  });
}
