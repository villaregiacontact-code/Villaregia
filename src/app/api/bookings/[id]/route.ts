import { NextRequest, NextResponse } from 'next/server';
import { updateBookingStatus, deleteBooking } from '@/lib/db';

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteBooking(params.id);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

