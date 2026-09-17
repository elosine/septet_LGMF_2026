// tools/curve_eval.js — the composer app's wave-curve evaluation, ported (composer.html computeYAtT / computeSegY /
// getYAtPos / getYAtTime, read 2026-09-05) so that scripts read a drawn curve exactly as the score draws it.
// y is the app's 0–10; pos is 0–1 along the curve; segments: model power | sigmoid | exponential | logarithmic |
// bezier (default) | ctrl, with slope; nodes: { pos, y, smooth } — smooth rounds the join (a Hermite blend).
'use strict';
const clamp01 = x => Math.max(0, Math.min(1, x));
function quad(cx, cy, y1, y2, t) {
  const a = 1 - 2 * cx, b = 2 * cx, c = -t; let bT;
  if (Math.abs(a) < 0.0001) bT = t;
  else { const d = b * b - 4 * a * c; if (d < 0) bT = t; else { const s = Math.sqrt(d), t1 = (-b + s) / (2 * a), t2 = (-b - s) / (2 * a); bT = clamp01((t1 >= 0 && t1 <= 1) ? t1 : t2); } }
  const o = 1 - bT; return o * o * y1 + 2 * o * bT * cy + bT * bT * y2;
}
function computeYAtT(model, slope, y1, y2, t) {
  t = clamp01(t); slope = slope || 0;
  switch (model) {
    case 'power': return y1 + (y2 - y1) * Math.pow(t, Math.pow(4, slope));
    case 'sigmoid': { const k = slope * 4; if (Math.abs(k) < 0.01) return y1 + (y2 - y1) * t;
      const f = x => 1 / (1 + Math.exp(-k * (x - 0.5))); return y1 + (y2 - y1) * ((f(t) - f(0)) / (f(1) - f(0))); }
    case 'exponential': { const k = slope * 4; if (Math.abs(k) < 0.01) return y1 + (y2 - y1) * t; return y1 + (y2 - y1) * ((Math.exp(k * t) - 1) / (Math.exp(k) - 1)); }
    case 'logarithmic': { const a = Math.abs(slope) * 5; let s; if (a < 0.01) s = t; else if (slope < 0) s = Math.tanh(a * t) / Math.tanh(a); else s = 1 - Math.tanh(a * (1 - t)) / Math.tanh(a); return y1 + (y2 - y1) * s; }
    default: { const cy = slope >= 0 ? y1 + (y2 - y1) * (1 - Math.abs(slope)) * 0.5 : y2 - (y2 - y1) * (1 - Math.abs(slope)) * 0.5;
      return quad(0.5 + Math.max(-1, Math.min(1, slope)) * 0.49, cy, y1, y2, t); }
  }
}
function segY(seg, y1, y2, t) {   // y1, y2 normalized 0–1
  if (seg && seg.model === 'ctrl') { const cx = Math.max(0.02, Math.min(0.98, seg.cx != null ? seg.cx : 0.5)); const cy = Math.max(-0.4, Math.min(1.4, seg.cy != null ? seg.cy : (y1 + y2) / 2)); return clamp01(quad(cx, cy, y1, y2, t)); }
  return computeYAtT(seg ? (seg.model || 'bezier') : 'bezier', seg ? (seg.slope || 0) : 0, y1, y2, t);
}
function getYAtPos(wc, pos) {   // returns 0–10, with the node smoothing the score draws
  const nodes = wc.nodes, segments = wc.segments || []; if (!nodes || nodes.length < 2) return 0; pos = clamp01(pos);
  const Y = (seg, a, b, t) => segY(seg, a.y / 10, b.y / 10, t) * 10;
  for (let i = 1; i < nodes.length - 1; i++) {
    const s = nodes[i].smooth ?? 0; if (s <= 0) continue;
    const L = nodes[i].pos - nodes[i - 1].pos, R = nodes[i + 1].pos - nodes[i].pos, radius = s * Math.min(L, R) * 0.5; if (radius <= 0) continue;
    const lb = nodes[i].pos - radius, rb = nodes[i].pos + radius; if (pos < lb || pos > rb) continue;
    const zw = rb - lb; if (zw <= 0) continue; const u = (pos - lb) / zw;
    const lSeg = segments[i - 1] || { model: 'bezier', slope: 0 }, rSeg = segments[i] || { model: 'bezier', slope: 0 };
    const lT = L > 0 ? Math.min(1, (lb - nodes[i - 1].pos) / L) : 0, rT = R > 0 ? Math.min(1, (rb - nodes[i].pos) / R) : 0;
    const yL = Y(lSeg, nodes[i - 1], nodes[i], lT), yR = Y(rSeg, nodes[i], nodes[i + 1], rT), eps = Math.max(radius * 0.01, 1e-6);
    const yLp = Y(lSeg, nodes[i - 1], nodes[i], L > 0 ? Math.min(1, (lb + eps - nodes[i - 1].pos) / L) : 0), slopeL = (yLp - yL) / eps;
    const yRm = Y(rSeg, nodes[i], nodes[i + 1], R > 0 ? Math.max(0, (rb - eps - nodes[i].pos) / R) : 0), slopeR = (yR - yRm) / eps;
    const m0 = slopeL * zw, m1 = slopeR * zw, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * yL + (u3 - 2 * u2 + u) * m0 + (-2 * u3 + 3 * u2) * yR + (u3 - u2) * m1;
  }
  for (let i = 0; i < nodes.length - 1; i++) if (pos >= nodes[i].pos && pos <= nodes[i + 1].pos) {
    const len = nodes[i + 1].pos - nodes[i].pos; return Y(segments[i] || { model: 'bezier', slope: 0 }, nodes[i], nodes[i + 1], len > 0 ? (pos - nodes[i].pos) / len : 0); }
  return nodes[nodes.length - 1].y;
}
function getYAtTime(wc, sec) { const d = wc.endSeconds - wc.startSeconds; if (!wc.nodes || wc.nodes.length < 2) return 0; if (d <= 0) return wc.nodes[0].y; return getYAtPos(wc, clamp01((sec - wc.startSeconds) / d)); }
module.exports = { computeYAtT, segY, getYAtPos, getYAtTime };
