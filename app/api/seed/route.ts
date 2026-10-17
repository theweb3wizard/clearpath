import { NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/seed';

export async function POST() {
  try {
    const res = await seedDatabase();
    return NextResponse.json({ message: 'Database reset and seeded cleanly.', ...res });
  } catch (error: any) {
    console.error('Seed API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
