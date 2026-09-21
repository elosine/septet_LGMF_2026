// dot_view.js — THE DOT VIEW (LGMF PLAN 1l.2, 2026-09-21; docs/PLAN.md § 1l.2 — "the dot view is built ONCE, here").
//
// Rhythm LINES as rows of DOTS spaced as they fall in time, a small TIMELINE above them, a CURSOR, and a click on the timeline that
// asks to play from there (the sequence drawer's clock and cursor, 1d.15, in this idiom). At the left of each row an optional GRID —
// who plays the line: the players across, a tick where a player plays it (Texture's who-plays, 1l.2; a placed box's, 1l.6).
//
// It only DRAWS and REPORTS: the caller owns the data and decides what a click means. The later steps add to it, never fork it —
// a SELECTION on the timeline (the workshop, 1l.4), a fixed scale that scrolls with the cursor (the continuous view, 1l.5), a click
// on a dot (the dots touched, 1l.6).
//
// A dot's state `s` is its look — each state its own (1l.6): ok · warn (too close on a merged player, LG-58) · hollow (no note to
// play) · muted · silent (the line has no player) · dropped (a crossfade took it, 1l.7).
//
// Canvas, not SVG: a long sequence is thousands of dots. Drawn on demand (no requestAnimationFrame — the verification pane never
// paints, journal §2), sized from the host's own width at every draw.

