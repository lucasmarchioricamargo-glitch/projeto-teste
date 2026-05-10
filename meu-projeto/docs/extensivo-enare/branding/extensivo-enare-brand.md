# Extensivo ENARE — Mini Design System
**Versão:** 1.0  
**Status:** Aprovado  
**Marca-mãe:** Residência PRO (Camila Nara)  
**Referência:** `docs/branding/camila-nara-branding-book.md`

---

## 1. Posicionamento de Marca

O Extensivo ENARE é um **produto da Residência PRO** — não uma marca independente. Toda decisão visual parte desse princípio: o aluno deve reconhecer imediatamente que está dentro do ecossistema Residência PRO.

### Hierarquia de assinatura nos materiais

```
EXTENSIVO ENARE      ← destaque principal
by Residência PRO    ← endosso obrigatório
```

> Elite Treinamentos em Saúde **não aparece** na comunicação visual dos materiais do produto.

---

## 2. Paleta de Cores

Todas as cores derivam diretamente do brand guide da Residência PRO. Nenhuma cor foi criada fora do sistema existente.

### Cores base (idênticas à Residência PRO)

| Nome funcional | Hex | RGB | Aplicação |
|---|---|---|---|
| **Verde Floresta** | `#1F5C23` | rgb(31, 92, 35) | Cor dominante — wordmark ENARE, cabeçalhos, autoridade |
| **Verde Lima** | `#C6D834` | rgb(198, 216, 52) | Energia — barra do logo em fundo escuro, destaques em dark bg |
| **Creme** | `#F6F4ED` | rgb(246, 244, 237) | Fundo de todos os PDFs, espaço negativo |
| **Preto** | `#070707` | rgb(7, 7, 7) | Tipografia de corpo, texto corrido |

### Cor de acento do produto (derivada do Teal de apoio)

| Nome funcional | Hex | RGB | Derivação | Aplicação |
|---|---|---|---|---|
| **Teal Brilhante** | `#0D8A8D` | rgb(13, 138, 141) | Teal `#0C4A4C` — mesma matiz, luminosidade elevada de 29% → 55% | Barra do logo, filetes de destaque, numeração de blocos, rodapé |

### Neutrais

| Nome funcional | Hex | Aplicação |
|---|---|---|
| **Cinza Quente** | `#9E9B94` | Endosso "by Residência PRO", rodapés, legendas, metadados |

### Cores de boxes de destaque (só paleta existente)

| Box | Fundo | Texto | Lógica |
|---|---|---|---|
| ⚠️ Pega no ENARE | `#C6D834` | `#1F5C23` | Verde Lima = máxima energia e atenção |
| 💡 Dica de prova | `#0D8A8D` | `#F6F4ED` | Acento Teal = insight exclusivo do produto |
| 📌 Conceito-chave | `#1F5C23` | `#F6F4ED` | Verde Floresta = definição com autoridade |

### Uso por contexto de fundo

| Elemento | Fundo claro (creme/branco) | Fundo escuro (verde floresta) |
|---|---|---|
| Barra do logo | Teal `#0D8A8D` | Verde Lima `#C6D834` |
| "extensivo" italic | Teal `#0D8A8D` | Verde Lima `#C6D834` |
| "ENARE" wordmark | Verde Floresta `#1F5C23` | Creme `#F6F4ED` |
| Endosso | Cinza `#9E9B94` | Creme 55% opacidade |

---

## 3. Tipografia

Idêntica ao brand guide da Residência PRO. Nenhuma família nova introduzida.

| Hierarquia | Fonte | Estilo | Substituta open-source |
|---|---|---|---|
| **Títulos / Wordmark** | Gotham Condensed | Bold 700/800, All Caps | **Barlow Condensed** (Google Fonts) |
| **Qualificador / Subtítulo** | Playfair Display | Italic 400 | — (open-source, definitiva) |
| **Corpo / Parágrafos** | Bricolage Grotesque | Regular 400 | — (open-source, definitiva) |
| **Destaques editoriais** | Space Grotesk | Light 300 / Regular 400 | Substitui FF Providence Sans (licença) |

> **Regra:** Gotham Condensed é usada nos materiais profissionais finais se licenciada. Barlow Condensed substitui sem ruptura visual em todos os PDFs e materiais digitais enquanto a licença não for adquirida.

### Hierarquia tipográfica nos PDFs

| Nível | Fonte | Tamanho | Peso | Cor |
|---|---|---|---|---|
| H1 — Título do bloco | Gotham/Barlow Condensed | 32px / 24pt | 800, All Caps | Verde Floresta `#1F5C23` |
| H2 — Seção | Gotham/Barlow Condensed | 22px / 16pt | 700, All Caps | Verde Floresta `#1F5C23` |
| H3 — Subseção | Bricolage Grotesque | 16px / 12pt | 600 | Preto `#070707` |
| Corpo | Bricolage Grotesque | 13px / 10pt | 400 | Preto `#070707` |
| Legenda / Nota | Space Grotesk | 11px / 8pt | 300 | Cinza `#9E9B94` |
| Endosso de marca | Space Grotesk | 10px / 7.5pt | 300 | Cinza `#9E9B94` |

---

## 4. Logo — Estrutura Herdada (Proposta B)

### Conceito
O logo espelha a lógica estrutural do logo produto da Residência PRO ("mentoria + RESIDÊNCIA + pro"). A barra vertical em Teal é o **conector de DNA** — o mesmo elemento que aparece nos materiais da marca-mãe. "extensivo" em Playfair Display italic cria o contraste serif/sans que define o tom editorial.

