# Artes do personagem — como trocar os desenhos provisórios

Coloque os arquivos **PNG com fundo transparente** (ou WEBP) nas pastas abaixo, com
**exatamente** estes nomes. O jogo detecta sozinho: o que tiver arte usa a arte, o que
não tiver continua com o desenho provisório. Depois de colocar os arquivos, é só
publicar de novo (a Vercel faz isso automaticamente a cada envio para o GitHub).

## Os dois tamanhos de quadro

| Quadro | Tamanho | Como desenhar |
|---|---|---|
| **Corpo** | **400 × 520 px** | Personagem inteiro, de frente, centralizado, com os **pés encostando na borda de baixo**. Todas as camadas do mesmo tipo (adulto/criança/bebê) precisam se encaixar umas nas outras. |
| **Cabeça** | **400 × 400 px** | A cabeça é um círculo de **200 px de diâmetro bem no centro** da imagem. Cabelo, chapéus e óculos são desenhados em volta dessa cabeça. O jogo coloca a cabeça no lugar certo para adulto, criança e bebê. |

> Dica para o Google Flow: gere primeiro um "molde" de cada tipo de corpo e use-o como
> referência para todas as outras camadas, assim tudo se encaixa.

**Onde fica a cabeça dentro do quadro do corpo** (para olhos, cabelo e chapéus encaixarem):

| Tipo | Centro da cabeça (x, y) | Diâmetro da cabeça |
|---|---|---|
| adulto | (200, 168) | 176 px |
| criança | (200, 220) | 192 px |
| bebê | (200, 296) | 200 px |

## Ordem das camadas (de trás para a frente)

1. `cabelo/cabelo_<estilo>_tras` (opcional — a parte do cabelo que fica atrás do corpo)
2. `roupa/<roupa>_tras` (opcional — capa, rabinho)
3. `pele/pele_<tipo>`
4. `corpo/corpo_<tipo>`
5. `roupa/<roupa>`
6. `acessorios/<acessório de pescoço ou pulso>`
7. `olhos/olhos_<cor>`
8. `bochechas/bochechas_<cor>`
9. `cabelo/cabelo_<estilo>`
10. `acessorios/<acessório de rosto>` e `acessorios/<acessório de cabeça>`

## pele/ — quadro do CORPO (o jogo pinta com a cor escolhida)

Desenhe a pele em **branco ou cinza claro** (com sombrinhas em cinza). O jogo pinta com a
cor de pele escolhida. Inclua corpo, braços, pernas e cabeça.

- `pele_adulto.png`
- `pele_crianca.png`
- `pele_bebe.png`

## corpo/ — quadro do CORPO (não é pintado)

Contornos, boquinha, nariz, sapatinhos e detalhes que ficam **por cima** da pele.

- `corpo_adulto.png`
- `corpo_crianca.png`
- `corpo_bebe.png`

## olhos/ — quadro da CABEÇA

`olhos_castanho.png`, `olhos_preto.png`, `olhos_azul.png`, `olhos_verde.png`,
`olhos_mel.png`, `olhos_cinza.png`, `olhos_roxo.png`, `olhos_rosa.png`

## bochechas/ — quadro da CABEÇA

`bochechas_rosa.png`, `bochechas_coral.png`, `bochechas_pessego.png`,
`bochechas_vermelha.png`, `bochechas_lilas.png`  (a opção "sem" não precisa de arte)

## cabelo/ — quadro da CABEÇA (o jogo pinta com a cor escolhida)

Desenhe em **branco ou cinza claro**; o jogo pinta com a cor escolhida.

`cabelo_curtinho.png`, `cabelo_cacheado.png`, `cabelo_longo.png`,
`cabelo_chuquinhas.png`, `cabelo_coque.png`, `cabelo_topete.png`
(+ opcional `cabelo_<estilo>_tras.png` para a parte de trás)

## roupa/ — quadro do CORPO

Use `<id>.png` para servir em todos os tipos, ou `<id>_adulto.png`, `<id>_crianca.png`,
`<id>_bebe.png` para uma versão de cada tamanho de corpo (recomendado).

| id | Nome no jogo |
|---|---|
| `roupa_camiseta_azul` | Camiseta e Shortinho |
| `roupa_vestido_rosa` | Vestido de Bolinhas |
| `roupa_macacao_verde` | Macacão Verdinho |
| `roupa_macacao_ursinho` | Macacão de Ursinho |
| `roupa_pijama_estrelas` | Pijaminha de Estrelas |
| `roupa_jardineira` | Jardineira |
| `roupa_moletom_arcoiris` | Moletom Arco-íris |
| `roupa_camiseta_coracoes` | Camiseta de Corações |
| `roupa_vestido_flores` | Vestido de Flores |
| `roupa_vestido_princesa` | Vestido de Princesa |
| `roupa_terninho` | Terninho de Festa |
| `roupa_tutu` | Tutu de Bailarina |
| `roupa_fantasia_unicornio` | Fantasia de Unicórnio |
| `roupa_fantasia_dino` | Fantasia de Dinossauro |
| `roupa_super_heroi` | Roupa de Super-herói (capa: `roupa_super_heroi_tras.png`) |

## acessorios/

**Cabeça e rosto → quadro da CABEÇA** (`<id>.png`):

| id | Nome | | id | Nome |
|---|---|---|---|---|
| `acess_toquinha` | Toquinha | | `acess_oculos_coracao` | Óculos de Coração |
| `acess_laco` | Laço | | `acess_oculos_estrela` | Óculos de Estrela |
| `acess_coroa` | Coroa | | `acess_chupeta` | Chupeta |
| `acess_tiara_gatinho` | Tiara de Gatinho | | `acess_mascara_heroi` | Máscara de Herói |
| `acess_coroa_flores` | Coroa de Flores | | | |
| `acess_touca_urso` | Touca de Ursinho | | | |
| `acess_presilha_borboleta` | Presilha de Borboleta | | | |
| `acess_chapeu_sol` | Chapéu de Sol | | | |
| `acess_chifre_unicornio` | Chifre de Unicórnio | | | |

**Pescoço e pulso → quadro do CORPO** (`<id>.png` ou `<id>_<tipo>.png`):

| id | Nome |
|---|---|
| `acess_colar_perolas` | Colar de Pérolas |
| `acess_cachecol` | Cachecol |
| `acess_medalha` | Medalha de Ouro |
| `acess_babador` | Babador |
| `acess_colar_arcoiris` | Colar Arco-íris |
| `acess_colar_estrela` | Colar de Estrela |
| `acess_pulseira` | Pulseira |
| `acess_relogio` | Relojinho |
| `acess_pulseira_flores` | Pulseira de Flores |

Para criar itens novos, adicione-os em `src/data/catalog.js` (e no pacote da loja ou na
lista de presentes do potinho) e coloque a arte aqui com o mesmo `id`.