(function (root) {
'use strict';

const ROW_H = 14, HEAD_H = 18, R = 2.6, PAD = 6;
const COL = {
    ok: '#8fd6ab', warn: '#e0b062', hollow: '#8fd6ab', muted: '#4d4d55', silent: '#44444c', dropped: '#6a5a8a',
    grid: '#2c2c34', tick: '#555', text: '#8a8', cursor: '#e8cf9a', sel: 'rgba(127,196,232,0.18)', selEdge: '#7fc4e8', bg: '#18181c',
};
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function niceStep(span, px) {                 // a tick every 1 · 2 · 5 × 10^k seconds, ≥ ~48 px apart
    const want = span * 48 / Math.max(1, px);
    const p = Math.pow(10, Math.floor(Math.log10(Math.max(1e-6, want))));
    return [1, 2, 5, 10].map(k => k * p).find(s => s >= want) || 10 * p;
}

function create(host, opts) {
    opts = opts || {};
    const v = {
        host, rows: [], t0: 0, t1: 1, grid: null, cursor: null, sel: null, pxPerSec: opts.pxPerSec || null,
        onSeek: null, onDot: null, onToggle: null, onSpan: null,
    };
    host.innerHTML =
        '<div class="dvWrap" style="display:flex;align-items:flex-start;background:' + COL.bg + ';border:1px solid #333;border-radius:3px">' +
        '<div class="dvLeft" style="flex:0 0 auto;font:10px/1 system-ui,sans-serif;color:' + COL.text + '"></div>' +
        '<div class="dvRight" style="flex:1 1 auto;min-width:0;overflow-x:auto;overflow-y:hidden;position:relative">' +
        '<canvas class="dvCanvas" style="display:block;cursor:pointer"></canvas></div></div>';
    const left = host.querySelector('.dvLeft'), right = host.querySelector('.dvRight'), cv = host.querySelector('.dvCanvas');

    v.width = () => Math.max(120, right.clientWidth || host.clientWidth || 400);
    v.scale = () => v.pxPerSec || (v.width() - 2 * PAD) / Math.max(0.001, v.t1 - v.t0);
    v.xOf = t => PAD + (t - v.t0) * v.scale();
    v.tOf = x => v.t0 + (x - PAD) / v.scale();

    // data: { rows: [{ label, dots: [{ t, s }] }], t0, t1, grid: { heads: [..], on(row) → Set of columns, title(row, col) } }
    v.set = data => {
        v.rows = data.rows || []; v.t0 = data.t0 || 0; v.t1 = Math.max(v.t0 + 0.001, data.t1 != null ? data.t1 : 1);
        v.grid = data.grid || null;
        v.drawLeft(); v.draw();
    };
    v.drawLeft = () => {
        const g = v.grid;
        if (!g) { left.innerHTML = ''; left.style.display = 'none'; return; }
        left.style.display = '';
        const cell = 'display:inline-flex;align-items:center;justify-content:center;width:22px;height:' + ROW_H + 'px';
        let h = '<div style="height:' + HEAD_H + 'px;display:flex;align-items:flex-end;border-bottom:1px solid #333">' +
                '<span style="width:24px"></span>' + g.heads.map(x => '<span style="' + cell + ';height:' + HEAD_H + 'px;align-items:flex-end;padding-bottom:2px">' + esc(x) + '</span>').join('') + '</div>';
        v.rows.forEach((row, r) => {
            const on = g.on(r);
            h += '<div style="height:' + ROW_H + 'px;display:flex;align-items:center"><span style="width:24px;padding-left:3px;color:#9a9">' + esc(row.label) + '</span>' +
                 g.heads.map((x, c) => '<span style="' + cell + '"><input type="checkbox" data-r="' + r + '" data-c="' + c + '"' + (on.has(c) ? ' checked' : '') +
                 ' title="' + esc(g.title ? g.title(r, c) : x) + '" style="margin:0;width:11px;height:11px;cursor:pointer"></span>').join('') + '</div>';
        });
        left.innerHTML = h;
    };
    left.addEventListener('change', e => {
        const b = e.target.closest('input[data-r]'); if (!b || !v.onToggle) return;
        v.onToggle(+b.dataset.r, +b.dataset.c, b.checked);
    });

    v.draw = () => {
        const W = v.pxPerSec ? Math.max(v.width(), Math.ceil(2 * PAD + (v.t1 - v.t0) * v.pxPerSec)) : v.width();
        const H = HEAD_H + Math.max(1, v.rows.length) * ROW_H + 2, dpr = root.devicePixelRatio || 1;
        if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
            cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.width = W + 'px'; cv.style.height = H + 'px';
        }
        const x = cv.getContext('2d'); if (!x) return;
        x.setTransform(dpr, 0, 0, dpr, 0, 0);
        x.clearRect(0, 0, W, H);
        // the timeline
        const span = v.t1 - v.t0, step = niceStep(span, W - 2 * PAD);
        x.font = '9px system-ui,sans-serif'; x.textBaseline = 'top';
        x.strokeStyle = COL.grid; x.lineWidth = 1;
        x.beginPath(); x.moveTo(0, HEAD_H - 0.5); x.lineTo(W, HEAD_H - 0.5); x.stroke();
        for (let t = Math.ceil(v.t0 / step - 1e-9) * step; t <= v.t1 + 1e-9; t += step) {
            const px = Math.round(v.xOf(t)) + 0.5;
            x.strokeStyle = COL.tick; x.beginPath(); x.moveTo(px, HEAD_H - 5); x.lineTo(px, HEAD_H); x.stroke();
            x.strokeStyle = COL.grid; x.beginPath(); x.moveTo(px, HEAD_H); x.lineTo(px, H); x.stroke();
            x.fillStyle = COL.text; x.fillText((+t.toFixed(3)) + 's', px + 2, 2);
        }
        // the selection (1l.4 draws with it)
        if (v.sel && v.sel.b > v.sel.a) {
            const a = v.xOf(v.sel.a), b = v.xOf(v.sel.b);
            x.fillStyle = COL.sel; x.fillRect(a, 0, b - a, H);
            x.strokeStyle = COL.selEdge; x.beginPath(); x.moveTo(a + 0.5, 0); x.lineTo(a + 0.5, H); x.moveTo(b - 0.5, 0); x.lineTo(b - 0.5, H); x.stroke();
        }
        // the rows and their dots
        v.rows.forEach((row, r) => {
            const cy = HEAD_H + r * ROW_H + ROW_H / 2;
            x.strokeStyle = COL.grid; x.beginPath(); x.moveTo(0, HEAD_H + (r + 1) * ROW_H - 0.5); x.lineTo(W, HEAD_H + (r + 1) * ROW_H - 0.5); x.stroke();
            (row.dots || []).forEach(d => {
                const px = v.xOf(d.t), s = d.s || 'ok';
                x.beginPath(); x.arc(px, cy, R, 0, 2 * Math.PI);
                if (s === 'hollow') { x.strokeStyle = COL.hollow; x.lineWidth = 1; x.stroke(); }
                else { x.fillStyle = COL[s] || COL.ok; x.fill(); }
            });
        });
        // the cursor
        if (v.cursor != null && v.cursor >= v.t0 && v.cursor <= v.t1) {
            const px = Math.round(v.xOf(v.cursor)) + 0.5;
            x.strokeStyle = COL.cursor; x.lineWidth = 1.5; x.beginPath(); x.moveTo(px, 0); x.lineTo(px, H); x.stroke(); x.lineWidth = 1;
        }
    };
    // the cursor moves; with a fixed scale the view scrolls to keep it in sight (1l.5)
    v.setCursor = t => {
        v.cursor = t; v.draw();
        if (t != null && v.pxPerSec && right.scrollWidth > right.clientWidth) {
            const px = v.xOf(t);
            if (px < right.scrollLeft + 20 || px > right.scrollLeft + right.clientWidth - 40) right.scrollLeft = Math.max(0, px - right.clientWidth * 0.25);
        }
    };
    v.scrollTo = t => { right.scrollLeft = Math.max(0, v.xOf(t) - 20); };
    v.setSel = s => { v.sel = s; v.draw(); };

    // a click on the TIMELINE reports a time (play from there — or, in the workshop, a start or a stop); a DRAG across the rows reports a
    // span (the workshop's marquee, 1l.4 — nothing snaps: the span is where the pointer was); a plain click in a row reports the nearest dot (1l.6)
    const clampT = px => Math.max(v.t0, Math.min(v.t1, v.tOf(px)));
    cv.addEventListener('mousedown', e => {
        const r = cv.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
        if (py < HEAD_H) { if (v.onSeek) v.onSeek(clampT(px), e); return; }
        const row = Math.floor((py - HEAD_H) / ROW_H), x0 = px;
        let dragging = false;
        const move = ev => {
            const x = ev.clientX - cv.getBoundingClientRect().left;
            if (!dragging && Math.abs(x - x0) > 4 && v.onSpan) dragging = true;
            if (dragging) { const a = clampT(Math.min(x0, x)), b = clampT(Math.max(x0, x)); v.sel = { a, b }; v.draw(); }
        };
        const up = ev => {
            window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up);
            if (dragging) { const x = ev.clientX - cv.getBoundingClientRect().left; v.onSpan(clampT(Math.min(x0, x)), clampT(Math.max(x0, x)), ev); return; }
            if (!v.onDot || row < 0 || row >= v.rows.length) return;
            let best = -1, bd = 7;
            (v.rows[row].dots || []).forEach((d, i) => { const dd = Math.abs(v.xOf(d.t) - x0); if (dd < bd) { bd = dd; best = i; } });
            if (best >= 0) v.onDot(row, best, e);
        };
        window.addEventListener('mousemove', move); window.addEventListener('mouseup', up);
        e.preventDefault();
    });

    return v;
}

root.DotView = { create, COL, ROW_H, HEAD_H };
}(typeof self !== 'undefined' ? self : this));
