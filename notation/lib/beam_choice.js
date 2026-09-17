// beam_choice.js — [PLAN 2d.2, the septet — 2026-09-11] A BEAM AS DATA: the per-note engraving devices that draw one beam over
// a set of notes, and the sidecar's beam choices turned into those devices on top of a freshly extracted IR.
//
// ONE code path for a beam. The device rules were notate_section.js --beam's (day 24, the composer's mixed pair); they live here
// now and the tool calls them, so a beam made on the command line and a beam chosen in the app are drawn by the same numbers
// (registry engraving.layout.figures.beam). (2026-09-10's lesson: every fault that day was a rule wired into one code path and
// not its sibling.)
//
// The sidecar (notation/choices/<score>.choices.json — IR_SCHEMA_v0 §6b) is a data layer only: its choices become ordinary §6
// `engraving` overlays appended IN MEMORY to the IR the app loaded, never written into the IR file. Where no choice exists the
// engine's own result stands. layout.js keeps one engraving value per note, last one wins, so a choice appended after the IR's
// own overlays is what that note draws.
// Pure, dual-load, no state.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BeamChoice = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // HOW MANY BEAMS a member carries is derived from its technique rather than asked for: a SHORT fixed one-shot (staccato) is
  // the "sixteenth" and takes two levels; anything that rings (fortepiano, cuivre, ord) is the long note and takes the primary
  // beam only. The second level then has no neighbour to connect to and layout draws it as a STUB on the short note.
  const RINGS_DEFAULT = ['fortepiano', 'cuivre', 'ord'];

  // members: the IR events of ONE beam, in onset order · FIG: registry engraving.layout.figures.beam · key: the beamGroup name.
  // → { rings, ringIdx, gcRule, gcIdx, devices: [ { event, device } ] }
  function beamDevices(members, FIG, key) {
    const F = FIG || {};
    const rings = new Set(F.ringTechniques || RINGS_DEFAULT);
    // WHO CARRIES THE GC (figures.beam.gc): 'ring' = the first member that rings (the long note — composer, day 24: "let's
    // shift the GC to the half note"), 'first' = member 1, false = none. A group with no ringing member falls back to the
    // first, so the cue never vanishes.
    const ringIdx = members.findIndex(e => rings.has(e.technique));
    const gcRule = F.gc != null ? F.gc : 'first';
    const gcIdx = gcRule === 'ring' ? (ringIdx >= 0 ? ringIdx : 0) : gcRule === 'first' ? 0 : -1;
    const devices = members.map((e, i) => {
      const firstOnly = v => v === 'first' ? i === 0 : !!v;
      const dev = {
        nhStem: 'beam', beamGroup: key,
        noteBeams: rings.has(e.technique) ? 1 : 2,
        beamPos: i, noteUnits: 1,
        // the standards (registry engraving.layout.figures.beam): no go lines, GC on the ringing note, every head centred on
        // its go time, dynamics together above the beam.
        // THE GO LINE MARKS DISPLACEMENT (D58): in a beam only the GC-bearing member is displaced — pushed clear of the impact
        // disc — so only it carries a go line. Every other head sits with its LEFT EDGE on its own go time (D59) and needs none.
        goLine: F.goLine === 'gc' ? (i === gcIdx) : firstOnly(F.goLine != null ? F.goLine : false),
        gc: i === gcIdx,
        dynAboveBeam: F.dynAboveBeam != null ? !!F.dynAboveBeam : true,
      };
      // 'before' is the layout default (the unit hangs ahead of the go time to clear the disc), so it is expressed by NOT
      // setting an anchor.
      const anch = i === gcIdx ? (F.gcAnchor || 'before') : (F.anchor || (i === 0 ? F.firstAnchor : null));
      if (anch && anch !== 'before') dev.nhAnchor = anch;
      return { event: e.id, device: dev };
    });
    return { rings, ringIdx, gcRule, gcIdx, devices };
  }

  // The sidecar's choices on top of a fresh IR → { overlays, report }. A choice names NOTE ids (docs/NOTATION_IDENTITY.md); each
  // is looked up as ev- + id. All present → 'applied' · some missing → 'partial', drawn on the notes that remain · none left →
  // 'orphaned' · notes in two parts → 'refused', with the reason. Nothing is dropped: the report carries every choice, whatever
  // became of it (2d.4 lists it).
  function applyChoices(choicesDoc, ir, FIG) {
    const evById = new Map(((ir && ir.events) || []).map(e => [e.id, e]));
    const partOf = new Map();
    for (const c of (ir && ir.chunks) || []) for (const id of c.events || []) partOf.set(id, c.part);
    const overlays = [], report = [];
    for (const ch of (choicesDoc && choicesDoc.choices) || []) {
      const rec = { id: ch.id, kind: ch.kind, drawn: false };
      report.push(rec);
      // presence is counted for EVERY choice that names notes, whatever its kind — the validator checks the flag the same way
      const ids = (ch.target && ch.target.notes) || [];
      const present = ids.filter(id => evById.has('ev-' + id));
      rec.notes = ids.length; rec.present = present.length;
      rec.missing = ids.filter(id => !evById.has('ev-' + id));
      const members = present.map(id => evById.get('ev-' + id)).sort((a, b) => a.onset - b.onset || (a.id < b.id ? -1 : 1));
      rec.t = members.length ? members[0].onset : null;
      rec.surviving = members.map(e => e.id);                           // the IR ids still there — 2d.4.5's "go there" lights them
      const parts = new Set(members.map(e => partOf.get(e.id)));
      rec.part = parts.size === 1 ? [...parts][0] : null;
      if (ch.kind !== 'beam') { rec.status = 'unknown-kind'; continue; }
      rec.status = present.length === 0 ? 'orphaned' : present.length < ids.length ? 'partial' : 'applied';
      if (members.length < 2) continue;                                  // one note is not a beam; the choice stays, listed
      if (parts.size > 1) { rec.status = 'refused'; rec.why = 'a beam joins notes of one part — these are in parts ' + [...parts].join(', '); continue; }
      // the beamGroup is the CHOICE's own name — never a chunk's, which renames when its earliest note moves (decision B)
      for (const d of beamDevices(members, FIG, 'bmc-' + ch.id).devices)
        overlays.push({ id: 'ov-choice-' + ch.id + '-' + d.event, kind: 'engraving', target: { event: d.event },
          value: { device: d.device }, provenance: 'authored' });
      rec.drawn = true;
    }
    return { overlays, report };
  }

  // [PLAN 2d.4.1] THE MAINTENANCE PASS — the report of a load → the file's `orphaned` flags. A choice none of whose notes is left
  // is flagged; a flagged choice whose notes are back has the flag cleared. Nothing is ever removed. Run only after R, whose IR is
  // the whole score — on a window IR, notes outside the window would read as lost. Mutates choicesDoc; → the ids it changed.
  function resolveFlags(choicesDoc, report) {
    const byId = new Map((report || []).map(r => [r.id, r]));
    const changed = [];
    for (const ch of (choicesDoc && choicesDoc.choices) || []) {
      const r = byId.get(ch.id);
      if (!r || typeof r.present !== 'number' || !r.notes) continue;     // a span target has no notes to lose
      const flag = r.present === 0;
      if (ch.orphaned !== flag) { ch.orphaned = flag; changed.push(ch.id); }
    }
    return changed;
  }

  // [PLAN 2d.4.3] the bottom bar's count — "2 orphans · 1 partial"; '' when every choice applied (the count is then absent).
  function reportCounts(report) {
    const n = s => (report || []).filter(r => r.status === s).length;
    const bits = [];
    const o = n('orphaned'), p = n('partial'), f = n('refused'), u = n('unknown-kind');
    if (o) bits.push(o + (o === 1 ? ' orphan' : ' orphans'));
    if (p) bits.push(p + ' partial');
    if (f) bits.push(f + ' refused');
    if (u) bits.push(u + ' unknown kind');
    return bits.join(' · ');
  }

  // [PLAN 2d.6.2] G — the selection → a beam choice, or the beam removed. Pure: returns a NEW doc (the caller saves it).
  //   noteIds: the composer's note ids (wc-N) selected, in onset order · partOf: wc-N → part (from the IR on screen).
  //   · fewer than two notes, or notes in two parts → refused, with the reason, nothing written
  //   · exactly the notes of an existing beam choice → that choice removed (G again undoes G)
  //   · otherwise a new beam `c-<nextId>`; any older beam choice holding some of these notes gives them up — a note is in one beam —
  //     and one left with fewer than two notes is removed (it beams nothing). This is HIS act, not the machine's: the resolve pass
  //     (resolveFlags) still never removes anything. "Beam four, then 2+2" = G on four, then G on the first two.
  //   nextId only grows (§6b, amendment 7): a discarded or removed id never returns.
  function toggleBeam(choicesDoc, score, noteIds, partOf) {
    const doc = choicesDoc ? JSON.parse(JSON.stringify(choicesDoc)) : { score, version: 1, nextId: 1, choices: [] };
    const ids = [...new Set(noteIds || [])];
    if (ids.length < 2) return { doc: choicesDoc, action: 'refused', why: 'select two or more notes of one part, then G' };
    const parts = [...new Set(ids.map(id => partOf(id)))];
    if (parts.length > 1) return { doc: choicesDoc, action: 'refused', why: 'a beam joins notes of one part — the selection is in parts ' + parts.join(', ') };
    const same = (a, b) => a.length === b.length && a.every(x => b.includes(x));
    const hit = doc.choices.find(c => c.kind === 'beam' && c.target && same(c.target.notes || [], ids));
    if (hit) { doc.choices = doc.choices.filter(c => c !== hit); return { doc, action: 'removed', id: hit.id, dropped: [] }; }
    const maxN = doc.choices.reduce((m, c) => { const r = /^c-(\d+)$/.exec(c.id || ''); return r ? Math.max(m, +r[1]) : m; }, 0);
    const n = Math.max(doc.nextId || 1, maxN + 1);
    const dropped = [], trimmed = [];
    doc.choices = doc.choices.filter(c => {
      if (c.kind !== 'beam' || !c.target || !Array.isArray(c.target.notes)) return true;
      const keep = c.target.notes.filter(x => !ids.includes(x));
      if (keep.length === c.target.notes.length) return true;
      if (keep.length < 2) { dropped.push(c.id); return false; }
      c.target.notes = keep; trimmed.push(c.id); return true;
    });
    const id = 'c-' + n;
    doc.choices.push({ id, kind: 'beam', target: { notes: ids }, value: {}, orphaned: false, note: '' });
    doc.nextId = n + 1;
    return { doc, action: 'added', id, trimmed, dropped };
  }

  return { beamDevices, applyChoices, resolveFlags, reportCounts, toggleBeam, RINGS_DEFAULT };
}));
