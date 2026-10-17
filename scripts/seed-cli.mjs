import { FalkorDB } from 'falkordb';

async function runSeed() {
  console.log('Connecting to FalkorDB Cloud...');
  const db = await FalkorDB.connect({
    host: 'r-6jissuruar.instance-smwhvhjy3.hc-srom4rolb.eu-west-1.aws.f2e0a955bb84.cloud',
    port: 52752,
    username: 'falkordb',
    password: '20182008Kk.',
  });

  const trust = db.selectGraph('clearpath_trust');
  const memory = db.selectGraph('clearpath_mem_dave');
  const shared = db.selectGraph('clearpath_shared_cases');

  console.log('Resetting graphs...');
  try { await trust.delete(); } catch (_) {}
  try { await memory.delete(); } catch (_) {}
  try { await shared.delete(); } catch (_) {}

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  console.log('Seeding clearpath_trust...');
  await trust.query(`
    CREATE (m1:Wallet {address: '0xDEMO_TORNADO_MIXER', label: 'Tornado.Cash Router', entity_type: 'mixer', first_seen: ${now - 300 * dayMs}, balance_usd: 1250000.0, synthetic: true})
    CREATE (s1:Wallet {address: '0xDEMO_OFAC_SANCTIONED_01', label: 'Lazarus Group Cluster', entity_type: 'sanctioned', first_seen: ${now - 200 * dayMs}, balance_usd: 840000.0, synthetic: true})
    CREATE (muleA:Wallet {address: '0xDEMO_MULE_A', label: 'Mule A (High-Velocity)', entity_type: 'mule', first_seen: ${now - 25 * dayMs}, balance_usd: 12000.0, synthetic: true})
    CREATE (muleB:Wallet {address: '0xDEMO_MULE_B', label: 'Mule B (Peeling Agent)', entity_type: 'mule', first_seen: ${now - 18 * dayMs}, balance_usd: 9500.0, synthetic: true})
    CREATE (muleC:Wallet {address: '0xDEMO_MULE_C', label: 'Mule C (Rapid Dispersal)', entity_type: 'mule', first_seen: ${now - 12 * dayMs}, balance_usd: 14000.0, synthetic: true})
    CREATE (consX:Wallet {address: '0xDEMO_CONSOLIDATOR_X', label: 'Consolidator X', entity_type: 'consolidator', first_seen: ${now - 15 * dayMs}, balance_usd: 48000.0, synthetic: true})
    CREATE (exA:Wallet {address: '0xDEMO_DIRTY_TARGET_01', label: 'Suspicious Counterparty #1', entity_type: 'unknown', first_seen: ${now - 10 * dayMs}, balance_usd: 18500.0, synthetic: true})
    CREATE (exB:Wallet {address: '0xDEMO_CAUTION_TARGET_02', label: 'Grey OTC Broker', entity_type: 'otc_desk', first_seen: ${now - 8 * dayMs}, balance_usd: 35000.0, synthetic: true})
    CREATE (binance:Wallet {address: '0xDEMO_BINANCE_HOT_WALLET', label: 'Binance 14 Hot Wallet', entity_type: 'exchange_hot_wallet', first_seen: ${now - 1000 * dayMs}, balance_usd: 45000000.0, synthetic: true})
    CREATE (kraken:Wallet {address: '0xDEMO_KRAKEN_HOT_WALLET', label: 'Kraken Settlement Hot Wallet', entity_type: 'exchange_hot_wallet', first_seen: ${now - 900 * dayMs}, balance_usd: 28000000.0, synthetic: true})
    CREATE (exC:Wallet {address: '0xDEMO_CLEAN_TARGET_03', label: 'Prime Liquidity Merchant', entity_type: 'merchant', first_seen: ${now - 180 * dayMs}, balance_usd: 92000.0, synthetic: true})
    CREATE (verifier:Wallet {address: '0xDEMO_VERIFIED_KYC_ORACLE', label: 'Consensus Identity Verifier', entity_type: 'clean_user', first_seen: ${now - 400 * dayMs}, balance_usd: 50000.0, synthetic: true})
  `);

  await trust.query(`
    MATCH (m1:Wallet {address: '0xDEMO_TORNADO_MIXER'})
    MATCH (muleA:Wallet {address: '0xDEMO_MULE_A'})
    MATCH (muleB:Wallet {address: '0xDEMO_MULE_B'})
    MATCH (consX:Wallet {address: '0xDEMO_CONSOLIDATOR_X'})
    MATCH (exA:Wallet {address: '0xDEMO_DIRTY_TARGET_01'})
    MATCH (exB:Wallet {address: '0xDEMO_CAUTION_TARGET_02'})
    MATCH (binance:Wallet {address: '0xDEMO_BINANCE_HOT_WALLET'})
    MATCH (kraken:Wallet {address: '0xDEMO_KRAKEN_HOT_WALLET'})
    MATCH (exC:Wallet {address: '0xDEMO_CLEAN_TARGET_03'})
    MATCH (verifier:Wallet {address: '0xDEMO_VERIFIED_KYC_ORACLE'})

    CREATE (m1)-[:TRANSFERRED {tx_hash: '0xTX_MIX_01', amount_usd: 5000.0, timestamp: ${now - 3 * dayMs}, token: 'ETH'}]->(muleA)
    CREATE (m1)-[:TRANSFERRED {tx_hash: '0xTX_MIX_02', amount_usd: 5000.0, timestamp: ${now - 3 * dayMs}, token: 'ETH'}]->(muleB)
    CREATE (muleA)-[:TRANSFERRED {tx_hash: '0xTX_PEEL_01', amount_usd: 4850.0, timestamp: ${now - 2 * dayMs}, token: 'ETH'}]->(consX)
    CREATE (muleB)-[:TRANSFERRED {tx_hash: '0xTX_PEEL_02', amount_usd: 4900.0, timestamp: ${now - 2 * dayMs}, token: 'ETH'}]->(consX)
    CREATE (consX)-[:TRANSFERRED {tx_hash: '0xTX_DIRT_01', amount_usd: 9500.0, timestamp: ${now - 1 * dayMs}, token: 'ETH'}]->(exA)
    CREATE (binance)-[:TRANSFERRED {tx_hash: '0xTX_CLEAN_INFLOW_A', amount_usd: 12000.0, timestamp: ${now - 4 * dayMs}, token: 'USDT'}]->(exA)

    CREATE (muleA)-[:TRANSFERRED {tx_hash: '0xTX_CAUTION_01', amount_usd: 2500.0, timestamp: ${now - 5 * dayMs}, token: 'ETH'}]->(exB)
    CREATE (kraken)-[:TRANSFERRED {tx_hash: '0xTX_KRAKEN_B', amount_usd: 18000.0, timestamp: ${now - 6 * dayMs}, token: 'USDC'}]->(exB)

    CREATE (binance)-[:TRANSFERRED {tx_hash: '0xTX_CLEAN_C1', amount_usd: 45000.0, timestamp: ${now - 40 * dayMs}, token: 'USDC'}]->(exC)
    CREATE (kraken)-[:TRANSFERRED {tx_hash: '0xTX_CLEAN_C2', amount_usd: 35000.0, timestamp: ${now - 20 * dayMs}, token: 'ETH'}]->(exC)
    CREATE (verifier)-[:ATTESTS_TO {context: 'EAS Verified OTC Liquidity Provider Tier 1', weight: 0.95, confidence: 0.99}]->(exC)
  `);

  console.log('Seeding background nodes...');
  await trust.query(`
    UNWIND range(1, 25) AS i
    CREATE (bg:Wallet {
      address: '0xDEMO_BG_WALLET_' + toString(i),
      label: 'Merchant Cluster Wallet #' + toString(i),
      entity_type: 'clean_user',
      first_seen: ${now} - (i * 10) * ${dayMs},
      balance_usd: 5000.0 + (i * 1200.0),
      synthetic: true
    })
  `);

  console.log('Seeding clearpath_mem_dave...');
  await memory.query(`
    CREATE (e1:Episode {
      id: 'ep_session_01_clean_scan',
      target_address: '0xDEMO_CLEAN_TARGET_03',
      verdict: 'NO-KNOWN-RISK',
      exposure_ratio: 0.0,
      session_id: 'session_dave_oct17_01',
      timestamp: ${now - 2 * 60 * 60 * 1000},
      notes: 'Initial scan for $15k trade. Confirmed CEX hot wallet liquidity.'
    })
    CREATE (p1:Playbook {
      id: 'pb_otc_tier1',
      rule_name: 'ClearPath Strict OTC Policy',
      threshold: 0.35,
      action: 'HALT_DEAL_BLOCK',
      version: '2.4'
    })
    CREATE (f1:Fact {
      id: 'fact_peeling_chains',
      pattern_name: 'Mule Peeling Topology',
      description: 'Rapid fan-out into 3 mules with <45m turnaround is high-confidence obfuscation.',
      created_at: ${now - 7 * dayMs}
    })
  `);

  console.log('Seeding clearpath_shared_cases...');
  await shared.query(`
    CREATE (c1:Case {
      target_address: '0xDEMO_HISTORICAL_FRAUDSTER',
      status: 'CONFIRMED_FRAUD',
      created_at: ${now - 5 * dayMs},
      escalated_by: 'Dave_OTC',
      initial_reason: 'Direct 1-hop Tornado Cash drainer exploit',
      exposure_ratio: 0.98
    })
  `);

  console.log('SUCCESS: All 3 graphs seeded in FalkorDB Cloud!');
  process.exit(0);
}

runSeed().catch(err => {
  console.error('Seed failure:', err);
  process.exit(1);
});
