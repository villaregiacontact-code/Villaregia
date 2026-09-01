import { NextRequest, NextResponse } from 'next/server';
import { createLead } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.name || !body.phone) {
      return NextResponse.json({ success: false, error: 'Nom et téléphone requis.' }, { status: 400 });
    }

    const lead = await createLead({
      name: body.name,
      email: body.email || 'non-fourni@villaregia.tn',
      phone: body.phone,
      source: body.source || 'Formulaire Contact',
      universe: body.universe || 'VENTE',
      propertyTitle: body.propertyTitle || 'Demande d\'information générale',
      notes: body.message || body.notes || 'Prise de contact via le site officiel.',
    });

    return NextResponse.json({ success: true, lead }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
