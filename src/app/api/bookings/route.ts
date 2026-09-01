import { NextRequest, NextResponse } from 'next/server';
import { getBookings, createBooking } from '@/lib/db';

export async function GET() {
  try {
    const bookings = await getBookings();
    return NextResponse.json({ success: true, count: bookings.length, bookings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Simple server validation
    if (!body.propertyId || !body.guestName || !body.guestEmail || !body.checkIn || !body.checkOut) {
      return NextResponse.json(
        { success: false, error: 'Champs de réservation obligatoires manquants.' },
        { status: 400 }
      );
    }

    const booking = await createBooking(body);
    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
