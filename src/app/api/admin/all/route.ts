import { NextResponse } from 'next/server';
import {
  getProperties,
  getBookings,
  getLeads,
  getDbUsers,
  getOwnerSubmissions,
  getArticles,
} from '@/lib/db';

export const dynamic = 'force-dynamic';

let cachedAdminData: any = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 2000;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forceFresh = searchParams.get('force') === 'true';
  const now = Date.now();

  if (!forceFresh && cachedAdminData && now - lastCacheTime < CACHE_TTL_MS) {
    return NextResponse.json({ success: true, ...cachedAdminData, cached: true });
  }

  try {
    const [properties, bookings, leads, users, submissions, articles] = await Promise.all([
      getProperties().catch(() => []),
      getBookings().catch(() => []),
      getLeads().catch(() => []),
      getDbUsers().catch(() => []),
      getOwnerSubmissions().catch(() => []),
      getArticles().catch(() => []),
    ]);

    const totalVolume = properties.reduce((sum, p) => sum + (p?.price?.amount || 0), 0);
    const activeCount = properties.filter((p) => p?.status === 'DISPONIBLE').length;
    const pendingBookings = bookings.filter((b) => b?.status === 'PENDING').length;
    const newLeadsCount = leads.filter((l) => l?.status === 'Nouveau').length;

    const stats = {
      totalProperties: properties.length,
      activeProperties: activeCount,
      totalBookings: bookings.length,
      pendingBookings,
      totalLeads: leads.length,
      newLeads: newLeadsCount,
      portfolioValueTND: totalVolume,
    };

    cachedAdminData = {
      stats,
      properties,
      bookings,
      leads,
      users,
      submissions,
      articles,
    };
    lastCacheTime = now;

    return NextResponse.json({
      success: true,
      ...cachedAdminData,
      cached: false,
    });
  } catch (error: any) {
    console.error('Error fetching consolidated admin data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load consolidated data' },
      { status: 500 }
    );
  }
}
