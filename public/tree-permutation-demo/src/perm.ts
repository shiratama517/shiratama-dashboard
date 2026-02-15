// src/perm.ts

export type Edge = { id: string; u: number; v: number };

export function applyEdges(n: number, edges: Edge[]): number[] {
  const perm = new Array<number>(n + 1);
  for (let i = 1; i <= n; i++) perm[i] = i;
  for (const e of edges) {
    const tmp = perm[e.u];
    perm[e.u] = perm[e.v];
    perm[e.v] = tmp;
  }
  return perm;
}

/**
 * 頂点の入れ替え f_T を計算する。
 * 計算された置換を C とすると、
 *   f_T(1)=1
 *   f_T(k)=C^{k-1}(1)  (2<=k<=n)
 *
 * ここで C は 1-indexed の写像配列（perm[i] = C(i)）とする。
 */
export type ComputeFTLogOptions = {
  enabled?: boolean;
  prefix?: string;
  maxSteps?: number; // ログ出力するステップ数上限（n が大きいときの保険）
  logger?: (line: string) => void; // 既定: console.log
};

export function computeFTFromC(C: number[], options?: ComputeFTLogOptions): number[] {
  const n = C.length - 1;
  const f = new Array<number>(n + 1);
  if (n <= 0) return f;

  const enabled = options?.enabled ?? false;
  const prefix = options?.prefix ?? "[computeFTFromC]";
  const maxSteps = options?.maxSteps ?? 200;
  const logger = options?.logger ?? ((line: string) => console.log(line));

  if (enabled) {
    logger(`${prefix} n=${n}`);
    logger(`${prefix} C(1..n) = ${C.slice(1).join(" ")}`);
  }

  let x = 1; // C^0(1)
  for (let k = 1; k <= n; k++) {
    f[k] = x; // f_T(k) = C^{k-1}(1)
    const next = C[x]; // C^k(1)
    if (enabled && k <= maxSteps) {
      logger(`${prefix} k=${k}: x=C^(${k - 1})(1)=${x}  ->  C(x)=${next}`);
      if (k === maxSteps && n > maxSteps) {
        logger(`${prefix} ... (remaining steps omitted: ${n - maxSteps})`);
      }
    }
    x = next; // 次の冪へ進む
  }
  return f;
}

export function permToCycles(perm: number[]): number[][] {
  const n = perm.length - 1;
  const seen = new Array<boolean>(n + 1).fill(false);
  const cycles: number[][] = [];
  for (let i = 1; i <= n; i++) {
    if (!seen[i]) {
      let cur = i;
      const cyc: number[] = [];
      while (!seen[cur]) {
        seen[cur] = true;
        cyc.push(cur);
        cur = perm[cur];
      }
      if (cyc.length > 1) cycles.push(cyc);
    }
  }
  return cycles;
}

export function inversionCount(perm: number[]): number {
  const n = perm.length - 1;
  let cnt = 0;
  for (let i = 1; i <= n; i++) {
    for (let j = i + 1; j <= n; j++) {
      if (perm[i] > perm[j]) cnt++;
    }
  }
  return cnt;
}

export function edgeIsInversion(perm: number[], e: Edge): boolean {
  const a = Math.min(e.u, e.v);
  const b = Math.max(e.u, e.v);
  return perm[a] > perm[b];
}
