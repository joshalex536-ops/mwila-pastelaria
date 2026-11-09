// Preços de exemplo em Kwanzas: a cliente deve confirmar todos os valores aqui.
export const CURRENCY = 'Kz';

export const OPTIONS = {
  formato: [
    { id: 'redondo', label: 'Redondo', mult: 1 },
    { id: 'quadrado', label: 'Quadrado', mult: 1.15 },
    { id: 'coracao', label: 'Coração', mult: 1.25 },
  ],
  // cm = diâmetro (ou lado), alt = altura em cm, base = preço base
  tamanho: [
    { id: 'p', label: 'Pequeno', cm: 15, alt: 10, fatias: '8 a 10', base: 15000 },
    { id: 'm', label: 'Médio', cm: 20, alt: 12, fatias: '15 a 20', base: 24000 },
    { id: 'g', label: 'Grande', cm: 25, alt: 14, fatias: '25 a 30', base: 35000 },
    { id: 'xg', label: 'Festa', cm: 30, alt: 15, fatias: '40 a 45', base: 48000 },
  ],
  massa: [
    { id: 'baunilha', label: 'Baunilha', color: '#f3dfae', price: 0 },
    { id: 'chocolate', label: 'Chocolate', color: '#5a3520', price: 2000 },
    { id: 'redvelvet', label: 'Red Velvet', color: '#9e2b2f', price: 3500 },
    { id: 'cenoura', label: 'Cenoura', color: '#e39a4c', price: 1500 },
  ],
  recheio: [
    { id: 'brigadeiro', label: 'Brigadeiro', color: '#3e2316', price: 2500 },
    { id: 'doceleite', label: 'Doce de leite', color: '#c8894a', price: 2000 },
    { id: 'frutos', label: 'Frutos vermelhos', color: '#b3263e', price: 4000 },
    { id: 'maracuja', label: 'Mousse de maracujá', color: '#f2c14e', price: 3000 },
    { id: 'creme', label: 'Creme de baunilha', color: '#fbf1d6', price: 1500 },
  ],
  cobertura: [
    { id: 'chantilly', label: 'Chantilly', color: '#fbf7ef', drip: null, price: 0 },
    { id: 'ganache', label: 'Ganache', color: '#4a2a18', drip: '#3a2012', price: 4000 },
    { id: 'buttercream', label: 'Buttercream rosa', color: '#f2c6c8', drip: null, price: 3000 },
    { id: 'caramelo', label: 'Caramelo salgado', color: '#f4e4c6', drip: '#b8742e', price: 3500 },
    { id: 'pasta', label: 'Pasta americana', color: '#f7f2ea', drip: null, price: 6000 },
  ],
  extras: [
    { id: 'morangos', label: 'Morangos', price: 3000 },
    { id: 'framboesas', label: 'Framboesas', price: 3500 },
    { id: 'raspas', label: 'Raspas de chocolate', price: 1500 },
    { id: 'nozes', label: 'Nozes caramelizadas', price: 2500 },
    { id: 'flores', label: 'Flores de açúcar', price: 4000 },
    { id: 'confetes', label: 'Confetes', price: 1000 },
  ],
};

const find = (group, id) => OPTIONS[group].find((o) => o.id === id);

// Preço = (base do tamanho × formato) + adicionais, escalados pelo tamanho para massa/recheio/cobertura.
export function price(sel) {
  const t = find('tamanho', sel.tamanho);
  const scale = t.base / OPTIONS.tamanho[1].base; // adicionais custam proporcionalmente ao tamanho
  const lines = [
    [`${t.label} ${t.cm} cm, ${find('formato', sel.formato).label.toLowerCase()}`, Math.round(t.base * find('formato', sel.formato).mult)],
    ...['massa', 'recheio', 'cobertura'].map((g) => {
      const o = find(g, sel[g]);
      return [o.label, Math.round((o.price * scale) / 100) * 100];
    }),
    ...sel.extras.map((id) => [find('extras', id).label, find('extras', id).price]),
  ];
  return { lines, total: lines.reduce((s, [, v]) => s + v, 0) };
}

export const fmt = (n) => n.toLocaleString('pt-PT').replace(/ | /g, ' ') + ' ' + CURRENCY;
