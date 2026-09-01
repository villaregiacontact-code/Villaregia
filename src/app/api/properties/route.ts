import { NextRequest, NextResponse } from 'next/server';
import { getProperties, createProperty } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const universe = searchParams.get('universe') as any;
    const category = searchParams.get('category') as any;
    const city = searchParams.get('city') || undefined;
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const minBedrooms = searchParams.get('minBedrooms') ? Number(searchParams.get('minBedrooms')) : undefined;
    const minSurface = searchParams.get('minSurface') ? Number(searchParams.get('minSurface')) : undefined;
    const hasPool = searchParams.get('hasPool') === 'true';
    const hasGarden = searchParams.get('hasGarden') === 'true';

    const properties = await getProperties({
      universe,
      category,
      city,
      minPrice,
      maxPrice,
      minBedrooms,
      minSurface,
      hasPool,
      hasGarden,
    });

    return NextResponse.json({ success: true, count: properties.length, properties });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const property = await createProperty(body);
    return NextResponse.json({ success: true, property }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
