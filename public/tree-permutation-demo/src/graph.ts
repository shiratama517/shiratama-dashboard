export type UEdge = { u: number; v: number };

export type TreePhiResult =
  | { ok: true; order: UEdge[]; parent: number[] }
  | { ok: false; message: string };

class DSU {
  private parent: number[];
  private size: number[];

  constructor(n: number) {
    this.parent = new Array(n + 1);
    this.size = new Array(n + 1);
    for (let i = 1; i <= n; i++) {
      this.parent[i] = i;
      this.size[i] = 1;
    }
  }

  find(x: number): number {
    let p = this.parent[x];
    if (p === x) return x;
    p = this.find(p);
    this.parent[x] = p;
    return p;
  }

  union(a: number, b: number): boolean {
    let ra = this.find(a);
    let rb = this.find(b);
    if (ra === rb) return false;
    if (this.size[ra] < this.size[rb]) [ra, rb] = [rb, ra];
    this.parent[rb] = ra;
    this.size[ra] += this.size[rb];
    return true;
  }
}

export function isSameUndirectedEdge(a: UEdge, b: UEdge): boolean {
  return (a.u === b.u && a.v === b.v) || (a.u === b.v && a.v === b.u);
}

export function wouldCreateCycle(n: number, edges: UEdge[], next: UEdge): boolean {
  if (n <= 1) return false;
  const dsu = new DSU(n);
  for (const e of edges) dsu.union(e.u, e.v);
  return dsu.find(next.u) === dsu.find(next.v);
}

export function componentCount(n: number, edges: UEdge[]): number {
  if (n <= 0) return 0;
  const dsu = new DSU(n);
  for (const e of edges) dsu.union(e.u, e.v);
  const roots = new Set<number>();
  for (let i = 1; i <= n; i++) roots.add(dsu.find(i));
  return roots.size;
}

/**
 * 木 → 互換列（Φ）
 * - 根を 1 とみなし、各頂点 i (2..n) の親 parent[i] を木の唯一の経路から決める
 * - s_i を「1→i の経路の最後の辺」= (parent[i], i) として
 * - Φ = [s_2, s_3, ..., s_n] を返す
 *
 * NOTE: 本アプリの applyEdges は「配列順に互換を適用」するため、
 * Φ=[s2..sn] のとき積は s_n ... s_2 になる（右から左の合成に対応）。
 */
export function treeToPhiOrder(n: number, edges: UEdge[]): TreePhiResult {
  if (n <= 0) return { ok: true, order: [], parent: [] };
  if (n === 1) return { ok: true, order: [], parent: [0, 0] };

  if (edges.length !== n - 1) {
    return {
      ok: false,
      message: `木（連結かつ辺数=n-1）ではありません。頂点数=${n} に対して辺数=${edges.length} です。`,
    };
  }

  const adj: number[][] = new Array(n + 1);
  for (let i = 1; i <= n; i++) adj[i] = [];
  for (const e of edges) {
    if (e.u < 1 || e.u > n || e.v < 1 || e.v > n) {
      return { ok: false, message: "辺に範囲外の頂点番号が含まれています。" };
    }
    if (e.u === e.v) {
      return { ok: false, message: "自己ループ辺は木として扱えません。" };
    }
    adj[e.u].push(e.v);
    adj[e.v].push(e.u);
  }

  const parent = new Array<number>(n + 1).fill(0);
  const seen = new Array<boolean>(n + 1).fill(false);
  const q: number[] = [1];
  seen[1] = true;
  parent[1] = 0;

  for (let qi = 0; qi < q.length; qi++) {
    const v = q[qi];
    for (const to of adj[v]) {
      if (seen[to]) continue;
      seen[to] = true;
      parent[to] = v;
      q.push(to);
    }
  }

  for (let i = 1; i <= n; i++) {
    if (!seen[i]) {
      return {
        ok: false,
        message:
          "頂点1から到達できない頂点があります（根1で連結な木になっていません）。",
      };
    }
  }

  const order: UEdge[] = [];
  for (let i = 2; i <= n; i++) {
    const p = parent[i];
    if (p === 0) {
      return { ok: false, message: `頂点 ${i} の親が決まりませんでした。` };
    }
    order.push({ u: p, v: i });
  }

  return { ok: true, order, parent };
}


