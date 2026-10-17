import { NextRequest, NextResponse } from 'next/server';
import { getSharedGraph } from '@/lib/falkordb';
import { CYPHER_QUERIES } from '@/lib/queries';

export async function POST(req: NextRequest) {
  try {
    const { targetAddress, reason, exposureRatio, operator = 'Dave_OTC' } = await req.json();

    if (!targetAddress) {
      return NextResponse.json({ error: 'Target address is required.' }, { status: 400 });
    }

    const shared = await getSharedGraph();
    const timestamp = Date.now();

    const res = await shared.query(CYPHER_QUERIES.ESCALATE_TO_SHARED_CASES, {
      params: {
        targetAddress,
        operator,
        reason: reason || 'Flagged via Dave OTC Screen approval gate',
        exposureRatio: exposureRatio || 0.0,
        timestamp
      }
    });

    return NextResponse.json({
      success: true,
      targetAddress,
      operator,
      status: 'ESCALATED',
      timestamp,
      result: res.data
    });
  } catch (error: any) {
    console.error('Escalation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
