import { NextRequest, NextResponse } from 'next/server';
import { getTrustGraph } from '@/lib/falkordb';
import { CYPHER_QUERIES } from '@/lib/queries';

export async function POST(req: NextRequest) {
  try {
    const { action = 'simulate', targetAddress = '0xDEMO_CLEAN_TARGET_03' } = await req.json();
    const trust = await getTrustGraph();

    if (action === 'simulate') {
      const res = await trust.query(CYPHER_QUERIES.THEATER_SIMULATE_TAINT, {
        params: {
          muleAddress: '0xDEMO_MULE_A',
          targetAddress,
          amountUsd: 8500.0,
          timestamp: Date.now()
        }
      });
      return NextResponse.json({
        success: true,
        action: 'simulated',
        targetAddress,
        message: 'Injected 1-hop dirty taint edge ($8,500 from Mule A). Next scan will show CAUTION!',
        res: res.data
      });
    } else if (action === 'rollback') {
      const res = await trust.query(CYPHER_QUERIES.THEATER_ROLLBACK_TAINT, {
        params: {
          muleAddress: '0xDEMO_MULE_A',
          targetAddress
        }
      });
      return NextResponse.json({
        success: true,
        action: 'rolled_back',
        targetAddress,
        message: 'Deleted simulated taint edge. Next scan will revert to NO-KNOWN-RISK.',
        res: res.data
      });
    } else {
      // Check status
      const checkRes = await trust.query(`
        MATCH (m:Wallet {address: '0xDEMO_MULE_A'})-[r:TRANSFERRED {tx_hash: '0xTHEATER_DIRTY_SIM_TX_99'}]->(t:Wallet {address: $targetAddress})
        RETURN count(r) AS sim_count
      `, { params: { targetAddress } });
      const isSimActive = Number(checkRes.data?.[0]?.sim_count || 0) > 0;
      return NextResponse.json({ success: true, isSimActive });
    }
  } catch (error: any) {
    console.error('Theater route error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
