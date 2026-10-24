/**
 * Artes do personagem (substituem os desenhos provisórios automaticamente).
 *
 * Qualquer PNG/WEBP colocado em /assets/personagem/** é detectado na hora do build
 * pelo Vite. Os nomes seguem o padrão descrito em assets/personagem/LEIAME.md.
 *
 * Dois tipos de quadro:
 *  - QUADRO DO CORPO: 400 x 520 px, personagem inteiro, pés encostando embaixo.
 *    Usado por: pele, corpo, roupa, acessórios de pescoço e pulso.
 *  - QUADRO DA CABEÇA: 400 x 400 px, cabeça redonda de 200 px de diâmetro bem no centro.
 *    Usado por: olhos, bochechas, cabelo, acessórios de cabeça e rosto.
 */

const files = import.meta.glob('/assets/personagem/**/*.{png,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
});

/** 'olhos/olhos_azul' -> url */
const urls = {};
for (const [path, url] of Object.entries(files)) {
  const key = path.replace('/assets/personagem/', '').replace(/\.(png|webp)$/, '');
  urls[key] = url;
}

const images = {};

/** Carrega todas as artes encontradas. Chame uma vez antes de desenhar. */
export function preloadCharacterArt() {
  const jobs = Object.entries(urls).map(
    ([key, url]) =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          images[key] = img;
          resolve();
        };
        img.onerror = () => resolve();
        img.src = url;
      }),
  );
  return Promise.all(jobs);
}

/** Retorna a primeira arte existente entre as chaves informadas. */
export function getArt(...keys) {
  for (const k of keys) if (images[k]) return images[k];
  return null;
}

export function artCount() {
  return Object.keys(urls).length;
}

const tintCache = new Map();

/** Pinta uma arte cinza/branca com a cor escolhida (pele, cabelo). */
export function tinted(img, color) {
  const key = `${img.src}|${color}`;
  if (tintCache.has(key)) return tintCache.get(key);
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(img, 0, 0);
  tintCache.set(key, c);
  return c;
}
