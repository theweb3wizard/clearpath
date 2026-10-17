export const CYPHER_QUERIES = {
  // Query 1: Multi-Hop Taint Traversal (Up to 4 hops, filtered for dirty sources)
  MULTI_HOP_TAINT: `
    MATCH path = (source:Wallet)-[:TRANSFERRED*1..4]->(target:Wallet {address: $targetAddress})
    WHERE source.entity_type IN ['mixer', 'sanctioned', 'mule']
      AND ALL(rel IN relationships(path) WHERE rel.amount_usd >= 10.0)
      AND NONE(node IN nodes(path)[1..-1] WHERE node.entity_type = 'exchange_hot_wallet')
    RETURN 
      source.address AS source_address,
      source.entity_type AS source_type,
      length(path) AS hop_count,
      [x IN nodes(path) | x.address] AS node_addresses,
      [x IN nodes(path) | x.entity_type] AS node_types,
      [r IN relationships(path) | {
        from: startNode(r).address,
        to: endNode(r).address,
        amount: r.amount_usd,
        tx: r.tx_hash,
        timestamp: r.timestamp
      }] AS steps
  `,

  // Query 2: Target Wallet Inflow & Metadata
  WALLET_INFLOW_METRICS: `
    MATCH (w:Wallet {address: $targetAddress})
    OPTIONAL MATCH (inflow:Wallet)-[r:TRANSFERRED]->(w)
    RETURN 
      w.address AS address,
      w.label AS label,
      w.entity_type AS entity_type,
      w.first_seen AS first_seen,
      w.balance_usd AS balance_usd,
      coalesce(sum(r.amount_usd), 0.0) AS total_inflow,
      count(r) AS tx_count
  `,

  // Query 3: Attestations (EAS / EigenTrust style)
  WALLET_ATTESTATIONS: `
    MATCH (issuer:Wallet)-[a:ATTESTS_TO]->(target:Wallet {address: $targetAddress})
    RETURN 
      issuer.address AS issuer,
      issuer.label AS issuer_label,
      a.context AS context,
      a.weight AS weight,
      a.confidence AS confidence
  `,

  // Query 4: Centrality / Hub Check
  DEGREE_CENTRALITY: `
    MATCH (w:Wallet {address: $targetAddress})
    OPTIONAL MATCH (w)-[out:TRANSFERRED]->()
    OPTIONAL MATCH ()-[inc:TRANSFERRED]->(w)
    RETURN 
      count(DISTINCT inc) AS fan_in,
      count(DISTINCT out) AS fan_out
  `,

  // Query 5: Episodic Memory Recall (From Dave's private graph)
  MEMORY_RECALL_EPISODES: `
    MATCH (e:Episode {target_address: $targetAddress})
    RETURN 
      e.id AS episode_id,
      e.verdict AS prior_verdict,
      e.exposure_ratio AS prior_exposure_ratio,
      e.timestamp AS prior_timestamp,
      e.notes AS prior_notes
    ORDER BY e.timestamp DESC
    LIMIT 3
  `,

  // Query 6: Temporal Delta ("What's new since Dave's last session?")
  TEMPORAL_DELTA: `
    MATCH (inflow:Wallet)-[r:TRANSFERRED]->(target:Wallet {address: $targetAddress})
    WHERE r.timestamp > $lastSessionTimestamp
    RETURN 
      count(r) AS new_inflows,
      coalesce(sum(r.amount_usd), 0.0) AS new_volume,
      collect(r.tx_hash) AS new_txs
  `,

  // Query 7: Save Episode to Dave's Memory Graph
  WRITE_EPISODE: `
    CREATE (e:Episode {
      id: $episodeId,
      target_address: $targetAddress,
      verdict: $verdict,
      exposure_ratio: $exposureRatio,
      session_id: $sessionId,
      timestamp: $timestamp,
      notes: $notes
    })
    RETURN e.id AS id
  `,

  // Query 8: Governance Gate - Escalate to Shared Cases Graph
  ESCALATE_TO_SHARED_CASES: `
    MERGE (c:Case {target_address: $targetAddress})
    ON CREATE SET 
      c.status = 'ESCALATED',
      c.created_at = $timestamp,
      c.escalated_by = $operator,
      c.initial_reason = $reason,
      c.exposure_ratio = $exposureRatio
    ON MATCH SET 
      c.updated_at = $timestamp,
      c.last_escalated_by = $operator
    MERGE (op:Operator {name: $operator})
    MERGE (op)-[:FILED_CASE {timestamp: $timestamp}]->(c)
    RETURN c.status AS status, c.created_at AS created_at
  `,

  // Query 9: Theater Test - Inject Dirty Taint Edge
  THEATER_SIMULATE_TAINT: `
    MATCH (mule:Wallet {address: $muleAddress})
    MATCH (target:Wallet {address: $targetAddress})
    MERGE (mule)-[r:TRANSFERRED {
      tx_hash: '0xTHEATER_DIRTY_SIM_TX_99',
      amount_usd: $amountUsd,
      timestamp: $timestamp,
      token: 'ETH',
      synthetic: true,
      simulation: true
    }]->(target)
    RETURN r.tx_hash AS simulated_tx
  `,

  // Query 10: Theater Test - Rollback Dirty Taint Edge
  THEATER_ROLLBACK_TAINT: `
    MATCH (mule:Wallet {address: $muleAddress})-[r:TRANSFERRED {tx_hash: '0xTHEATER_DIRTY_SIM_TX_99'}]->(target:Wallet {address: $targetAddress})
    DELETE r
    RETURN count(r) AS deleted_count
  `
};
