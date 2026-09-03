import { NextRequest, NextResponse } from 'next/server';
import { getLeads, updateLead, createLead, deleteLead } from '@/lib/db';

export async function GET() {
  try {
    const leads = await getLeads();
    return NextResponse.json({ success: true, count: leads.length, leads });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name || !body.phone) {
      return NextResponse.json({ success: false, error: 'Nom et téléphone requis' }, { status: 400 });
    }
    const lead = await createLead(body);
    return NextResponse.json({ success: true, lead }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID requis' }, { status: 400 });
    }
    const lead = await updateLead(id, updates);
    if (!lead) {
      return NextResponse.json({ success: false, error: 'Lead introuvable' }, { status: 404 });
    }
    return NextResponse.json({ success: true, lead });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID requis' }, { status: 400 });
    }
    const success = await deleteLead(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
