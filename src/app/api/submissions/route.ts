import { NextRequest, NextResponse } from 'next/server';
import { createOwnerSubmission } from '@/lib/db';
import { sendOwnerSubmissionEmails } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.ownerName || !body.ownerPhone || !body.propertyType || !body.objective) {
      return NextResponse.json(
        { success: false, error: 'Informations de formulaire incomplètes.' },
        { status: 400 }
      );
    }

    const { submission, whatsappLink } = await createOwnerSubmission(body);

    // ── AUTOMATED EMAIL DISPATCH TO VILLA REGIA & OWNER ──
    try {
      await sendOwnerSubmissionEmails({
        refCode: submission.id || `DOS-${Date.now()}`,
        propertyType: submission.propertyType,
        objective: submission.objective,
        surfaceM2: submission.surfaceM2,
        bedrooms: body.bedrooms,
        estimatedValue: submission.estimatedValue,
        gouvernorat: body.gouvernorat || 'Sfax',
        city: submission.city,
        district: submission.district,
        address: body.address,
        googleMapsLink: body.googleMapsLink,
        ownerName: submission.ownerName,
        ownerPhone: submission.ownerPhone,
        ownerEmail: body.ownerEmail,
        titleType: body.titleType,
        titleNumber: body.titleNumber,
        hasCertificate: body.hasCertificate,
        hasBuildingPermit: body.hasBuildingPermit,
        details: submission.details,
        photos: body.photos,
      });
    } catch (mailErr) {
      console.warn('Submission email dispatch warning:', mailErr);
    }

    return NextResponse.json({ success: true, submission, whatsappLink }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
