/**
 * CAMADA DE DADOS — o único lugar do jogo que sabe ONDE o progresso fica salvo.
 *
 * Hoje usa o localStorage do navegador. Para trocar por um banco de dados
 * (Supabase, Firebase, API própria...), crie outro "adaptador" com os mesmos
 * métodos assíncronos (read / write) e chame `useAdapter(novoAdaptador)` em main.js.
 * O resto do jogo só usa as funções exportadas abaixo e não precisa mudar.
 */

const STORAGE_KEY = 'tres-chaves:save:v1';

const EMPTY_SAVE = () => ({
  version: 1,
  settings: { muted: false },
  characters: [],
});

/** Adaptador padrão: localStorage. */
export const localStorageAdapter = {
  async read() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  async write(data) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Navegação privada ou armazenamento cheio: o jogo continua sem salvar.
    }
  },
};

/** Adaptador de memória (útil em testes ou se o localStorage estiver bloqueado). */
export function memoryAdapter(initial = null) {
  let data = initial;
  return {
    async read() { return data ? structuredClone(data) : null; },
    async write(d) { data = structuredClone(d); },
  };
}

let adapter = localStorageAdapter;
let cache = null;

export function useAdapter(newAdapter) {
  adapter = newAdapter;
  cache = null;
}

async function load() {
  if (cache) return cache;
  const data = await adapter.read();
  cache = data && data.version === 1 ? { ...EMPTY_SAVE(), ...data } : EMPTY_SAVE();
  return cache;
}

async function persist() {
  await adapter.write(cache);
}

// ---------- Configurações ----------

export async function getSettings() {
  return { ...(await load()).settings };
}

export async function saveSettings(patch) {
  const data = await load();
  data.settings = { ...data.settings, ...patch };
  await persist();
  return { ...data.settings };
}

// ---------- Personagens ----------

export async function listCharacters() {
  return structuredClone((await load()).characters);
}

export async function getCharacter(id) {
  const c = (await load()).characters.find((ch) => ch.id === id);
  return c ? structuredClone(c) : null;
}

/** Cria ou atualiza um personagem (pelo id). */
export async function saveCharacter(character) {
  const data = await load();
  const copy = structuredClone(character);
  copy.updatedAt = Date.now();
  const i = data.characters.findIndex((ch) => ch.id === copy.id);
  if (i >= 0) data.characters[i] = copy;
  else data.characters.push(copy);
  await persist();
  return structuredClone(copy);
}

export async function deleteCharacter(id) {
  const data = await load();
  data.characters = data.characters.filter((ch) => ch.id !== id);
  await persist();
}
