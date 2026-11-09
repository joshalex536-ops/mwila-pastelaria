// Pré-visualização do montador em fotografia: base recortada (formato × cobertura) + enfeites pousados no topo.
// Todas as bases partilham o mesmo enquadramento 800×800; TOP é o y (px) do centro da superfície de cima de cada uma.
const TOP = {
  'redondo-chantilly': 272, 'redondo-ganache': 330, 'redondo-buttercream': 275, 'redondo-caramelo': 297, 'redondo-pasta': 287,
  'quadrado-chantilly': 274, 'quadrado-ganache': 304, 'quadrado-buttercream': 272, 'quadrado-caramelo': 284, 'quadrado-pasta': 270,
  'coracao-chantilly': 272, 'coracao-ganache': 285, 'coracao-buttercream': 276, 'coracao-caramelo': 277, 'coracao-pasta': 283,
};
const RX = 172, RY = 42; // meia-largura e meia-altura da elipse do topo, em px de 800

// cada enfeite: imagem, largura (px de 800) e posições [ângulo em graus, raio relativo] na elipse do topo
const ring = (n, r, off = 0) => Array.from({ length: n }, (_, i) => [off + (360 / n) * i, r]);
const EXTRAS = {
  morangos: { src: 'assets/recortes/morango.webp', w: 62, at: ring(7, 0.82) },
  framboesas: { src: 'assets/montador/framboesa.webp', w: 40, at: ring(7, 0.82, 26) },
  nozes: { src: 'assets/recortes/noz.webp', w: 46, at: ring(6, 0.5, 15) },
  flores: { src: 'assets/montador/flor.webp', w: 60, at: [[200, 0.25], [330, 0.32], [90, 0.2]] },
  raspas: { src: 'assets/recortes/raspa.webp', w: 26, at: [[10, 0.3], [70, 0.55], [130, 0.4], [190, 0.6], [250, 0.35], [300, 0.62], [350, 0.5], [0, 0]] },
  confetes: { src: 'assets/montador/confetes.webp', w: 70, at: [[0, 0], [140, 0.45], [300, 0.5]] },
};
const SCALE = { p: 0.84, m: 0.9, g: 0.96, xg: 1.02 };

let last = '';
export function renderCake(stage, sel) {
  const base = `${sel.formato}-${sel.cobertura}`;
  const key = `${base}|${sel.extras.join()}`;
  stage.style.setProperty('--size', SCALE[sel.tamanho]);
  if (key === last) return;
  const prev = new Set(last.split('|')[1]?.split(',') ?? []), baseChanged = !last.startsWith(base + '|');
  last = key;
  const cy = TOP[base];
  const pct = (v) => `${(v / 8).toFixed(2)}%`;
  const items = sel.extras.flatMap((id) => EXTRAS[id].at.map(([deg, r], i) => {
    const a = (deg * Math.PI) / 180, x = 400 + Math.cos(a) * RX * r, y = cy + Math.sin(a) * RY * r;
    return { id, i, x, y, w: EXTRAS[id].w, src: EXTRAS[id].src };
  })).sort((a, b) => a.y - b.y); // os de trás primeiro
  stage.innerHTML = `<img class="cake-base${baseChanged ? ' in' : ''}" src="assets/montador/${base}.webp" alt="">` + items.map((o) =>
    `<img class="topper${prev.has(o.id) && !baseChanged ? '' : ' in'}" src="${o.src}" alt="" style="left:${pct(o.x)};top:${pct(o.y)};width:${pct(o.w)};--d:${o.i * 50}ms;rotate:${(o.i * 47) % 50 - 25}deg">`).join('');
}