### Anatomia

```
│ extensivo          ← Playfair Display Italic 16px, Teal #0D8A8D
│ ENARE              ← Barlow Condensed 800 82px, Verde Floresta #1F5C23
│ by Residência PRO  ← Space Grotesk Light 13px, Cinza #9E9B94
↑
Barra vertical 4px, Teal #0D8A8D, altura = total do conjunto de texto
```

### Arquivos de produção

| Arquivo | Contexto |
|---|---|
| `logos/proposta-b-cor.svg` | Fundo claro (creme, branco) |
| `logos/proposta-b-cor-escuro.svg` | Fundo escuro (verde floresta, teal) |
| `logos/proposta-b-mono.svg` | Monocromático preto — carimbo, bordado, gravação |
| `logos/proposta-b-icone.svg` | Ícone reduzido — favicon, thumbnail, watermark |

### Variações de ícone reduzido

O ícone usa um **container quadrado com borda esquerda Teal dominante** — preserva o DNA da barra vertical em formato compacto.

```
┌──────────────┐
│█             │   Barra Teal (6px) + fundo Creme
│█    E        │   "E" em Verde Floresta
│█             │
└──────────────┘
```

### Área de proteção

Manter ao redor do logo uma área livre equivalente à **altura da letra "E" do wordmark**. Nenhum elemento gráfico, texto ou borda deve invadir essa área.

### Usos proibidos

- Não alterar as proporções da barra em relação ao wordmark
- Não trocar "extensivo" por outra palavra
- Não usar cores fora da paleta definida
- Não remover o endosso "by Residência PRO"
- Não recriar em fontes diferentes das especificadas

---

## 5. Componentes Visuais dos PDFs

### 5.1 Estrutura de páginas

**Capa**
- Fundo: Verde Floresta `#1F5C23`
- Logo: versão fundo escuro (`proposta-b-cor-escuro.svg`) — canto superior esquerdo
- Nome do bloco: Barlow Condensed 800, All Caps, Creme `#F6F4ED`, centralizado
- Título da aula: Bricolage Grotesque 400, Creme 70% opacidade
- Numeração: Barlow Condensed 800, Verde Lima `#C6D834`, grande e decorativo (ex.: "03")
- Filete inferior: Verde Lima `#C6D834`, 3px

**Páginas internas**
- Fundo: Creme `#F6F4ED`
- Cabeçalho: filete Teal `#0D8A8D` 2px + nome do bloco em Barlow Condensed 10px, Cinza
- Rodapé: `Extensivo ENARE  ·  by Residência PRO` — Space Grotesk Light 9px, Cinza, + numeração de página à direita

### 5.2 Boxes de destaque

Todos os boxes têm: padding 14px 18px, border-radius 6px, ícone + título em Barlow Condensed 600, texto em Bricolage Grotesque 400.

```
⚠️ PEGA NO ENARE
┌─────────────────────────────────────────────────────┐
│ Fundo: #C6D834  |  Texto: #1F5C23                   │
│ Título: Barlow Condensed 600 12px All Caps           │
│ Corpo: Bricolage Grotesque 400 12px                  │
└─────────────────────────────────────────────────────┘

💡 DICA DE PROVA
┌─────────────────────────────────────────────────────┐
│ Fundo: #0D8A8D  |  Texto: #F6F4ED                   │
│ Título: Barlow Condensed 600 12px All Caps           │
│ Corpo: Bricolage Grotesque 400 12px                  │
└─────────────────────────────────────────────────────┘

📌 CONCEITO-CHAVE
┌─────────────────────────────────────────────────────┐
│ Fundo: #1F5C23  |  Texto: #F6F4ED                   │
│ Título: Barlow Condensed 600 12px All Caps           │
│ Corpo: Bricolage Grotesque 400 12px                  │
└─────────────────────────────────────────────────────┘
```

### 5.3 Quadros-resumo e tabelas

- Cabeçalho da tabela: fundo Verde Floresta `#1F5C23`, texto Creme, Barlow Condensed 700
- Linhas alternadas: Creme `#F6F4ED` e `#EDEAE2` (creme levemente escurecido)
- Borda: 1px `#DDD9D1`
- Texto das células: Bricolage Grotesque 400 11px, Preto

### 5.4 Rodapé padrão (todas as páginas internas)

```
Extensivo ENARE  ·  by Residência PRO                              [pág. X]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
- Tipografia: Space Grotesk Light 9px, Cinza `#9E9B94`
- Linha: Teal `#0D8A8D`, 0.5px

---

## 6. Checklist de conformidade visual

Para cada novo material criado, verificar:

- [ ] Logo na versão correta para o fundo (claro/escuro)
- [ ] Nenhuma cor fora da paleta definida neste documento
- [ ] Tipografia respeitando a hierarquia H1/H2/H3/corpo/legenda
- [ ] Endosso "by Residência PRO" presente e legível
- [ ] Elite Treinamentos em Saúde ausente da comunicação visual
- [ ] Boxes de destaque usando as 3 variações definidas (verde lima, teal, verde floresta)
- [ ] Rodapé institucional em todas as páginas internas dos PDFs
- [ ] Numeração de páginas presente

---

*Extensivo ENARE Brand System v1.0 — derivado do Branding Book Camila Nara / Residência PRO (Liana Réquia, Jorné).*
