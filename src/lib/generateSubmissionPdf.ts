import { jsPDF } from 'jspdf';
import { OwnerSubmission } from '@/types';

export function generateSubmissionPdf(sub: OwnerSubmission) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 15;

  // Colors
  const navy = [11, 25, 44]; // #0B192C
  const gold = [197, 160, 89]; // #C5A059
  const darkTravertine = [40, 45, 55];
  const lightBg = [248, 246, 240];
  const amberAccent = [180, 115, 20];
  const skyAccent = [20, 100, 180];

  // ── HEADER BAND ──────────────────────────────────────────────────────────
  doc.setFillColor(navy[0], navy[1], navy[2]);
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Gold separator line
  doc.setDrawColor(gold[0], gold[1], gold[2]);
  doc.setLineWidth(1.2);
  doc.line(0, 38, pageWidth, 38);

  // Agency Branding
  doc.setTextColor(gold[0], gold[1], gold[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('VILLA REGIA', margin, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(220, 220, 225);
  doc.text("IMMOBILIER D'EXCEPTION & DEMEURES DE PRESTIGE • SFAX", margin, 21);

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text('FICHE TECHNIQUE & DOSSIER D’EXPERTISE IMMOBILIÈRE', margin, 31);

  // Right Header Info (Ref & Date)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(gold[0], gold[1], gold[2]);
  doc.text(`RÉF : ${sub.refCode || sub.id}`, pageWidth - margin, 16, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(200, 200, 210);
  const formattedDate = sub.createdAt ? new Date(sub.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('fr-FR');
  doc.text(`Dossier déposé le : ${formattedDate}`, pageWidth - margin, 22, { align: 'right' });
  doc.text('USAGE INTERNE & EXPERTISE MANDAT', pageWidth - margin, 27, { align: 'right' });
  
  // Status badge
  const statusLabel = sub.status === 'APPROVED' ? 'DOSSIER VALIDÉ' : sub.status === 'REJECTED' ? 'DOSSIER REFUSÉ' : 'EN ATTENTE D’ÉTUDE';
  doc.setFillColor(sub.status === 'APPROVED' ? 34 : sub.status === 'REJECTED' ? 180 : 200, sub.status === 'APPROVED' ? 139 : sub.status === 'REJECTED' ? 40 : 140, sub.status === 'APPROVED' ? 34 : sub.status === 'REJECTED' ? 40 : 20);
  doc.roundedRect(pageWidth - margin - 35, 30, 35, 5, 1, 1, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text(statusLabel, pageWidth - margin - 17.5, 33.5, { align: 'center' });

  y = 46;

  // Helper for Section Titles
  const renderSectionTitle = (title: string, iconNumber: string) => {
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.rect(margin, y - 4, contentWidth, 7, 'F');
    doc.setDrawColor(gold[0], gold[1], gold[2]);
    doc.setLineWidth(0.6);
    doc.line(margin, y - 4, margin, y + 3);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(navy[0], navy[1], navy[2]);
    doc.text(`${iconNumber}. ${title.toUpperCase()}`, margin + 3, y + 1);
    y += 8;
  };

  // ── SECTION 1: PROPRIÉTAIRE MANDANT ──────────────────────────────────────
  renderSectionTitle('Identité du Propriétaire Mandant', '1');

  doc.setFontSize(8.5);
  doc.setTextColor(darkTravertine[0], darkTravertine[1], darkTravertine[2]);

  // Two columns
  const col1 = margin + 3;
  const col2 = margin + contentWidth / 2;

  doc.setFont('helvetica', 'bold');
  doc.text('Nom Complet :', col1, y);
  doc.setFont('helvetica', 'normal');
  doc.text(sub.ownerName || 'Non renseigné', col1 + 30, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Téléphone Direct :', col2, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(gold[0], gold[1], gold[2]);
  doc.text(sub.ownerPhone || 'Non renseigné', col2 + 32, y);
  doc.setTextColor(darkTravertine[0], darkTravertine[1], darkTravertine[2]);

  y += 5.5;

  doc.setFont('helvetica', 'bold');
  doc.text('Adresse Email :', col1, y);
  doc.setFont('helvetica', 'normal');
  doc.text(sub.ownerEmail || 'Non renseignée', col1 + 30, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Gouvernorat / Ville :', col2, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${sub.gouvernorat || 'Sfax'} — ${sub.city || 'Sfax'}`, col2 + 32, y);

  y += 5.5;

  doc.setFont('helvetica', 'bold');
  doc.text('Quartier / Secteur :', col1, y);
  doc.setFont('helvetica', 'normal');
  doc.text(sub.district || 'Sfax', col1 + 30, y);

  if (sub.address) {
    doc.setFont('helvetica', 'bold');
    doc.text('Adresse physique :', col2, y);
    doc.setFont('helvetica', 'normal');
    doc.text(sub.address, col2 + 32, y);
  }

  y += 9;

  // ── SECTION 2: CARACTÉRISTIQUES DU BIEN ──────────────────────────────────
  renderSectionTitle('Spécifications Techniques & Typologie', '2');

  doc.setFont('helvetica', 'bold');
  doc.text('Catégorie du Bien :', col1, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(sub.propertyType, col1 + 35, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkTravertine[0], darkTravertine[1], darkTravertine[2]);

  doc.setFont('helvetica', 'bold');
  doc.text('Objectif Souhaité :', col2, y);
  doc.setFont('helvetica', 'normal');
  doc.text(sub.objective, col2 + 32, y);

  y += 5.5;

  doc.setFont('helvetica', 'bold');
  doc.text('Surface Déclarée :', col1, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${sub.surfaceM2 || 0} m²`, col1 + 35, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Nombre de Pièces :', col2, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${sub.bedrooms || 0} chambres`, col2 + 32, y);

  y += 5.5;

  const sp = sub.specificDetails || {};
  if (sp.landSurfaceM2 || sp.builtSurfaceM2) {
    doc.setFont('helvetica', 'bold');
    doc.text('Terrain / Bâti :', col1, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`Terrain : ${sp.landSurfaceM2 || sub.surfaceM2 || '-'} m² | Bâti : ${sp.builtSurfaceM2 || '-'} m²`, col1 + 35, y);
    y += 5.5;
  }

  y += 4;

  // ── SECTION 3: ÉVALUATION FINANCIÈRE & SPÉCIFICITÉS PARTICULIÈRES ────────
  renderSectionTitle('Évaluation Financière & Paramètres Avancés', '3');

  // Highlighted Financial Box
  const boxHeight = (sub.propertyType === 'Villa Semi-Construite' || sub.completionEstimate || sp.completionEstimate) ? 22 : 14;
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(margin, y - 3, contentWidth, boxHeight, 1.5, 1.5, 'F');
  doc.setDrawColor(gold[0], gold[1], gold[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y - 3, contentWidth, boxHeight, 1.5, 1.5, 'D');

  const estPrice = sub.estimatedPrice || sub.estimatedValue || 0;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text('Prix Demandé / Estimation Propriétaire :', margin + 4, y + 2);
  doc.setFontSize(11);
  doc.setTextColor(gold[0], gold[1], gold[2]);
  doc.text(`${estPrice.toLocaleString('fr-FR')} TND`, margin + 70, y + 2.5);

  // If Villa Semi-Construite
  const compEst = sub.completionEstimate || sp.completionEstimate;
  const stage = sub.constructionStage || sp.constructionStage;

  if (compEst || sub.propertyType === 'Villa Semi-Construite') {
    y += 7;
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(amberAccent[0], amberAccent[1], amberAccent[2]);
    doc.text('Travaux d’Achèvement Estimés :', margin + 4, y + 2);
    doc.setFontSize(10);
    doc.text(`+ ${(compEst || 0).toLocaleString('fr-FR')} TND`, margin + 70, y + 2);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 139, 34);
    doc.text('Coût Prévisionnel Clé en Main :', margin + 115, y + 2);
    doc.setFontSize(10);
    doc.text(`≈ ${(estPrice + (compEst || 0)).toLocaleString('fr-FR')} TND`, margin + 160, y + 2);

    if (stage) {
      y += 6;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(darkTravertine[0], darkTravertine[1], darkTravertine[2]);
      doc.text(`Stade des travaux : ${stage}`, margin + 4, y + 1.5);
    }
  } else if (sub.propertyType === 'Espace Commercial' || sub.propertyType === 'Fonds de Commerce' || sub.businessActivity || sp.businessActivity) {
    const act = sub.businessActivity || sp.businessActivity;
    const rent = sub.monthlyRentTND || sp.monthlyRentTND;
    const facade = sub.specificDetails?.linearFacadeMeters;

    y += 6;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(skyAccent[0], skyAccent[1], skyAccent[2]);
    doc.text(`Activité : ${act || 'Tous commerces'}`, margin + 4, y + 1.5);

    if (rent) {
      doc.text(`Loyer des murs : ${rent.toLocaleString('fr-FR')} TND / mois`, margin + 90, y + 1.5);
    }
    if (facade) {
      doc.text(`Vitrine : ${facade} mètres linéaires`, margin + 145, y + 1.5);
    }
  }

  y += boxHeight + 2;

  // ── SECTION 4: CONFORMITÉ JURIDIQUE & FONCIÈRE (LOI TUNISIENNE) ──────────
  renderSectionTitle('Cadre Juridique & Statut Foncier (Loi Tunisienne)', '4');

  doc.setFontSize(8.5);
  doc.setTextColor(darkTravertine[0], darkTravertine[1], darkTravertine[2]);

  doc.setFont('helvetica', 'bold');
  doc.text('Nature du Titre Déclaré :', col1, y);
  doc.setFont('helvetica', 'normal');
  doc.text(sub.titleType || 'Titre Bleu Individuel (رسم عقاري فردي)', col1 + 45, y);

  if (sub.titleNumber) {
    doc.setFont('helvetica', 'bold');
    doc.text('N° Titre CPF (دفتر خانة) :', col2, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(gold[0], gold[1], gold[2]);
    doc.text(sub.titleNumber, col2 + 40, y);
    doc.setTextColor(darkTravertine[0], darkTravertine[1], darkTravertine[2]);
  }

  y += 5.5;

  doc.setFont('helvetica', 'bold');
  doc.text('Certificat Propriété < 3 mois :', col1, y);
  doc.setFont('helvetica', 'normal');
  doc.text(sub.hasCertificate === 'Oui' || sub.hasCertificate === 'OUI' ? 'OUI (Certifié conforme)' : sub.hasCertificate || 'En cours d’obtention', col1 + 45, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Permis de Bâtir Municipal :', col2, y);
  doc.setFont('helvetica', 'normal');
  doc.text(sub.hasBuildingPermit === 'Oui' || sub.hasBuildingPermit === 'OUI' ? 'OUI (Régulier & approuvé)' : sub.hasBuildingPermit || 'Non / Non applicable', col2 + 40, y);

  y += 5.5;

  doc.setFont('helvetica', 'bold');
  doc.text('Déclaration sur l’honneur :', col1, y);
  doc.setFont('helvetica', 'normal');
  doc.text(sub.tunisianLawCertified ? 'Certifié exact conformément aux lois de la République Tunisienne' : 'En attente d’attestation formelle', col1 + 45, y);

  y += 9;

  // ── SECTION 5: DESCRIPTION ÉDITORIALE & NOTES ────────────────────────────
  if (sub.details) {
    renderSectionTitle('Description & Notes Fournies par le Propriétaire', '5');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkTravertine[0], darkTravertine[1], darkTravertine[2]);

    const splitDesc = doc.splitTextToSize(sub.details, contentWidth - 4);
    doc.text(splitDesc, margin + 2, y);
    y += splitDesc.length * 4.2 + 6;
  }

  // ── SECTION 6: VISA & SIGNATURES ─────────────────────────────────────────
  if (y > pageHeight - 45) {
    doc.addPage();
    y = 20;
  }

  renderSectionTitle('Visa d’Étude & Mandat d’Intermédiation Villa Regia', '6');

  const visaBoxWidth = (contentWidth - 6) / 2;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);

  // Box 1: Owner Signature
  doc.rect(margin, y, visaBoxWidth, 24);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text('POUR LE PROPRIÉTAIRE MANDANT', margin + 3, y + 4.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(120, 120, 120);
  doc.text('Mention manuscrite "Bon pour soumission et vérification" :', margin + 3, y + 8);
  doc.text(`Nom : ${sub.ownerName}`, margin + 3, y + 20);

  // Box 2: Agency Seal
  const box2X = margin + visaBoxWidth + 6;
  doc.rect(box2X, y, visaBoxWidth, 24);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(gold[0], gold[1], gold[2]);
  doc.text('POUR LA DIRECTION VILLA REGIA REAL ESTATES', box2X + 3, y + 4.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(120, 120, 120);
  doc.text('Cachet de l’agence & Avis du comité d’évaluation :', box2X + 3, y + 8);
  doc.text(`Expert Référent : Direction des Transactions Sfax`, box2X + 3, y + 20);

  // ── FOOTER ───────────────────────────────────────────────────────────────
  doc.setFillColor(navy[0], navy[1], navy[2]);
  doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');
  doc.setDrawColor(gold[0], gold[1], gold[2]);
  doc.setLineWidth(0.6);
  doc.line(0, pageHeight - 12, pageWidth, pageHeight - 12);

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(220, 220, 220);
  doc.text('Villa Regia Real Estates • Route de la Soukra Km 3.5, Sfax • Téléphone / WhatsApp : +216 27 745 403 • contact@villaregiarealestates.com', pageWidth / 2, pageHeight - 6.5, { align: 'center' });
  doc.setTextColor(gold[0], gold[1], gold[2]);
  doc.text('Document confidentiel protégé par le secret professionnel et le droit immobilier tunisien.', pageWidth / 2, pageHeight - 3, { align: 'center' });

  // Save the PDF
  const filename = `Dossier_VillaRegia_${sub.refCode || sub.id}.pdf`;
  doc.save(filename);
}
