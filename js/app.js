import { OPTIONS, price, fmt } from './pricing.js';
import { renderCake } from './cake.js';

// Número de WhatsApp da cliente (formato internacional sem +). Vazio = o WhatsApp pede o contacto.
const WHATSAPP = '';
const wa = (text) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;

/* ---------- Vitrine ---------- */
// Cada bolo da casa é uma receita do montador: a vitrine desenha-o e "Personalizar este" carrega-o.
const CAKES = [
  { name: 'Trufado de chocolate', desc: 'Massa de chocolate, recheio de brigadeiro e ganache escorrida.', sel: { formato: 'redondo', tamanho: 'm', massa: 'chocolate', recheio: 'brigadeiro', cobertura: 'ganache', extras: ['raspas', 'morangos'] } },
  { name: 'Red velvet', desc: 'Massa aveludada, creme de baunilha e framboesas frescas.', sel: { formato: 'redondo', tamanho: 'm', massa: 'redvelvet', recheio: 'creme', cobertura: 'chantilly', extras: ['framboesas'] } },
  { name: 'Coração de morango', desc: 'Massa de baunilha, frutos vermelhos e buttercream rosa.', sel: { formato: 'coracao', tamanho: 'm', massa: 'baunilha', recheio: 'frutos', cobertura: 'buttercream', extras: ['morangos', 'flores'] } },
  { name: 'Caramelo salgado', desc: 'Massa de cenoura, doce de leite e nozes caramelizadas.', sel: { formato: 'quadrado', tamanho: 'm', massa: 'cenoura', recheio: 'doceleite', cobertura: 'caramelo', extras: ['nozes'] } },
  { name: 'Maracujá', desc: 'Massa de baunilha, mousse de maracujá e chantilly.', sel: { formato: 'redondo', tamanho: 'g', massa: 'baunilha', recheio: 'maracuja', cobertura: 'chantilly', extras: ['flores'] } },
  { name: 'Festa colorida', desc: 'Massa de chocolate, brigadeiro, pasta americana e confetes.', sel: { formato: 'redondo', tamanho: 'xg', massa: 'chocolate', recheio: 'brigadeiro', cobertura: 'pasta', extras: ['confetes'] } },
].map((c, i) => ({ ...c, img: `assets/recortes/${i + 1}.webp`, from: price(c.sel).total }));

const track = document.getElementById('track');
track.innerHTML = CAKES.map((c, i) => `<img class="slide" data-i="${i}" src="${c.img}" alt="Bolo ${c.name}" ${i ? '' : 'fetchpriority="high"'}>`).join('');

let active = 0;
function show(i) {
  const n = CAKES.length;
  active = (i + n) % n;
  track.querySelectorAll('.slide').forEach((el, j) => {
    // o que sai vai para a esquerda, o que entra vem da direita
    el.dataset.pos = j === active ? 0 : j === (active - 1 + n) % n ? -1 : 1;
    el.setAttribute('aria-hidden', j !== active);
  });
  const c = CAKES[active];
  const info = document.querySelector('.stage-info');
  info.classList.remove('swap'); void info.offsetWidth; info.classList.add('swap');
  document.getElementById('cake-name').textContent = c.name;
  document.getElementById('cake-desc').textContent = c.desc;
  document.getElementById('cake-price').textContent = fmt(c.from);
  document.getElementById('cake-order').href = wa(`Olá Mwíla! Gostaria de encomendar o bolo ${c.name} (${fmt(c.from)}).`);
}
document.getElementById('cake-custom').onclick = () => {
  Object.assign(sel, structuredClone(CAKES[active].sel));
  form.querySelectorAll('input').forEach((i) => (i.checked = i.type === 'checkbox' ? sel.extras.includes(i.value) : sel[i.name] === i.value));
  update();
};
document.getElementById('next').onclick = () => show(active + 1);
document.getElementById('vitrine').addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') show(active - 1);
  if (e.key === 'ArrowRight') show(active + 1);
});
// gesto de deslizar no telemóvel
let x0 = null;
track.addEventListener('pointerdown', (e) => (x0 = e.clientX));
track.addEventListener('pointerup', (e) => { if (x0 !== null && Math.abs(e.clientX - x0) > 40) show(active + (e.clientX < x0 ? 1 : -1)); x0 = null; });
show(0);

