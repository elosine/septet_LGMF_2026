// transport.js — V2: THE CLOCK INTERFACE (D47 invariant 2).
// The ONLY module in the notation stratum allowed to read a time source
// (performance.now / audio.currentTime) — enforced by source scan in
// tools/test_animobj.js. Everything downstream (cursor, system turns,
// animated objects) consumes `t` in S1 SECONDS and never touches a clock.
// Implementations swap per realization: this one is LOCAL (audio-slaved
// when a Reaper render is attached, free-running otherwise); D45's future
// performance project implements the same interface over networked sync.
//
//   makeTransport(opts?) -> { now, play, pause, seek, attachAudio,
//                             detachAudio, isPlaying, setOffset }
//   · now()        current position, S1 seconds
//   · seek(t)      jump (works playing or paused)
//   · attachAudio(el, offset?)  slave the clock: S1 t = currentTime+offset
//   · opts.timebase {now()->seconds}  injectable for tests (fake time)
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.NotationTransport = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  function makeTransport(opts) {
    const o = opts || {};
    const tb = o.timebase || { now: () => performance.now() / 1000 };
    let audio = null;
    let offset = o.audioOffset || 0;   // S1 t = audio.currentTime + offset
    let playing = false;               // free-run state (audio keeps its own)
    let base = 0;                      // S1 seconds at last play/seek/pause
    let mark = 0;                      // timebase seconds at last play/seek
    // [LGMF 2e.2, §409] THE PRE-ROLL: with the audio attached, a position BEFORE the audio's start (the lead-in, t < offset) runs on the
    // free clock with the audio parked at 0 — and the audio starts when the clock crosses its start. { base, mark, playing } or null.
    let pre = null;
    const preT = () => pre.playing ? pre.base + (tb.now() - pre.mark) : pre.base;

    function now() {
      if (audio) {
        if (pre) {
          const tt = preT();
          if (tt < offset) return tt;
          const was = pre.playing;
          pre = null; audio.currentTime = tt - offset;   // the clock crossed the audio's start: the render takes over
          if (was) audio.play();
          return tt;
        }
        return audio.currentTime + offset;
      }
      return playing ? base + (tb.now() - mark) : base;
    }
    function play() {
      if (audio) {
        if (pre) { if (!pre.playing) { pre.mark = tb.now(); pre.playing = true; } return; }
        audio.play(); return;
      }
      if (!playing) { mark = tb.now(); playing = true; }
    }
    function pause() {
      if (audio) {
        if (pre) { if (pre.playing) { pre.base = preT(); pre.playing = false; } return; }
        audio.pause(); return;
      }
      if (playing) { base = base + (tb.now() - mark); playing = false; }
    }
    function seek(t) {
      if (audio) {
        const was = isPlaying();
        if (t < offset) { audio.pause(); audio.currentTime = 0; pre = { base: t, mark: tb.now(), playing: was }; return; }
        if (pre) { pre = null; audio.currentTime = t - offset; if (was) audio.play(); return; }
        audio.currentTime = Math.max(0, t - offset); return;
      }
      base = t; mark = tb.now();
    }
    function attachAudio(el, off) { audio = el; pre = null; if (off !== undefined) offset = off; }
    function detachAudio() { const t = now(); audio = null; pre = null; base = t; mark = tb.now(); playing = false; }
    function isPlaying() { return audio ? (pre ? pre.playing : !audio.paused) : playing; }
    function setOffset(v) { offset = v; }

    return { now, play, pause, seek, attachAudio, detachAudio, isPlaying, setOffset };
  }

  return { makeTransport };
});
