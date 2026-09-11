import { NextRequest, NextResponse } from 'next/server';
import { updateOwnerSubmissionStatus, deleteOwnerSubmission, getOwnerSubmissions } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subs = await getOwnerSubmissions();
    const sub = subs.find(s => s.id === params.id || s.refCode === params.id);
    if (!sub) {
      return NextResponse.json({ success: false, error: 'Dossier non trouvé' }, { status: 404 });
    }
    return NextResponse.json({ success: true, submission: sub });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updated = await updateOwnerSubmissionStatus(params.id, body.status, body.isPublished);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Dossier non trouvé' }, { status: 404 });
    }
    return NextResponse.json({ success: true, submission: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteOwnerSubmission(params.id);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
