// src/App.tsx
import React, { useMemo, useState } from "react";
import {
  applyEdges,
  computeFTFromC,
  permToCycles,
  inversionCount,
  edgeIsInversion,
} from "./perm";
import type { Edge } from "./perm";
import {
  componentCount,
  isSameUndirectedEdge,
  treeToPhiOrder,
  wouldCreateCycle,
} from "./graph";

type Vertex = { id: number; x: number; y: number };

export default function App() {
  const [vertices, setVertices] = useState<Vertex[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [edgeStart, setEdgeStart] = useState<number | null>(null);
  const [strictTree, setStrictTree] = useState(true);
  const [reverseMultiply, setReverseMultiply] = useState(false);
  const [step, setStep] = useState(0); // 0..edges.length
  const [notice, setNotice] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragPointerId, setDragPointerId] = useState<number | null>(null);
  const [dragStart, setDragStart] = useState<{
    vx: number;
    vy: number;
    px: number;
    py: number;
  } | null>(null);
  const [suppressNextClick, setSuppressNextClick] = useState(false);

  // 計算パート
  const n = vertices.length;
  const edgesPrefix = useMemo(() => {
    const p = edges.slice(0, step);
    // 「掛け算順を逆にする」= 適用順（for-loop の走査順）だけを反転
    // 表示上の「辺の順序」はそのまま（番号・リスト順は変えない）
    if (reverseMultiply) p.reverse();
    return p;
  }, [edges, step, reverseMultiply]);
  const perm = useMemo(() => applyEdges(n, edgesPrefix), [n, edgesPrefix]);
  const cycles = useMemo(() => permToCycles(perm), [perm]);
  const fT = useMemo(() => computeFTFromC(perm, { enabled: false }), [perm]);
  const fTCycles = useMemo(() => permToCycles(fT), [fT]);
  const invCount = useMemo(() => inversionCount(perm), [perm]);
  const comps = useMemo(
    () => componentCount(n, edgesPrefix.map((e) => ({ u: e.u, v: e.v }))),
    [n, edgesPrefix],
  );

  // Canvas サイズ（表示エリア・頂点追加クリックエリア）
  const width = 1080;
  const height = 700;

  function clientToSvgPoint(
    clientX: number,
    clientY: number,
    svgEl: SVGSVGElement,
  ) {
    const rect = svgEl.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function addVertex(e: React.MouseEvent<SVGSVGElement>) {
    if (suppressNextClick) {
      setSuppressNextClick(false);
      return;
    }
    const rect = (e.target as SVGElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newId = vertices.length + 1;
    setVertices([...vertices, { id: newId, x, y }]);
    setNotice(null);
  }

  function onVertexClick(id: number) {
    if (edgeStart === null) {
      setEdgeStart(id);
    } else if (edgeStart !== id) {
      const u = edgeStart;
      const v = id;

      const next = { u, v };
      if (edges.some((e) => isSameUndirectedEdge(e, next))) {
        setNotice("同じ2点を結ぶ辺は既に存在します。");
        setEdgeStart(null);
        return;
      }

      if (strictTree) {
        if (n >= 2 && edges.length >= n - 1) {
          setNotice("木モードでは、辺は最大で (頂点数-1) 本です。");
          setEdgeStart(null);
          return;
        }
        if (wouldCreateCycle(n, edges.map((e) => ({ u: e.u, v: e.v })), next)) {
          setNotice("木モードではサイクルを作れません（この辺は追加不可）。");
          setEdgeStart(null);
          return;
        }
      }

      const eid = "e" + (edges.length + 1);
      const nextEdges = [...edges, { id: eid, u, v }];
      setEdges(nextEdges);
      setEdgeStart(null);
      setNotice(null);
      setStep(nextEdges.length); // 追加直後は「全部適用」を維持
    } else {
      setEdgeStart(null);
    }
  }

  function moveEdge(idx: number, dir: -1 | 1) {
    const j = idx + dir;
    if (j < 0 || j >= edges.length) return;
    const next = edges.slice();
    const tmp = next[idx];
    next[idx] = next[j];
    next[j] = tmp;
    setEdges(next);
    setNotice(null);
  }

  function deleteEdge(idx: number) {
    const next = edges.slice();
    next.splice(idx, 1);
    setEdges(next);
    setStep((s) => Math.min(s, next.length));
    setNotice(null);
  }

  function resetAll() {
    setVertices([]);
    setEdges([]);
    setEdgeStart(null);
    setStep(0);
    setNotice(null);
    setDraggingId(null);
    setDragPointerId(null);
    setDragStart(null);
    setSuppressNextClick(false);
  }

  function replaceEdgesByTreePhi() {
    const res = treeToPhiOrder(n, edges.map((e) => ({ u: e.u, v: e.v })));
    if (!res.ok) {
      setNotice(res.message);
      return;
    }

    // 既存の辺IDをできるだけ維持（React key の安定化）
    const byKey = new Map<string, Edge>();
    for (const e of edges) {
      const a = Math.min(e.u, e.v);
      const b = Math.max(e.u, e.v);
      byKey.set(`${a}-${b}`, e);
    }

    const nextEdges: Edge[] = res.order.map((ue, idx) => {
      const a = Math.min(ue.u, ue.v);
      const b = Math.max(ue.u, ue.v);
      const found = byKey.get(`${a}-${b}`);
      return {
        id: found?.id ?? `phi-${idx + 2}`,
        u: ue.u,
        v: ue.v,
      };
    });

    setEdges(nextEdges);
    setStep(nextEdges.length);
    setNotice(null);
  }

  return (
    <div style={{ display: "flex", gap: 18, alignItems: "stretch" }}>
      <div style={{ flex: "0 0 auto" }}>
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>Tree Permutation</h2>
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={strictTree}
                onChange={(e) => {
                  setStrictTree(e.target.checked);
                  setNotice(null);
                }}
              />
              木モード（サイクル禁止）
            </label>
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={reverseMultiply}
                onChange={(e) => {
                  setReverseMultiply(e.target.checked);
                  setNotice(null);
                }}
              />
              掛け算順を逆にする
            </label>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={replaceEdgesByTreePhi}>木→Φ（根=1）</button>
            <button
              onClick={() => {
                setEdges([]);
                setStep(0);
                setNotice(null);
              }}
            >
              辺リセット
            </button>
            <button onClick={resetAll}>全部リセット</button>
          </div>
        </div>

        <div style={{ marginBottom: 10, fontSize: 13, opacity: 0.9 }}>
          空白クリックで頂点追加 → 頂点を2回クリックで辺追加（追加順が「辺の順序」） / 右クリックドラッグで頂点移動
          {edgeStart !== null ? ` / 選択中: ${edgeStart}` : ""}
        </div>

        {notice && (
          <div
            style={{
              marginBottom: 10,
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255, 120, 80, 0.12)",
              fontSize: 13,
            }}
          >
            {notice}
          </div>
        )}

        <svg
          width={width}
          height={height}
          style={{
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.16)",
            background:
              "radial-gradient(900px 380px at 20% 0%, rgba(120,140,255,0.22), transparent 60%), radial-gradient(900px 420px at 60% 100%, rgba(90,255,200,0.14), transparent 60%), rgba(255,255,255,0.02)",
          }}
          onContextMenu={(e) => {
            // 頂点移動に右クリックを使うため、ブラウザのコンテキストメニューを抑止
            e.preventDefault();
          }}
          onClick={addVertex}
          onPointerMove={(e) => {
            if (draggingId === null || dragStart === null) return;
            const svgEl = e.currentTarget;
            const p = clientToSvgPoint(e.clientX, e.clientY, svgEl);
            const dx = p.x - dragStart.px;
            const dy = p.y - dragStart.py;
            setVertices((vs) =>
              vs.map((v) => {
                if (v.id !== draggingId) return v;
                const nx = Math.max(18, Math.min(width - 18, dragStart.vx + dx));
                const ny = Math.max(18, Math.min(height - 18, dragStart.vy + dy));
                return { ...v, x: nx, y: ny };
              }),
            );
          }}
          onPointerUp={(e) => {
            if (dragPointerId !== null) {
              try {
                e.currentTarget.releasePointerCapture(dragPointerId);
              } catch {
                // ignore
              }
            }
            setDraggingId(null);
            setDragPointerId(null);
            setDragStart(null);
          }}
          onPointerCancel={(e) => {
            if (dragPointerId !== null) {
              try {
                e.currentTarget.releasePointerCapture(dragPointerId);
              } catch {
                // ignore
              }
            }
            setDraggingId(null);
            setDragPointerId(null);
            setDragStart(null);
          }}
        >
          {/* 辺（prefix まで有効） */}
          {edges.map((e, i) => {
            const u = vertices.find((vv) => vv.id === e.u);
            const v = vertices.find((vv) => vv.id === e.v);
            if (!u || !v) return null;

            const active = i < step;
            const isInv = active ? edgeIsInversion(perm, e) : false;
            const mx = (u.x + v.x) / 2;
            const my = (u.y + v.y) / 2;

            const stroke = !active
              ? "rgba(200,200,200,0.25)"
              : isInv
                ? "#ff4d4d"
                : "#39d98a";

            return (
              <g key={e.id}>
                <line
                  x1={u.x}
                  y1={u.y}
                  x2={v.x}
                  y2={v.y}
                  stroke={stroke}
                  strokeWidth={active ? 4 : 3}
                  opacity={active ? 1 : 0.9}
                />
                <circle
                  cx={mx}
                  cy={my}
                  r={11}
                  fill={active ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.25)"}
                  stroke="rgba(255,255,255,0.18)"
                />
                <text
                  x={mx}
                  y={my + 4}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="700"
                  fill="rgba(255,255,255,0.9)"
                >
                  {i + 1}
                </text>
              </g>
            );
          })}

          {/* 頂点 */}
          {vertices.map((v) => (
            <g
              key={v.id}
              onClick={(e) => {
                e.stopPropagation();
                onVertexClick(v.id);
              }}
              onContextMenu={(e) => {
                // 頂点上での右クリックメニューも抑止（移動操作の邪魔になるため）
                e.preventDefault();
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                // 頂点移動は右クリック（button: 2=secondary）でのみ開始
                if (e.button !== 2) return;
                e.preventDefault();
                const svgEl = e.currentTarget.ownerSVGElement;
                if (!svgEl) return;
                const p = clientToSvgPoint(e.clientX, e.clientY, svgEl);
                setDraggingId(v.id);
                setDragPointerId(e.pointerId);
                setDragStart({ vx: v.x, vy: v.y, px: p.x, py: p.y });
                // 右クリックは click を発火しないため、suppressNextClick は不要
                try {
                  svgEl.setPointerCapture(e.pointerId);
                } catch {
                  // ignore
                }
              }}
              style={{ cursor: "pointer" }}
            >
              <circle
                cx={v.x}
                cy={v.y}
                r={18}
                fill="rgba(255,255,255,0.9)"
                stroke={edgeStart === v.id ? "#ffd166" : "rgba(0,0,0,0.85)"}
                strokeWidth={edgeStart === v.id ? 4 : 2}
              />
              <text
                x={v.x}
                y={v.y + 5}
                textAnchor="middle"
                fontSize="14"
                fontWeight="800"
                fill="rgba(0,0,0,0.85)"
              >
                {v.id}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* 右：観測パネル */}
      <div
        style={{
          flex: "1 1 360px",
          minWidth: 360,
          maxWidth: 520,
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.16)",
          background: "rgba(255,255,255,0.03)",
          padding: 14,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h3 style={{ margin: "2px 0 8px", fontSize: 16 }}>リアルタイム観測</h3>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>
            頂点 {n} / 辺 {edges.length}
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, marginBottom: 6 }}>
            適用ステップ: {step} / {edges.length}
          </div>
          <input
            type="range"
            min={0}
            max={edges.length}
            value={step}
            onChange={(e) => {
              setStep(Number(e.target.value));
              setNotice(null);
            }}
            style={{ width: "100%" }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={() => setStep(0)}>0本</button>
            <button onClick={() => setStep(edges.length)}>全部</button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div
            style={{
              padding: 10,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(0,0,0,0.18)",
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.85 }}>置換（1..n →）</div>
            <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
              {n === 0 ? "-" : perm.slice(1).join("  ")}
            </div>
          </div>
          <div
            style={{
              padding: 10,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(0,0,0,0.18)",
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.85 }}>転倒数 / 連結成分</div>
            <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
              {n === 0 ? "-" : `${invCount} / ${comps}`}
            </div>
          </div>
          <div
            style={{
              padding: 10,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(0,0,0,0.18)",
              gridColumn: "1 / -1",
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.85 }}>f_T（サイクル表記）</div>
            <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
              {fTCycles.length === 0
                ? "( )"
                : fTCycles.map((c) => `(${c.join(" ")})`).join(" ")}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 12, opacity: 0.85 }}>サイクル表記</div>
          <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
            {cycles.length === 0 ? "( )" : cycles.map((c) => `(${c.join(" ")})`).join(" ")}
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <h4 style={{ margin: "6px 0 8px", fontSize: 14 }}>辺の順序（並べ替え可）</h4>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 6 }}>
              色: 緑=非転倒 / 赤=転倒 / 灰=未適用
            </div>
          </div>
          <ol style={{ margin: 0, paddingLeft: 18 }}>
            {edges.map((e, i) => {
              const active = i < step;
              const isInv = active ? edgeIsInversion(perm, e) : false;
              return (
                <li
                  key={e.id}
                  style={{
                    marginBottom: 8,
                    paddingBottom: 8,
                    borderBottom: "1px solid rgba(255,255,255,0.10)",
                  }}
                >
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    {/* 左側は固定幅にして、右のボタン位置が行ごとにズレないようにする */}
                    <div
                      style={{
                        flex: "0 0 180px",
                        width: 180,
                        display: "flex",
                        gap: 8,
                        alignItems: "baseline",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                          fontWeight: 800,
                          textDecoration: "underline",
                          textUnderlineOffset: 3,
                        }}
                      >
                        ({e.u}, {e.v})
                      </span>
                      <span
                        style={{
                          opacity: 0.9,
                          display: "inline-block",
                          minWidth: 70, // 「→ 転倒」有無でボタン位置がズレないように余白を確保
                        }}
                      >
                        {active ? (isInv ? "→ 転倒" : "") : "（未適用）"}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <button onClick={() => moveEdge(i, -1)} disabled={i === 0}>
                        ↑
                      </button>
                      <button
                        onClick={() => moveEdge(i, 1)}
                        disabled={i === edges.length - 1}
                      >
                        ↓
                      </button>
                      <button onClick={() => deleteEdge(i)}>削除</button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