/* ---------- Montador ---------- */
const sel = { formato: 'redondo', tamanho: 'm', massa: 'chocolate', recheio: 'brigadeiro', cobertura: 'ganache', extras: ['morangos'] };

const swatch = (o) => (o.color ? `<span class="sw" style="--c:${o.drip || o.color}"></span>` : '');
const SHAPE_ICON = { redondo: 'ph-circle', quadrado: 'ph-square', coracao: 'ph-heart' };
const extraPrice = (o) => (o.price ? `<small>+${fmt(o.price)}</small>` : '');

document.querySelectorAll('[data-group]').forEach((box) => {
  const g = box.dataset.group, multi = g === 'extras';
  box.innerHTML = OPTIONS[g].map((o) => {
    const checked = multi ? sel.extras.includes(o.id) : sel[g] === o.id;
    const input = `<input type="${multi ? 'checkbox' : 'radio'}" name="${g}" value="${o.id}" ${checked ? 'checked' : ''}>`;
    if (g === 'tamanho') {
      return `<label class="size">${input}<span class="size-ring" style="--s:${o.cm / 30}"></span><b>${o.label}</b><span>Ø ${o.cm} cm, ${o.alt} cm alt.</span><span>${o.fatias} fatias</span></label>`;
    }
    const icon = g === 'formato' ? `<i class="ph ${SHAPE_ICON[o.id]}"></i>` : swatch(o);
    return `<label class="chip">${input}${icon}<span>${o.label}</span>${g === 'formato' ? '' : extraPrice(o)}</label>`;
  }).join('');
});

const form = document.getElementById('builder');
const stage = document.getElementById('cake');
const totalEl = document.getElementById('total');
let shown = 0;

function countTo(target) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { totalEl.textContent = fmt(target); shown = target; return; }
  const from = shown, t0 = performance.now();
  const step = (t) => {
    const k = Math.min(1, (t - t0) / 500), e = 1 - (1 - k) ** 3;
    totalEl.textContent = fmt(Math.round((from + (target - from) * e) / 100) * 100);
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
  shown = target;
  totalEl.parentElement.classList.remove('bump'); void totalEl.offsetWidth; totalEl.parentElement.classList.add('bump');
}

function update() {
  renderCake(stage, sel);
  const p = price(sel);
  countTo(p.total);
  document.getElementById('lines').innerHTML = p.lines.map(([l, v]) => `<li><span>${l}</span><span>${v ? fmt(v) : 'incluído'}</span></li>`).join('');
  const t = OPTIONS.tamanho.find((o) => o.id === sel.tamanho);
  document.getElementById('spec').textContent = `${sel.formato === 'quadrado' ? `${t.cm} × ${t.cm}` : `Ø ${t.cm}`} cm, ${t.alt} cm de altura, serve ${t.fatias} pessoas`;
  const label = (g) => OPTIONS[g].find((o) => o.id === sel[g]).label;
  const msg = `Olá Mwíla! Quero encomendar um bolo personalizado:
Formato: ${label('formato')}
Tamanho: ${label('tamanho')} (${t.cm} cm, ${t.fatias} fatias)
Massa: ${label('massa')}
Recheio: ${label('recheio')}
Cobertura: ${label('cobertura')}
Decoração: ${sel.extras.map((id) => OPTIONS.extras.find((o) => o.id === id).label).join(', ') || 'nenhuma'}
Total estimado: ${fmt(p.total)}`;
  document.getElementById('order').href = wa(msg);
}

form.addEventListener('change', (e) => {
  const { name, value, checked, type } = e.target;
  if (type === 'checkbox') sel.extras = checked ? [...sel.extras, value] : sel.extras.filter((x) => x !== value);
  else sel[name] = value;
  update();
});
form.addEventListener('submit', (e) => e.preventDefault());
document.getElementById('foot-wa').href = document.getElementById('nav-wa').href = wa('Olá Mwíla!');
update();

/* ---------- Entradas ao fazer scroll ---------- */
const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add('seen'), io.unobserve(e.target))), { threshold: 0.15 });
document.querySelectorAll('.builder-panel fieldset, .builder-stage, .foot').forEach((el) => { el.classList.add('reveal'); io.observe(el); });
