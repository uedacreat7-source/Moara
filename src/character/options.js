/** Opções do criador de personagem. Os `id` são usados nos nomes dos arquivos de arte. */

export const TIPOS = [
  { id: 'adulto', nome: 'Adulto' },
  { id: 'crianca', nome: 'Criança' },
  { id: 'bebe', nome: 'Bebê' },
];

export const TAMANHOS = [
  { id: 'pequeno', nome: 'Pequeno', escala: 0.86 },
  { id: 'medio', nome: 'Médio', escala: 1 },
  { id: 'grande', nome: 'Grande', escala: 1.14 },
];

export const PELES = [
  { id: 'pele_01', cor: '#ffe3cf' },
  { id: 'pele_02', cor: '#f9cfae' },
  { id: 'pele_03', cor: '#eab58f' },
  { id: 'pele_04', cor: '#d39a6c' },
  { id: 'pele_05', cor: '#b47a50' },
  { id: 'pele_06', cor: '#8d5a3b' },
  { id: 'pele_07', cor: '#6a4029' },
  { id: 'pele_08', cor: '#4a2c1d' },
  { id: 'pele_09', cor: '#c9b8ff' },
  { id: 'pele_10', cor: '#a8e6cf' },
];

export const OLHOS = [
  { id: 'castanho', cor: '#6b3e26' },
  { id: 'preto', cor: '#2b2b33' },
  { id: 'azul', cor: '#3b82f6' },
  { id: 'verde', cor: '#22a06b' },
  { id: 'mel', cor: '#c08a2b' },
  { id: 'cinza', cor: '#8a9bb0' },
  { id: 'roxo', cor: '#8b5cf6' },
  { id: 'rosa', cor: '#ec4899' },
];

export const BOCHECHAS = [
  { id: 'sem', cor: null },
  { id: 'rosa', cor: '#ff8fb1' },
  { id: 'coral', cor: '#ff9a76' },
  { id: 'pessego', cor: '#ffbf8a' },
  { id: 'vermelha', cor: '#ff5f6d' },
  { id: 'lilas', cor: '#d59bff' },
];

export const CABELO_ESTILOS = [
  { id: 'curtinho', nome: 'Curtinho' },
  { id: 'cacheado', nome: 'Cacheado' },
  { id: 'longo', nome: 'Longo' },
  { id: 'chuquinhas', nome: 'Chuquinhas' },
  { id: 'coque', nome: 'Coque' },
  { id: 'topete', nome: 'Topetinho' },
];

export const CABELO_CORES = [
  { id: 'preto', cor: '#2d2420' },
  { id: 'castanho', cor: '#6b4226' },
  { id: 'loiro', cor: '#f2c14e' },
  { id: 'ruivo', cor: '#d9622b' },
  { id: 'rosa', cor: '#ff8fc8' },
  { id: 'azul', cor: '#6ec6ff' },
  { id: 'roxo', cor: '#a77bff' },
  { id: 'branco', cor: '#ececf2' },
];

export const NOMES_SUGERIDOS = [
  'Moara', 'Lulu', 'Bia', 'Teo', 'Nina', 'Davi', 'Malu', 'Juju', 'Caio', 'Lia',
  'Pipoca', 'Estrelinha', 'Bolinha', 'Sol', 'Luna', 'Tito', 'Mel', 'Gui', 'Cacau', 'Flor',
];

export const DEFAULT_LOOK = {
  tipo: 'crianca',
  tamanho: 'medio',
  pele: 'pele_02',
  olhos: 'castanho',
  bochechas: 'rosa',
  cabelo: 'cacheado',
  cabeloCor: 'castanho',
};

export const find = (list, id) => list.find((o) => o.id === id) || list[0];
