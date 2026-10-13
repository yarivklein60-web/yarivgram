// Demo songs are synthesized in the browser, so the app ships with playable,
// copyright-free music and no audio files in the repo.
const SAMPLE_RATE = 22050;
const SECONDS = 48;

const A = 57, C = 48, D = 50, E = 52, F = 53, G = 55;
const min = (r) => [r, r + 3, r + 7];
const maj = (r) => [r, r + 4, r + 7];

export const DEMOS = [
  { id: 'demo-boardwalk', title: 'שקיעה בטיילת', artist: 'הלהקה המדומה', album: 'קיץ דיגיטלי', bpm: 96, prog: [min(A), maj(F), maj(C), maj(G)], pad: 'sawtooth', lead: 'triangle', drums: 'half' },
  { id: 'demo-nightdrive', title: 'נסיעה לילית', artist: 'סינתי־גל', album: 'אורות העיר', bpm: 118, prog: [min(D), maj(46), maj(F), maj(C)], pad: 'sawtooth', lead: 'square', drums: 'four' },
  { id: 'demo-galil', title: 'בוקר בגליל', artist: 'הלהקה המדומה', album: 'קיץ דיגיטלי', bpm: 84, prog: [maj(G), min(E), maj(C), maj(D)], pad: 'triangle', lead: 'sine', drums: 'half' },
  { id: 'demo-pulse', title: 'דופק', artist: 'מכונת קצב', album: 'מכונת קצב', bpm: 126, prog: [min(E), min(E), maj(C), maj(D)], pad: 'square', lead: 'sawtooth', drums: 'four' },
  { id: 'demo-rain', title: 'גשם ראשון', artist: 'סינתי־גל', album: 'אורות העיר', bpm: 72, prog: [maj(F), min(A), min(D), maj(C)], pad: 'triangle', lead: 'triangle', drums: 'none' },
  { id: 'demo-onward', title: 'קדימה', artist: 'מכונת קצב', album: 'מכונת קצב', bpm: 110, prog: [maj(C), maj(G), min(A), maj(F)], pad: 'sawtooth', lead: 'square', drums: 'four' },
];

export const DEMO_DURATION = SECONDS;

const mtof = (m) => 440 * 2 ** ((m - 69) / 12);

function envGain(ctx, out, t, attack, peak, release, length) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(peak, t + attack);
  g.gain.setValueAtTime(peak, t + Math.max(attack, length - release));
  g.gain.linearRampToValueAtTime(0.0001, t + length);
  g.connect(out);
  return g;
}

function pad(ctx, out, freq, t, len, type) {
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(700, t);
  filter.frequency.linearRampToValueAtTime(1400, t + len / 2);
  filter.frequency.linearRampToValueAtTime(700, t + len);
  filter.connect(envGain(ctx, out, t, 0.25, 0.045, 0.3, len));
  for (const detune of [-7, 7]) {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;
    osc.connect(filter);
    osc.start(t);
    osc.stop(t + len);
  }
}

function note(ctx, out, freq, t, len, type, peak) {
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(envGain(ctx, out, t, 0.01, peak, len * 0.6, len));
  osc.start(t);
  osc.stop(t + len);
}

function kick(ctx, out, t) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.frequency.setValueAtTime(130, t);
  osc.frequency.exponentialRampToValueAtTime(40, t + 0.12);
  g.gain.setValueAtTime(0.7, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  osc.connect(g).connect(out);
  osc.start(t);
  osc.stop(t + 0.31);
}

function hat(ctx, out, noise, t, peak = 0.06) {
  const src = ctx.createBufferSource();
  src.buffer = noise;
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 6000;
  const g = ctx.createGain();
  g.gain.setValueAtTime(peak, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  src.connect(hp).connect(g).connect(out);
  src.start(t);
  src.stop(t + 0.06);
}

function makeNoise(ctx) {
  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

function encodeWav(buffer) {
  const samples = buffer.getChannelData(0);
  const view = new DataView(new ArrayBuffer(44 + samples.length * 2));
  const str = (o, s) => [...s].forEach((c, i) => view.setUint8(o + i, c.charCodeAt(0)));
  str(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  str(8, 'WAVE');
  str(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  str(36, 'data');
  view.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([view], { type: 'audio/wav' });
}

export async function renderDemo(demo) {
  const ctx = new OfflineAudioContext(1, SAMPLE_RATE * SECONDS, SAMPLE_RATE);
  const comp = ctx.createDynamicsCompressor();
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.9, 0);
  master.gain.setValueAtTime(0.9, SECONDS - 4);
  master.gain.linearRampToValueAtTime(0, SECONDS);
  master.connect(comp).connect(ctx.destination);

  const noise = makeNoise(ctx);
  const beat = 60 / demo.bpm;
  const bar = beat * 4;
  const bars = Math.ceil(SECONDS / bar);

  for (let b = 0; b < bars; b++) {
    const t0 = b * bar;
    const chord = demo.prog[b % demo.prog.length];
    chord.forEach((n) => pad(ctx, master, mtof(n), t0, bar, demo.pad));

    for (let i = 0; i < 4; i++) {
      note(ctx, master, mtof(chord[0] - 12), t0 + i * beat, beat * 0.9, 'triangle', 0.22);
    }

    if (demo.drums !== 'none' && b >= 2) {
      for (let i = 0; i < 4; i++) {
        if (demo.drums === 'four' || i % 2 === 0) kick(ctx, master, t0 + i * beat);
        hat(ctx, master, noise, t0 + i * beat + beat / 2);
        if (demo.drums === 'four') hat(ctx, master, noise, t0 + i * beat + beat / 4, 0.03);
      }
    }

    if (b >= 4) {
      for (let i = 0; i < 8; i++) {
        const n = chord[(i * 2 + b) % 3] + 12 + (i % 4 === 3 ? 12 : 0);
        note(ctx, master, mtof(n), t0 + (i * beat) / 2, (beat / 2) * 0.85, demo.lead, 0.05);
      }
    }
  }

  return encodeWav(await ctx.startRendering());
}
