const BEAT = 0.375;
const HITS = [1, 1.06, 0.9];
const STEPS = 7;
const TAP = 0.2;
const LEAD = 0.05;
const SCALE = 4;
const W = 40;
const H = 32;
const PALETTE: Record<string, string> = { o: "#3a2418", b: "#b0763c", d: "#7d4c25", l: "#e8b06a", f: "#ffd7a6", c: "#ff93a8", g: "#ffe39a", m: "#7a2a3a", p: "#a98fff", u: "#c4b5ff" };
const PARTS = "3.8o/.2o8l2o/o3l6b3lo/2o10l2o/od10obo/od11bo/od3b6o2bo/od2bo6fobo/odbo8f2o/odbo3fo2fof2o/odbo3fo2fof2o/odbofc5fc2o/odbo3fo2mof2o/odbo4f2o2f2o/od2bo6fobo/od3b6o2bo/od11bo/od7bd3bo/od7b2d2bo/od11bo/od2bd8bo/o2d10bo/.12o|6.3d2b/5.2d3.2b/4.2d5.2b/3.2d7.2b/2.ld9.2b/.2l11.2b/.l12.b2g/14.4g|/7.2d.2b/5.3d2.2b/3.l2d5.2b/3.2l6.2b/10.2b/10.b2g/10.4g|8.2b2d/8.2b.2d/7.2b3.2d/7.2b2.2d/6.2b2.ld/6.2b2.2l/5.b2g/5.4g|6.3b2d/4.3b3.3d/3.2b7.3d/2.2b10.2d/.gb11.2d/.2g11.d2l/2.g11.4l/|6.3b2d/5.2b3.2d/4.2b5.2d/3.2b7.2d/2.gb9.2d/.2g11.2d/.g12.d2l/14.4l|/7.2b.2d/5.3b2.2d/3.g2b5.2d/3.2g6.2d/10.2d/10.d2l/10.4l|8.2d2b/8.2d.2b/7.2d3.2b/7.2d2.2b/6.2d2.gb/6.2d2.2g/5.d2l/5.4l|6.3d2b/4.3d3.3b/3.2d7.3b/2.2d10.2b/.ld11.2b/.2l11.b2g/2.l11.4g/|3.2g/2.3g/2.3g/2.3g/2.3g/2.3g/2.3g/3.2g/3.g/3.g/3.g/3.p/3.p/3.2f/3.2f/2l.2l/5l/.3l|8.2g/7.3g/7.3g/7.3g/6.3g/6.3g/6.2g/6.g/6.g/5.g/5.p/5.p/5.2f/5.2f/2l2.2l/5l/.3l|13.2g/12.3g/12.3g/11.3g/11.3g/10.3g/10.g/10.g/9.g/9.p/8.p/7.2f/4.3l2f/6l/4l|15.2g/14.3g/14.3g/13.3g/13.3g/12.3g/11.2g/11.g/10.p/9.p/8.2f/6.2l2f/4.4l/2.4l/4l/2l|2l5.2f/3l3.l2f/.6l/2.4l|2l/3l/.3l2.2f/2.4l2f/3.3l|.2l/.2l/2l/2l/.2l/2.2f/2.2f|5.2l/4.3l/3.3l/2.3l/2f2l/2f|2f/2f4.2l/.2l2.3l/2.5l/3.2l|.u/3u|.2u/4u/.2u|u2.u//.u".split("|");
const CELS = "17o092d9i9l3|i8u27o093e9j9l4|j5s37o092f8ial4|k1q47o091g4hbl4|57o092h3hcl4|i8u67o093g4jbl6|j5s77o092f8ial4|k1q87o091e9h9l2".split("|");

function sheet() {
  let out = "";
  CELS.forEach((cel, frame) => {
    for (let i = 0; i < cel.length; i += 3) {
      const left = frame * W + parseInt(cel[i + 1], 36);
      const top = parseInt(cel[i + 2], 36);
      PARTS[parseInt(cel[i], 36)].split("/").forEach((row, y) => {
        let x = 0;
        for (const [, count, color] of row.matchAll(/(\d*)(\D)/g)) {
          const width = Number(count) || 1;
          if (color !== ".") out += `<rect x="${left + x}" y="${top + y}" width="${width}" height="1" fill="${PALETTE[color]}"/>`;
          x += width;
        }
      });
    }
  });
  const width = CELS.length * W;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${H}" width="${width * SCALE}" height="${H * SCALE}" shape-rendering="crispEdges" style="display:block">${out}</svg>`;
}

