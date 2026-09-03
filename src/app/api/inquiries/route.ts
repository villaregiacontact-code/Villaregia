import { NextRequest, NextResponse } from 'next/server';
import { createLead } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.name?.trim() || !body.phone?.trim() || !body.email?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Champs obligatoires manquants : nom, téléphone et email sont requis.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email.trim())) {
      return NextResponse.json(
        { success: false, error: 'Format d\'adresse email invalide.' },
        { status: 400 }
      );
    }

    const lead = await createLead({
      name: body.name.trim(),
      email: body.email.trim(),
      phone: body.phone.trim(),
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
