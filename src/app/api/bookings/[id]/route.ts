import { NextRequest, NextResponse } from 'next/server';
import { updateBookingStatus } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json();
    const booking = await updateBookingStatus(params.id, status);
    if (!booking) {
      return NextResponse.json({ success: false, error: 'Réservation non trouvée' }, { status: 404 });
    }
    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
