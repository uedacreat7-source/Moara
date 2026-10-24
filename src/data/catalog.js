/**
 * CATÁLOGO de itens, presentes do potinho e pacotes da loja.
 *
 * - `slot` define onde o item é vestido: roupa | cabeca | rosto | pescoco | pulso
 * - `desenho` descreve o desenho provisório (feito em código). Quando existir a arte
 *   em /assets/personagem/roupa ou /assets/personagem/acessorios com o nome do `id`,
 *   ela é usada no lugar (veja assets/personagem/LEIAME.md).
 */

export const SLOTS = [
  { id: 'roupa', nome: 'Roupas' },
  { id: 'cabeca', nome: 'Cabeça' },
  { id: 'rosto', nome: 'Rosto' },
  { id: 'pescoco', nome: 'Pescoço' },
  { id: 'pulso', nome: 'Pulso' },
];

const roupa = (id, nome, desenho) => ({ id, nome, slot: 'roupa', desenho });
const acess = (id, nome, slot, desenho) => ({ id, nome, slot, desenho });

export const ITEMS = [
  // ---------- Roupas iniciais (todo personagem já tem) ----------
  roupa('roupa_camiseta_azul', 'Camiseta e Shortinho', { estilo: 'camiseta', c1: '#5bb8ff', c2: '#3d5a99', padrao: 'nenhum' }),
  roupa('roupa_vestido_rosa', 'Vestido de Bolinhas', { estilo: 'vestido', c1: '#ff8fc8', c2: '#ff8fc8', c3: '#ffffff', padrao: 'bolinhas' }),
  roupa('roupa_macacao_verde', 'Macacão Verdinho', { estilo: 'macacao', c1: '#7ed98a', c2: '#7ed98a', c3: '#ffffff', padrao: 'listras' }),

  // ---------- Presentes do potinho ----------
  acess('acess_toquinha', 'Toquinha', 'cabeca', { tipo: 'toquinha', c1: '#ff7aa8', c2: '#ffffff' }),
  acess('acess_pulseira', 'Pulseira', 'pulso', { tipo: 'pulseira', c1: '#ffd23f', c2: '#ff6fb5' }),
  acess('acess_laco', 'Laço', 'cabeca', { tipo: 'laco', c1: '#ff4d6d', c2: '#ffb3c1' }),
  acess('acess_oculos_coracao', 'Óculos de Coração', 'rosto', { tipo: 'oculos_coracao', c1: '#ff4d8d', c2: '#ffc2dc' }),
  acess('acess_colar_perolas', 'Colar de Pérolas', 'pescoco', { tipo: 'colar', c1: '#fff8f0', c2: '#e6d5c3' }),
  acess('acess_coroa', 'Coroa', 'cabeca', { tipo: 'coroa', c1: '#ffcf33', c2: '#ff5ca8' }),
  acess('acess_tiara_gatinho', 'Tiara de Gatinho', 'cabeca', { tipo: 'tiara_gato', c1: '#3a3a4a', c2: '#ff9ec7' }),
  acess('acess_coroa_flores', 'Coroa de Flores', 'cabeca', { tipo: 'coroa_flores', c1: '#ff8fc8', c2: '#ffe066' }),
  acess('acess_cachecol', 'Cachecol', 'pescoco', { tipo: 'cachecol', c1: '#7b6cff', c2: '#ffd23f' }),
  acess('acess_relogio', 'Relojinho', 'pulso', { tipo: 'relogio', c1: '#45c4b0', c2: '#ffffff' }),
  acess('acess_medalha', 'Medalha de Ouro', 'pescoco', { tipo: 'medalha', c1: '#ffcf33', c2: '#4d7cff' }),

  // ---------- Loja: Roupinhas de Bebê ----------
  roupa('roupa_macacao_ursinho', 'Macacão de Ursinho', { estilo: 'fantasia', c1: '#c08552', c2: '#f3d2b0', barriga: true }),
  roupa('roupa_pijama_estrelas', 'Pijaminha de Estrelas', { estilo: 'pijama', c1: '#5869c9', c2: '#5869c9', c3: '#ffe066', padrao: 'estrelas' }),
  acess('acess_chupeta', 'Chupeta', 'rosto', { tipo: 'chupeta', c1: '#7fd4ff', c2: '#ffffff' }),
  acess('acess_touca_urso', 'Touca de Ursinho', 'cabeca', { tipo: 'touca_urso', c1: '#c08552', c2: '#f3d2b0' }),
  acess('acess_babador', 'Babador', 'pescoco', { tipo: 'babador', c1: '#ffffff', c2: '#ff9ec7' }),

  // ---------- Loja: Acessórios Brilhantes ----------
  acess('acess_oculos_estrela', 'Óculos de Estrela', 'rosto', { tipo: 'oculos_estrela', c1: '#ffcf33', c2: '#9ad8ff' }),
  acess('acess_colar_arcoiris', 'Colar Arco-íris', 'pescoco', { tipo: 'colar_arcoiris' }),
  acess('acess_pulseira_flores', 'Pulseira de Flores', 'pulso', { tipo: 'pulseira_flores', c1: '#ff8fc8', c2: '#ffe066' }),
  acess('acess_presilha_borboleta', 'Presilha de Borboleta', 'cabeca', { tipo: 'borboleta', c1: '#a77bff', c2: '#6ec6ff' }),
  acess('acess_chapeu_sol', 'Chapéu de Sol', 'cabeca', { tipo: 'chapeu_sol', c1: '#ffe9a8', c2: '#ff7aa8' }),

  // ---------- Loja: Roupas Fofas ----------
  roupa('roupa_jardineira', 'Jardineira', { estilo: 'jardineira', c1: '#4d7cff', c2: '#ffe066', padrao: 'nenhum' }),
  roupa('roupa_moletom_arcoiris', 'Moletom Arco-íris', { estilo: 'moletom', c1: '#ff9ec7', c2: '#8a7dff', padrao: 'arcoiris' }),
  roupa('roupa_camiseta_coracoes', 'Camiseta de Corações', { estilo: 'camiseta', c1: '#ffffff', c2: '#ff6fa5', c3: '#ff4d8d', padrao: 'coracoes' }),
  roupa('roupa_vestido_flores', 'Vestido de Flores', { estilo: 'vestido', c1: '#ffe066', c2: '#ffe066', c3: '#ff7aa8', padrao: 'flores' }),

  // ---------- Loja: Festa Chique ----------
  roupa('roupa_vestido_princesa', 'Vestido de Princesa', { estilo: 'princesa', c1: '#c79bff', c2: '#ffcf33', c3: '#ffffff', padrao: 'brilhos' }),
  roupa('roupa_terninho', 'Terninho de Festa', { estilo: 'terninho', c1: '#3b3f6b', c2: '#ff4d6d' }),
  roupa('roupa_tutu', 'Tutu de Bailarina', { estilo: 'tutu', c1: '#ffb3d1', c2: '#ffd6e7' }),
  acess('acess_colar_estrela', 'Colar de Estrela', 'pescoco', { tipo: 'colar_estrela', c1: '#ffcf33', c2: '#ffffff' }),

  // ---------- Loja: Fantasias Mágicas ----------
  roupa('roupa_fantasia_unicornio', 'Fantasia de Unicórnio', { estilo: 'fantasia', c1: '#ffffff', c2: '#ffc2e2', barriga: true, crina: true }),
  acess('acess_chifre_unicornio', 'Chifre de Unicórnio', 'cabeca', { tipo: 'chifre', c1: '#ffd84d', c2: '#ff9ec7' }),
  roupa('roupa_fantasia_dino', 'Fantasia de Dinossauro', { estilo: 'fantasia', c1: '#6fd27a', c2: '#d8f5a2', barriga: true, espinhos: '#ffb347' }),
  roupa('roupa_super_heroi', 'Roupa de Super-herói', { estilo: 'super', c1: '#3f7bff', c2: '#ff4d4d', c3: '#ffd23f' }),
  acess('acess_mascara_heroi', 'Máscara de Herói', 'rosto', { tipo: 'mascara', c1: '#ff4d4d' }),
];

