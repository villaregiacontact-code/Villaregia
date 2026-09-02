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

export interface OwnerSubmissionEmailData {
  refCode: string;
  propertyType: string;
  objective: string;
  surfaceM2: number;
  bedrooms?: number;
  estimatedValue?: number;
  gouvernorat: string;
  city: string;
  district: string;
  address?: string;
  googleMapsLink?: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  titleType?: string; // Titre de bien selon la loi tunisienne
  titleNumber?: string; // Numéro du Titre Foncier CPF
  hasCertificate?: boolean; // Certificat de propriété récent
  hasBuildingPermit?: string; // Permis de bâtir
  details?: string;
  photos?: string[];
}

/**
 * Sends automated notification emails when an owner proposes a property:
 * 1. Complete dossier email sent to the agency: villaregia.contact@gmail.com
 * 2. Elegant confirmation email sent to the owner (if ownerEmail provided)
 */
export async function sendOwnerSubmissionEmails(data: OwnerSubmissionEmailData) {
  const agencyEmail = 'villaregia.contact@gmail.com';
  const ref = data.refCode || `DOS-${Date.now()}`;

  // ── 1. AGENCY DOSSIER EMAIL ──
  const agencySubject = `[NOUVEAU BIEN PROPOSÉ] Dossier ${ref} — ${data.propertyType} (${data.city}, ${data.gouvernorat})`;
  const agencyHtml = `
    <!DOCTYPE html>
    <html lang="fr">
    <head><meta charset="UTF-8"></head>
    <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0A1120; color: #FAF8F5; padding: 40px 20px; margin: 0;">
      <div style="max-width: 640px; margin: 0 auto; background-color: #121C30; border: 1.5px solid #C5A059; border-radius: 16px; padding: 36px 30px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 22px; font-weight: 700; letter-spacing: 5px; color: #C5A059;">VILLA REGIA</span><br>
          <span style="display: inline-block; background: rgba(197,160,89,0.15); color: #C5A059; border: 1px solid rgba(197,160,89,0.3); font-size: 11px; letter-spacing: 2px; text-transform: uppercase; padding: 5px 14px; border-radius: 20px; margin-top: 10px;">
            Nouveau Dossier Propriétaire • ${ref}
          </span>
        </div>

        <h2 style="font-size: 20px; color: #FAF8F5; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px; margin-bottom: 20px;">
          Détails du Bien Proposé
        </h2>

        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #FAF8F5; margin-bottom: 24px;">
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
            <td style="padding: 10px 0; color: #C5A059; font-weight: bold; width: 40%;">Type de Bien :</td>
            <td style="padding: 10px 0;">${data.propertyType} (${data.objective})</td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
            <td style="padding: 10px 0; color: #C5A059; font-weight: bold;">Localisation :</td>
            <td style="padding: 10px 0;">${data.district}, ${data.city} (${data.gouvernorat}, Tunisie)</td>
          </tr>
          ${data.address ? `
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
            <td style="padding: 10px 0; color: #C5A059; font-weight: bold;">Adresse Précise :</td>
            <td style="padding: 10px 0;">${data.address}</td>
          </tr>` : ''}
          ${data.googleMapsLink ? `
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
            <td style="padding: 10px 0; color: #C5A059; font-weight: bold;">Emplacement Google Maps :</td>
            <td style="padding: 10px 0;"><a href="${data.googleMapsLink}" target="_blank" style="color: #4ade80; text-decoration: underline;">Voir sur Google Maps</a></td>
          </tr>` : ''}
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
            <td style="padding: 10px 0; color: #C5A059; font-weight: bold;">Superficie :</td>
            <td style="padding: 10px 0;">${data.surfaceM2} m²</td>
          </tr>
          ${data.bedrooms ? `
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
            <td style="padding: 10px 0; color: #C5A059; font-weight: bold;">Chambres / Suites :</td>
            <td style="padding: 10px 0;">${data.bedrooms}</td>
          </tr>` : ''}
          ${data.estimatedValue ? `
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
            <td style="padding: 10px 0; color: #C5A059; font-weight: bold;">Valeur Estimée :</td>
            <td style="padding: 10px 0; font-weight: bold; color: #C5A059;">${Number(data.estimatedValue).toLocaleString('fr-FR')} TND</td>
          </tr>` : ''}
        </table>

        <h3 style="font-size: 16px; color: #C5A059; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; margin-bottom: 16px;">
          ⚖️ Statut Juridique & Titre Foncier (Loi Tunisienne)
        </h3>
        <div style="background: #070D18; border: 1px solid rgba(197,160,89,0.3); border-radius: 10px; padding: 16px; margin-bottom: 24px; font-size: 13px; line-height: 1.6;">
          <p style="margin: 0 0 8px 0;"><strong>Titre Foncier :</strong> ${data.titleType || 'Titre Foncier Individuel (Titre Bleu CPF)'}</p>
          ${data.titleNumber ? `<p style="margin: 0 0 8px 0;"><strong>N° Titre CPF (دفتر خانة) :</strong> <span style="color: #C5A059; font-family: monospace;">${data.titleNumber}</span></p>` : ''}
          <p style="margin: 0 0 8px 0;"><strong>Certificat de Propriété Récent (&lt; 3 mois) :</strong> ${data.hasCertificate ? '✅ Oui (Disponible)' : 'ℹ️ À actualiser / En cours'}</p>
          <p style="margin: 0;"><strong>Permis de Bâtir & Récolement Municipal :</strong> ${data.hasBuildingPermit || 'En règle avec le PAU'}</p>
        </div>

        <h3 style="font-size: 16px; color: #FAF8F5; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; margin-bottom: 16px;">
          Coordonnées du Propriétaire
        </h3>
        <div style="background: rgba(255,255,255,0.04); border-radius: 10px; padding: 16px; margin-bottom: 24px; font-size: 13px;">
          <p style="margin: 0 0 8px 0;"><strong>Nom :</strong> ${data.ownerName}</p>
          <p style="margin: 0 0 8px 0;"><strong>Téléphone Direct :</strong> <a href="tel:${data.ownerPhone}" style="color: #C5A059; font-weight: bold;">${data.ownerPhone}</a></p>
          ${data.ownerEmail ? `<p style="margin: 0 0 8px 0;"><strong>Email :</strong> <a href="mailto:${data.ownerEmail}" style="color: #FAF8F5;">${data.ownerEmail}</a></p>` : ''}
          <a href="https://wa.me/${data.ownerPhone.replace(/\D/g, '')}" target="_blank" style="display: inline-block; background: #25D366; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: bold; margin-top: 6px;">Contacter sur WhatsApp</a>
        </div>

        ${data.details ? `
        <h3 style="font-size: 15px; color: #FAF8F5; margin-bottom: 8px;">Description & Caractéristiques :</h3>
        <p style="font-size: 13px; line-height: 1.6; color: rgba(250,248,245,0.8); background: #070D18; padding: 14px; border-radius: 8px; margin-bottom: 24px;">
          ${data.details}
        </p>` : ''}

        ${data.photos && data.photos.length > 0 ? `
        <h3 style="font-size: 15px; color: #FAF8F5; margin-bottom: 8px;">Photos du Bien (${data.photos.length}) :</h3>
        <div style="margin-bottom: 24px;">
          ${data.photos.slice(0, 4).map((url, i) => `<a href="${url}" target="_blank" style="color: #C5A059; font-size: 12px; display: block; margin-bottom: 4px;">Photo ${i + 1} : ${url}</a>`).join('')}
        </div>` : ''}

        <div style="text-align: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px; font-size: 11px; color: rgba(250,248,245,0.4);">
          Plateforme Villa Regia • Système Central d'Acquisition Immobilière Sfax
        </div>
      </div>
    </body>
    </html>
  `;

  // Dispatch email to agency
  await dispatchHtmlEmail({
    to: agencyEmail,
    subject: agencySubject,
    htmlContent: agencyHtml,
    textContent: `Nouveau bien proposé ref ${ref}: ${data.propertyType} à ${data.district}, ${data.city} par ${data.ownerName} (${data.ownerPhone}). Titre: ${data.titleType || 'Titre Bleu'}`,
  });

  // ── 2. OWNER CONFIRMATION RECEIPT (IF EMAIL PROVIDED) ──
  if (data.ownerEmail && data.ownerEmail.includes('@')) {
    const ownerSubject = `[Villa Regia] Accusé de Réception — Votre Dossier ${ref}`;
    const ownerHtml = `
      <!DOCTYPE html>
      <html lang="fr">
      <head><meta charset="UTF-8"></head>
      <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0A1120; color: #FAF8F5; padding: 40px 20px; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #121C30; border: 1px solid rgba(197, 160, 89, 0.4); border-radius: 16px; padding: 40px 30px; text-align: center;">
          <div style="font-size: 24px; font-weight: 700; letter-spacing: 6px; color: #C5A059;">VILLA REGIA</div><br>
          <span style="display: inline-block; background: rgba(197,160,89,0.15); color: #C5A059; border: 1px solid rgba(197,160,89,0.3); font-size: 11px; letter-spacing: 2px; text-transform: uppercase; padding: 6px 16px; border-radius: 20px; margin-bottom: 20px;">
            Dossier d'Évaluation Enregistré
          </span>
          <h1 style="font-size: 22px; font-weight: 300; margin: 0 0 16px 0; color: #FAF8F5;">
            Merci, ${data.ownerName}
          </h1>
          <p style="font-size: 13.5px; color: rgba(250,248,245,0.8); line-height: 1.7; text-align: left; margin-bottom: 20px;">
            Nous avons le plaisir de vous confirmer la bonne réception du dossier concernant votre <strong>${data.propertyType}</strong> situé à <strong>${data.district}, ${data.city}</strong>.
          </p>
          <div style="background: #070D18; border: 1px solid rgba(197,160,89,0.3); border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: left; font-size: 13px; line-height: 1.6;">
            <p style="margin: 0 0 8px 0;"><strong>Référence de Dossier :</strong> <span style="color: #C5A059; font-family: monospace; font-weight: bold;">${ref}</span></p>
            <p style="margin: 0 0 8px 0;"><strong>Superficie :</strong> ${data.surfaceM2} m²</p>
            <p style="margin: 0 0 8px 0;"><strong>Statut Juridique :</strong> ${data.titleType || 'Titre Foncier Individuel (Titre Bleu)'}</p>
            <p style="margin: 0;"><strong>Prise en Charge :</strong> En cours d'analyse confidentielle par notre équipe d'experts.</p>
          </div>
          <p style="font-size: 13px; color: rgba(250,248,245,0.75); line-height: 1.6; text-align: left;">
            Un conseiller privé de la Maison Villa Regia prendra contact avec vous sous <strong>24 heures ouvrées</strong> au <strong>${data.ownerPhone}</strong> afin de convenir d'un rendez-vous sur place ou d'un échange d'évaluation.
          </p>
          <div style="margin-top: 32px; text-align: left; font-size: 12px; color: rgba(250,248,245,0.6); border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px;">
            Bien cordialement,<br>
            <strong style="color: #C5A059;">La Direction de la Maison Villa Regia</strong><br>
            <span>Route de la Soukra, Km 2.5 • 3000 Sfax, Tunisie</span><br>
            <span>Tél / WhatsApp : +216 27 745 405 • Email : villaregia.contact@gmail.com</span>
          </div>
        </div>
      </body>
      </html>
    `;

    await dispatchHtmlEmail({
      to: data.ownerEmail,
      subject: ownerSubject,
      htmlContent: ownerHtml,
      textContent: `Bonjour ${data.ownerName},\n\nVotre dossier ${ref} pour la proposition de votre bien (${data.propertyType} à ${data.city}) a été bien reçu. Un conseiller Villa Regia vous contactera au ${data.ownerPhone} sous 24h.\n\nVilla Regia Sfax - +216 27 745 405`,
    });
  }

  return { success: true, ref };
}

