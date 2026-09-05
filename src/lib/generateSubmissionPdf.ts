import { jsPDF } from 'jspdf';
import { OwnerSubmission } from '@/types';

export function generateSubmissionPdf(sub: OwnerSubmission) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  // ── PALETTE HAUTE JOAILLERIE & ARCHITECTURE ─────────────────────────────────
  const navyDark = [8, 18, 33];       // #081221 (Bleu Nuit Profond)
  const navyCard = [15, 27, 46];      // #0F1B2E
  const goldPrimary = [197, 160, 89]; // #C5A059 (Or Chaud Villa Regia)
  const goldLight = [224, 196, 137];  // #E0C489
  const textDark = [35, 42, 54];      // Gris anthracite chic
  const textMuted = [100, 110, 125];  // Gris sobre
  const bgCardLight = [250, 249, 245];// Ivoire travertin doux
  const borderLight = [228, 222, 210];// Bordure dorée pâle
  const greenAccent = [22, 120, 75];  // Vert validation
  const amberAccent = [185, 110, 15]; // Ambre semi-construit
  const skyAccent = [18, 95, 175];    // Bleu commercial

  let y = 0;

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. EN-TÊTE DE PRESTIGE & ARMOIRIES VILLA REGIA
  // ═══════════════════════════════════════════════════════════════════════════
  doc.setFillColor(navyDark[0], navyDark[1], navyDark[2]);
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Double filet d'or fin en bordure inférieure
  doc.setDrawColor(goldPrimary[0], goldPrimary[1], goldPrimary[2]);
  doc.setLineWidth(1.0);
  doc.line(0, 41, pageWidth, 41);
  doc.setDrawColor(goldLight[0], goldLight[1], goldLight[2]);
  doc.setLineWidth(0.3);
  doc.line(0, 42.2, pageWidth, 42.2);

  // Monogramme "VR" gravé dans un cartouche or
  doc.setDrawColor(goldPrimary[0], goldPrimary[1], goldPrimary[2]);
  doc.setLineWidth(0.6);
  doc.roundedRect(margin, 9, 13, 13, 1.5, 1.5, 'D');
  doc.setTextColor(goldPrimary[0], goldPrimary[1], goldPrimary[2]);
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.text('VR', margin + 6.5, 17.5, { align: 'center' });

  // Typographie Titre de la Maison
  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(goldPrimary[0], goldPrimary[1], goldPrimary[2]);
  doc.text('VILLA REGIA', margin + 17, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(215, 218, 225);
  doc.text("MAISON D'IMMOBILIER D'EXCEPTION & DEMEURES DE PRESTIGE • SFAX", margin + 17, 21);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(255, 255, 255);
  doc.text('MÉMORANDUM D’EXPERTISE & FICHE TECHNIQUE CONFIDENTIELLE', margin, 34);

  // Bloc Référence & Date (Aligné à droite avec badge de statut)
  const refCode = sub.refCode || `VR-${sub.id.slice(-6).toUpperCase()}`;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(goldLight[0], goldLight[1], goldLight[2]);
  doc.text(`DOSSIER N° : ${refCode}`, pageWidth - margin, 14, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(190, 195, 205);
  const formattedDate = sub.createdAt
    ? new Date(sub.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('fr-FR');
  doc.text(`Dépôt certifié le : ${formattedDate}`, pageWidth - margin, 19, { align: 'right' });

  // Badge Statut Juridique / Commercial
  const isApproved = sub.status === 'APPROVED';
  const isRejected = sub.status === 'REJECTED';
  const statusLabel = isApproved ? 'MANDAT VALIDÉ' : isRejected ? 'DOSSIER REFUSÉ' : 'EN COURS D’INSTRUCTION';
  const statusBg = isApproved ? [20, 110, 60] : isRejected ? [150, 30, 30] : [175, 120, 20];

  doc.setFillColor(statusBg[0], statusBg[1], statusBg[2]);
  doc.roundedRect(pageWidth - margin - 44, 24, 44, 6, 1.2, 1.2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text(statusLabel, pageWidth - margin - 22, 28.2, { align: 'center' });

  y = 49;

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER: CARTES ÉDITORIALES CLAIRES & STRUCTURÉES
  // ═══════════════════════════════════════════════════════════════════════════
  const renderCardHeader = (title: string, subtitle?: string) => {
    // Fond bandeau de titre
    doc.setFillColor(bgCardLight[0], bgCardLight[1], bgCardLight[2]);
    doc.rect(margin, y, contentWidth, 7, 'F');

    // Liseré or à gauche
    doc.setFillColor(goldPrimary[0], goldPrimary[1], goldPrimary[2]);
    doc.rect(margin, y, 2.5, 7, 'F');

    // Titre
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
    doc.text(title.toUpperCase(), margin + 5.5, y + 4.8);

    if (subtitle) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text(subtitle, pageWidth - margin - 3, y + 4.8, { align: 'right' });
    }

    y += 9.5;
  };

  const renderField = (label: string, value: string, x: number, currentY: number, maxWidth: number = 80, isHighlighted: boolean = false) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(label, x, currentY);

    doc.setFont('helvetica', isHighlighted ? 'bold' : 'normal');
    doc.setFontSize(8.5);
    if (isHighlighted) {
      doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
    } else {
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    }

    const cleanVal = value || '—';
    const splitVal = doc.splitTextToSize(cleanVal, maxWidth);
    doc.text(splitVal, x, currentY + 4);
    return splitVal.length * 4;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. BANDEAU HAUT IMPACT: VALORISATION & OBJECTIF PATRIMONIAL
  // ═══════════════════════════════════════════════════════════════════════════
  const estPrice = sub.estimatedPrice || sub.estimatedValue || 0;
  const sp = sub.specificDetails || {};
  const isSemi = sub.propertyType === 'Villa Semi-Construite' || !!sub.completionEstimate;
  const isComm = sub.propertyType === 'Espace Commercial' || sub.propertyType === 'Fonds de Commerce' || !!sub.businessActivity;

  const valuationCardHeight = isSemi || isComm ? 24 : 17;

  // Cadre de valorisation or & ivoire
  doc.setFillColor(bgCardLight[0], bgCardLight[1], bgCardLight[2]);
  doc.roundedRect(margin, y, contentWidth, valuationCardHeight, 2, 2, 'F');
  doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, valuationCardHeight, 2, 2, 'D');

  // Liseré or supérieur
  doc.setFillColor(goldPrimary[0], goldPrimary[1], goldPrimary[2]);
  doc.rect(margin + 2, y, contentWidth - 4, 1.2, 'F');

  // Label & Prix principal
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('PRIX DEMANDÉ / VALORISATION ESTIMATIVE', margin + 6, y + 6);

  doc.setFont('times', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
  doc.text(`${estPrice.toLocaleString('fr-FR')} TND`, margin + 6, y + 13);

  // Colonne centrale: Typologie & Objectif
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('OBJECTIF DU MANDAT', margin + 75, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(goldPrimary[0], goldPrimary[1], goldPrimary[2]);
  const objLabel = sub.objective === 'VENTE' ? 'VENTE EXCLUSIVE' : sub.objective === 'RESIDENCE' ? 'RÉSIDENCE PRESTIGE' : sub.objective === 'LUXE' ? 'VILLAS DE LUXE' : sub.objective === 'EVENT' ? 'ÉVÉNEMENTIEL' : 'MANDAT PRIVÉ';
  doc.text(objLabel, margin + 75, y + 12);

  // Colonne droite: Ratio au m²
  const pricePerM2 = sub.surfaceM2 && estPrice > 0 ? Math.round(estPrice / sub.surfaceM2) : null;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('SURFACE & RATIO', margin + 140, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`${sub.surfaceM2 || 0} m² ${pricePerM2 ? `(≈ ${pricePerM2.toLocaleString('fr-FR')} TND/m²)` : ''}`, margin + 140, y + 12);

  // Spécificité Villa Semi-Construite
  if (isSemi) {
    const compEst = sub.completionEstimate || sp.completionEstimate || 0;
    const stage = sub.constructionStage || sp.constructionStage || 'Gros œuvre';
    const totalProj = estPrice + compEst;

    doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
    doc.setLineWidth(0.3);
    doc.line(margin + 6, y + 16, pageWidth - margin - 6, y + 16);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(amberAccent[0], amberAccent[1], amberAccent[2]);
    doc.text(`🏗️ Travaux à achever : + ${compEst.toLocaleString('fr-FR')} TND`, margin + 6, y + 21);

    doc.setTextColor(greenAccent[0], greenAccent[1], greenAccent[2]);
    doc.text(`Investissement total projeté clé en main : ≈ ${totalProj.toLocaleString('fr-FR')} TND`, margin + 75, y + 21);

    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.setFont('helvetica', 'normal');
    doc.text(`Stade : ${stage}`, margin + 145, y + 21);
  }

  // Spécificité Local Commercial / Fonds de commerce
  if (isComm) {
    const act = sub.businessActivity || sp.businessActivity || 'Tous commerces';
    const rent = sub.monthlyRentTND || sp.monthlyRentTND;
    const facade = sp.linearFacadeMeters;

    doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
    doc.setLineWidth(0.3);
    doc.line(margin + 6, y + 16, pageWidth - margin - 6, y + 16);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(skyAccent[0], skyAccent[1], skyAccent[2]);
    doc.text(`🏢 Vocation : ${act}`, margin + 6, y + 21);

    if (rent) {
      doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
      doc.text(`Loyer mensuel murs : ${rent.toLocaleString('fr-FR')} TND/mois`, margin + 75, y + 21);
    }
    if (facade) {
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text(`Linéaire vitrine : ${facade} m`, margin + 145, y + 21);
    }
  }

  y += valuationCardHeight + 6;

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. IDENTITÉ DU PROPRIÉTAIRE MANDANT (CONFIDENTIEL)
  // ═══════════════════════════════════════════════════════════════════════════
  renderCardHeader('1. Identification du Propriétaire Mandant', 'Strictement Confidentiel');

  const colWidth = (contentWidth - 6) / 3;
  const colA = margin + 3;
  const colB = colA + colWidth + 3;
  const colC = colB + colWidth + 3;

  renderField('Nom & Prénom Mandant', sub.ownerName || 'Non communiqué', colA, y, colWidth, true);
  renderField('Téléphone Direct', sub.ownerPhone || 'Non communiqué', colB, y, colWidth, true);
  renderField('Adresse Email', sub.ownerEmail || 'Non communiquée', colC, y, colWidth);

  y += 12;

  renderField('Gouvernorat / Ville', `${sub.gouvernorat || 'Sfax'} — ${sub.city || 'Sfax'}`, colA, y, colWidth);
  renderField('Quartier / Secteur', sub.district || 'Sfax', colB, y, colWidth);
  renderField('Adresse Géographique', sub.address || 'Consultation sur rendez-vous', colC, y, colWidth);

  y += 14;

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. CARACTÉRISTIQUES DU BIEN & ARCHITECTURE
  // ═══════════════════════════════════════════════════════════════════════════
  renderCardHeader('2. Typologie & Architecture du Bien Immobilière', 'Relevé Déclaratif');

  renderField('Typologie Principale', sub.propertyType, colA, y, colWidth, true);
  renderField('Surface Totale', `${sub.surfaceM2 || 0} m²`, colB, y, colWidth, true);
  renderField('Nombre de Pièces / Chambres', `${sub.bedrooms || 0} chambres`, colC, y, colWidth);

  y += 12;

  if (sp.landSurfaceM2 || sp.builtSurfaceM2) {
    renderField('Surface Terrain', `${sp.landSurfaceM2 || sub.surfaceM2 || '—'} m²`, colA, y, colWidth);
    renderField('Surface Bâtie Couverte', `${sp.builtSurfaceM2 || '—'} m²`, colB, y, colWidth);
    renderField('Configuration', `${sub.bedrooms || 0} ch. • Salons de réception`, colC, y, colWidth);
    y += 12;
  } else {
    renderField('Destination du Bien', sub.propertyType, colA, y, colWidth);
    renderField('Usage Actuel', sub.objective === 'VENTE' ? 'Résidence de Propriétaire' : 'Location / Rendement', colB, y, colWidth);
    renderField('Localisation Précise', `${sub.district}, ${sub.city}`, colC, y, colWidth);
    y += 12;
  }

  y += 2;

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. CONFORMITÉ JURIDIQUE & SITUATION FONCIÈRE (LOI TUNISIENNE)
  // ═══════════════════════════════════════════════════════════════════════════
  renderCardHeader('3. Cadre Légal & Situation Foncière (Loi de la République Tunisienne)', 'Vérification Notariale');

  // Cadre juridique stylisé
  doc.setFillColor(bgCardLight[0], bgCardLight[1], bgCardLight[2]);
  doc.roundedRect(margin, y - 2, contentWidth, 23, 1.5, 1.5, 'F');
  doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y - 2, contentWidth, 23, 1.5, 1.5, 'D');

  renderField('Nature du Titre Foncier', sub.titleType || 'Titre Bleu Individuel (رسم عقاري فردي)', colA, y + 1, colWidth, true);
  renderField('Numéro Titre CPF (دفتر خانة)', sub.titleNumber ? `N° ${sub.titleNumber}` : 'En cours de mention', colB, y + 1, colWidth, true);
  renderField('Certificat Propriété CPF (< 3 mois)', sub.hasCertificate === 'Oui' || sub.hasCertificate === 'OUI' ? 'OUI (Certifié sans hypothèque)' : sub.hasCertificate || 'Non fourni', colC, y + 1, colWidth);

  y += 11;

  renderField('Permis de Bâtir Municipal', sub.hasBuildingPermit === 'Oui' || sub.hasBuildingPermit === 'OUI' ? 'OUI (Régulier & Conforme)' : sub.hasBuildingPermit || 'Non applicable', colA, y + 1, colWidth);
  renderField('Situation d’Indivision', sub.titleType?.includes('indivis') ? 'Bien en indivision' : 'Propriété exclusive sans indivision', colB, y + 1, colWidth);
  renderField('Attestation sur l’Honneur', sub.tunisianLawCertified ? 'Certifié conforme aux lois tunisiennes' : 'Engagement moral du mandant', colC, y + 1, colWidth);

  y += 16;

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. DOSSIER PHOTOGRAPHIQUE & DESCRIPTIF DU MANDANT
  // ═══════════════════════════════════════════════════════════════════════════
  const photoCount = sub.photos?.length || 0;
  renderCardHeader('4. Inventaire Photographique & Notes Éditoriales', `${photoCount} visuel(s) versé(s) au dossier`);

  if (sub.details) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);

    const quoteLines = doc.splitTextToSize(`« ${sub.details} »`, contentWidth - 10);
    doc.setFillColor(bgCardLight[0], bgCardLight[1], bgCardLight[2]);
    doc.roundedRect(margin, y, contentWidth, quoteLines.length * 3.8 + 4, 1, 1, 'F');
    doc.text(quoteLines, margin + 5, y + 4.5);
    y += quoteLines.length * 3.8 + 8;
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text('Dossier déposé avec descriptif standard conforme aux déclarations du propriétaire.', margin + 3, y);
    y += 6;
  }

  // Si l'espace restant est trop serré pour les signatures, sauter de page élégamment
  if (y > pageHeight - 55) {
    doc.addPage();
    y = 20;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. VISA D'INTERMÉDIATION & DOUBLE SIGNATURE DE PRESTIGE
  // ═══════════════════════════════════════════════════════════════════════════
  renderCardHeader('5. Double Visa d’Engagement & Mandat d’Intermédiation', 'Villa Regia Real Estates');

  const signBoxWidth = (contentWidth - 8) / 2;
  const signBoxHeight = 27;

  // Box 1 : Propriétaire Mandant
  doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, signBoxWidth, signBoxHeight, 1.5, 1.5, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
  doc.text('POUR LE PROPRIÉTAIRE MANDANT', margin + 4, y + 4.5);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Mention manuscrite "Bon pour accord et mandat de présentation" :', margin + 4, y + 8.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`Signataire : ${sub.ownerName}`, margin + 4, y + 23);

  // Box 2 : Direction Villa Regia & Cachet
  const box2X = margin + signBoxWidth + 8;
  doc.roundedRect(box2X, y, signBoxWidth, signBoxHeight, 1.5, 1.5, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(goldPrimary[0], goldPrimary[1], goldPrimary[2]);
  doc.text('POUR LA MAISON VILLA REGIA REAL ESTATES', box2X + 4, y + 4.5);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Visa de conformité & Agrément du comité de sélection Sfax :', box2X + 4, y + 8.5);

  // Simulation Cachet Officiel Villa Regia
  doc.setDrawColor(goldPrimary[0], goldPrimary[1], goldPrimary[2]);
  doc.setLineWidth(0.5);
  doc.circle(box2X + signBoxWidth - 14, y + 16, 7.5);
  doc.setFont('times', 'bold');
  doc.setFontSize(5);
  doc.setTextColor(goldPrimary[0], goldPrimary[1], goldPrimary[2]);
  doc.text('VILLA REGIA', box2X + signBoxWidth - 14, y + 14.5, { align: 'center' });
  doc.text('SFAX', box2X + signBoxWidth - 14, y + 16.5, { align: 'center' });
  doc.text('★ VISA ★', box2X + signBoxWidth - 14, y + 18.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
  doc.text('Direction des Transactions & Patrimoine', box2X + 4, y + 23);

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. PIED DE PAGE CORPORATE LUXE
  // ═══════════════════════════════════════════════════════════════════════════
  doc.setFillColor(navyDark[0], navyDark[1], navyDark[2]);
  doc.rect(0, pageHeight - 13, pageWidth, 13, 'F');

  // Liseré or supérieur
  doc.setDrawColor(goldPrimary[0], goldPrimary[1], goldPrimary[2]);
  doc.setLineWidth(0.7);
  doc.line(0, pageHeight - 13, pageWidth, pageHeight - 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(215, 218, 225);
  doc.text('Villa Regia Real Estates • Route de la Soukra Km 3.5, Sfax (Tunisie) • Téléphone / WhatsApp : +216 27 745 403 • contact@villaregiarealestates.com', pageWidth / 2, pageHeight - 7.5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(goldPrimary[0], goldPrimary[1], goldPrimary[2]);
  doc.text('DOCUMENT CONFIDENTIEL HAUT DE GAMME • STRICTEMENT RÉSERVÉ AUX PARTIES MANDANTES ET À LA DIRECTION', pageWidth / 2, pageHeight - 3.5, { align: 'center' });

  // Sauvegarder le PDF avec nom d'archive prestigieux
  const cleanRef = (sub.refCode || `VR-${sub.id.slice(-6)}`).replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `VillaRegia_DossierExpertise_${cleanRef}.pdf`;
  doc.save(filename);
}