function hit(ctx: AudioContext, at: number, pitch: number, out: AudioNode) {
  const body = ctx.createOscillator();
  const bodyGain = ctx.createGain();
  body.frequency.setValueAtTime(190 * pitch, at);
  body.frequency.exponentialRampToValueAtTime(88 * pitch, at + 0.14);
  bodyGain.gain.setValueAtTime(0.0001, at);
  bodyGain.gain.exponentialRampToValueAtTime(0.9, at + 0.004);
  bodyGain.gain.exponentialRampToValueAtTime(0.001, at + 0.38);
  body.connect(bodyGain).connect(out);
  body.start(at);
  body.stop(at + 0.4);

  const knock = ctx.createOscillator();
  const knockGain = ctx.createGain();
  knock.type = "triangle";
  knock.frequency.setValueAtTime(420 * pitch, at);
  knockGain.gain.setValueAtTime(0.0001, at);
  knockGain.gain.exponentialRampToValueAtTime(0.35, at + 0.003);
  knockGain.gain.exponentialRampToValueAtTime(0.001, at + 0.07);
  knock.connect(knockGain).connect(out);
  knock.start(at);
  knock.stop(at + 0.08);

  const length = Math.floor(ctx.sampleRate * 0.03);
  const noise = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  const click = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const clickGain = ctx.createGain();
  click.buffer = noise;
  filter.type = "bandpass";
  filter.frequency.value = 1900 * pitch;
  filter.Q.value = 5;
  clickGain.gain.setValueAtTime(0.5, at);
  clickGain.gain.exponentialRampToValueAtTime(0.001, at + 0.03);
  click.connect(filter).connect(clickGain).connect(out);
  click.start(at);
}

function drum(steps: number) {
  const Context = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Context) return;
  const ctx = new Context();
  void ctx.resume();
  const master = ctx.createGain();
  master.gain.value = 0.6;
  master.connect(ctx.destination);
  const taps = ctx.createGain();
  taps.gain.value = TAP;
  taps.connect(master);
  const start = ctx.currentTime + LEAD;
  HITS.forEach((pitch, i) => hit(ctx, start + i * BEAT, pitch, master));
  for (let i = 0; i < steps; i++) hit(ctx, start + (HITS.length + i) * BEAT, 1.5, taps);
  setTimeout(() => void ctx.close(), (HITS.length + steps + 2) * BEAT * 1000);
}

async function sprint() {
  const box = W * SCALE;
  const root = document.createElement("div");
  root.setAttribute("aria-hidden", "true");
  root.style.cssText = `position:fixed;left:0;bottom:0;z-index:60;pointer-events:none;width:${box}px;overflow:hidden;transform:translateX(-${box}px)`;
  root.innerHTML = sheet();
  document.body.append(root);
  const cycle = 2 * BEAT * 1000;
  root.firstElementChild!.animate([{ transform: "translateX(0)" }, { transform: "translateX(-100%)" }], { duration: cycle, iterations: Infinity, easing: `steps(${CELS.length})` });
  const hops = Math.ceil((window.innerWidth + box) / SCALE);
  const travel = root.animate([{ transform: `translateX(-${box}px)` }, { transform: `translateX(${hops * SCALE - box}px)` }], { duration: STEPS * BEAT * 1000, easing: `steps(${hops})`, fill: "forwards" });
  await travel.finished.catch(() => {});
  root.remove();
}

export async function run() {
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  try {
    drum(calm || !TAP ? 0 : STEPS);
  } catch {}
  if (calm) return;
  await new Promise((resolve) => setTimeout(resolve, (HITS.length * BEAT + LEAD) * 1000));
  if (!document.hidden) await sprint();
}