export const ITEM_BY_ID = Object.fromEntries(ITEMS.map((it) => [it.id, it]));

/** Itens que todo personagem novo já recebe. */
export const STARTER_ITEMS = ['roupa_camiseta_azul', 'roupa_vestido_rosa', 'roupa_macacao_verde'];

/** Ordem dos presentes do potinho mágico (um por rodada completa). */
export const POTINHO_REWARDS = [
  'acess_toquinha',
  'acess_pulseira',
  'acess_laco',
  'acess_oculos_coracao',
  'acess_colar_perolas',
  'acess_coroa',
  'acess_tiara_gatinho',
  'acess_coroa_flores',
  'acess_cachecol',
  'acess_relogio',
  'acess_medalha',
];

export const PACKS = [
  {
    id: 'pacote_roupas',
    nome: 'Roupas Fofas',
    preco: 20,
    cor: '#7fd4ff',
    itens: ['roupa_jardineira', 'roupa_moletom_arcoiris', 'roupa_camiseta_coracoes', 'roupa_vestido_flores'],
  },
  {
    id: 'pacote_bebe',
    nome: 'Roupinhas de Bebê',
    preco: 25,
    cor: '#ffc2dc',
    itens: ['roupa_macacao_ursinho', 'roupa_pijama_estrelas', 'acess_chupeta', 'acess_touca_urso', 'acess_babador'],
  },
  {
    id: 'pacote_acessorios',
    nome: 'Acessórios Brilhantes',
    preco: 30,
    cor: '#ffe066',
    itens: ['acess_oculos_estrela', 'acess_colar_arcoiris', 'acess_pulseira_flores', 'acess_presilha_borboleta', 'acess_chapeu_sol'],
  },
  {
    id: 'pacote_festa',
    nome: 'Festa Chique',
    preco: 35,
    cor: '#d4b8ff',
    itens: ['roupa_vestido_princesa', 'roupa_terninho', 'roupa_tutu', 'acess_colar_estrela'],
  },
  {
    id: 'pacote_fantasias',
    nome: 'Fantasias Mágicas',
    preco: 40,
    cor: '#a8e6cf',
    itens: ['roupa_fantasia_unicornio', 'acess_chifre_unicornio', 'roupa_fantasia_dino', 'roupa_super_heroi', 'acess_mascara_heroi'],
  },
];

export const PACK_BY_ID = Object.fromEntries(PACKS.map((p) => [p.id, p]));
