import { FalkorDB } from 'falkordb';

let globalClient: any = null;

export async function getFalkorDB() {
  if (!globalClient) {
    globalClient = await FalkorDB.connect({
      host: process.env.FALKORDB_HOST || 'r-6jissuruar.instance-smwhvhjy3.hc-srom4rolb.eu-west-1.aws.f2e0a955bb84.cloud',
      port: parseInt(process.env.FALKORDB_PORT || '52752', 10),
      username: process.env.FALKORDB_USERNAME || 'falkordb',
      password: process.env.FALKORDB_PASSWORD || '20182008Kk.',
    });
  }
  return globalClient;
}

export const GRAPH_TRUST = process.env.FALKORDB_GRAPH_TRUST || 'clearpath_trust';
export const GRAPH_MEMORY = process.env.FALKORDB_GRAPH_MEMORY || 'clearpath_mem_dave';
export const GRAPH_SHARED = process.env.FALKORDB_GRAPH_SHARED || 'clearpath_shared_cases';

export async function getTrustGraph() {
  const db = await getFalkorDB();
  return db.selectGraph(GRAPH_TRUST);
}

export async function getMemoryGraph() {
  const db = await getFalkorDB();
  return db.selectGraph(GRAPH_MEMORY);
}

export async function getSharedGraph() {
  const db = await getFalkorDB();
  return db.selectGraph(GRAPH_SHARED);
}
