const BEAT = 0.375;
const HITS = [1, 1.06, 0.9];
const MARCH_MS = 3000;
const INK = "#2a1740";

const FIGURE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 112 150" width="112" height="150" style="display:block;overflow:visible">
<ellipse cx="50" cy="146" rx="28" ry="4" fill="#000" opacity=".25"/>
<g id="leg-l" style="transform-origin:40px 108px"><rect x="35" y="108" width="10" height="30" rx="4.5" fill="#7a4a22" stroke="${INK}" stroke-width="2.5"/><ellipse cx="38" cy="139" rx="10" ry="5.5" fill="#4a2a12" stroke="${INK}" stroke-width="2.5"/></g>
<g id="leg-r" style="transform-origin:60px 108px"><rect x="55" y="108" width="10" height="30" rx="4.5" fill="#7a4a22" stroke="${INK}" stroke-width="2.5"/><ellipse cx="58" cy="139" rx="10" ry="5.5" fill="#4a2a12" stroke="${INK}" stroke-width="2.5"/></g>
<path d="M25 80Q11 86 11 99" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
<path d="M25 80Q11 86 11 99" fill="none" stroke="#9a6030" stroke-width="5.5" stroke-linecap="round"/>
<circle cx="11" cy="100" r="5.5" fill="#d9a566" stroke="${INK}" stroke-width="2.5"/>
<rect x="24" y="14" width="52" height="100" rx="14" fill="#b0763c" stroke="${INK}" stroke-width="3"/>
<ellipse cx="50" cy="17" rx="26" ry="8" fill="#d9a566" stroke="${INK}" stroke-width="3"/>
<ellipse cx="50" cy="17" rx="17" ry="4.8" fill="none" stroke="#a9733a" stroke-width="1.8"/>
<ellipse cx="50" cy="17" rx="8" ry="2.2" fill="none" stroke="#a9733a" stroke-width="1.6"/>
<path d="M33 40q-3 20 0 40M67 52q3 18 0 36M44 94q2 8 0 16" fill="none" stroke="#8a5a2c" stroke-width="2.2" stroke-linecap="round"/>
<ellipse cx="65" cy="101" rx="4" ry="6" fill="#8a5a2c"/>
<circle cx="50" cy="56" r="21" fill="#ecc08a" stroke="${INK}" stroke-width="2.8"/>
<ellipse cx="42.5" cy="52" rx="3.3" ry="4.4" fill="${INK}"/><ellipse cx="57.5" cy="52" rx="3.3" ry="4.4" fill="${INK}"/>
<circle cx="43.6" cy="50.3" r="1.2" fill="#fff"/><circle cx="58.6" cy="50.3" r="1.2" fill="#fff"/>
<path d="M37 45l8 2M63 45l-8 2" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>
<circle cx="37.5" cy="61" r="3.2" fill="#e48f7a" opacity=".65"/><circle cx="62.5" cy="61" r="3.2" fill="#e48f7a" opacity=".65"/>
<path d="M42.5 63Q50 73 57.5 63Z" fill="#7a2a3a" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
<g id="arm" style="transform-origin:76px 80px">
<path d="M75 80Q89 79 93 66" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
<path d="M75 80Q89 79 93 66" fill="none" stroke="#9a6030" stroke-width="5.5" stroke-linecap="round"/>
<g transform="rotate(-10 94 64)">
<path d="M91 76L91.5 54Q86 38 86 16Q86 3 94 3Q102 3 102 16Q102 38 96.5 54L97 76Z" fill="#e6b676" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
<path d="M91.4 56L96.6 56L97 74L91 74Z" fill="#a98fff"/>
<path d="M92 14q-1 14 1 28" fill="none" stroke="#c99452" stroke-width="2" stroke-linecap="round"/>
<circle cx="94" cy="77" r="4.8" fill="#e6b676" stroke="${INK}" stroke-width="2.6"/>
</g>
<circle cx="94" cy="65" r="5.5" fill="#d9a566" stroke="${INK}" stroke-width="2.5"/>
</g>
</svg>`;

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

function drum() {
  const Context = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Context) return;
  const ctx = new Context();
  void ctx.resume();
  const master = ctx.createGain();
  master.gain.value = 0.6;
  master.connect(ctx.destination);
  const start = ctx.currentTime + 0.05;
  HITS.forEach((pitch, i) => hit(ctx, start + i * BEAT, pitch, master));
  setTimeout(() => void ctx.close(), 2000);
}

async function march() {
  const root = document.createElement("div");
  root.setAttribute("aria-hidden", "true");
  root.style.cssText = "position:fixed;left:0;bottom:0;z-index:60;pointer-events:none;transform:translateX(-200px)";
  root.innerHTML = FIGURE;
  document.body.append(root);
  const figure = root.firstElementChild as SVGElement;
  const part = (id: string) => root.querySelector<SVGElement>(`#${id}`)!;
  const beat = BEAT * 1000;
  const loop = { duration: beat * 2, iterations: MARCH_MS / (beat * 2), easing: "ease-in-out" };

  figure.style.transformOrigin = "50% 100%";
  figure.animate(
    [{ transform: "translateY(0) rotate(-2.5deg)" }, { transform: "translateY(-9px) rotate(0deg)", offset: 0.25 }, { transform: "translateY(0) rotate(2.5deg)", offset: 0.5 }, { transform: "translateY(-9px) rotate(0deg)", offset: 0.75 }, { transform: "translateY(0) rotate(-2.5deg)" }],
    { duration: beat * 2, iterations: loop.iterations, easing: "ease-out" },
  );
  part("leg-l").animate([{ transform: "rotate(-24deg)" }, { transform: "rotate(24deg)" }, { transform: "rotate(-24deg)" }], loop);
  part("leg-r").animate([{ transform: "rotate(24deg)" }, { transform: "rotate(-24deg)" }, { transform: "rotate(24deg)" }], loop);
  part("arm").animate([{ transform: "rotate(0deg)" }, { transform: "rotate(-9deg)" }, { transform: "rotate(0deg)" }], { ...loop, duration: beat, iterations: MARCH_MS / beat });

  const travel = root.animate([{ transform: "translateX(-200px)" }, { transform: `translateX(${window.innerWidth + 40}px)` }], { duration: MARCH_MS, easing: "linear", fill: "forwards" });
  await travel.finished.catch(() => {});
  root.remove();
}

export async function run() {
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  drum();
  if (calm) return;
  await new Promise((resolve) => setTimeout(resolve, HITS.length * BEAT * 1000));
  if (!document.hidden) await march();
}
