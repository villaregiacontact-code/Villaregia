import { NextRequest, NextResponse } from 'next/server';
import { createOwnerSubmission } from '@/lib/db';

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
    return NextResponse.json({ success: true, submission, whatsappLink }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
