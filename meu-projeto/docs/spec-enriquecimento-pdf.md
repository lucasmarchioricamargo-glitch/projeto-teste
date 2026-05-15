# Spec — Enriquecimento de PDFs de Apoio · Extensivo ENARE 2026

**Versão:** 1.0  
**Aprovado em:** 2026-05-12  
**Camada:** Enriquecimento (pós-produção) — leia `docs/spec-pdf-apoio.md` antes deste documento  
**Aplica-se a:** qualquer HTML produzido pelo fluxo base após aprovação individual por Lucas

---

## Relação com o fluxo base

Este documento descreve a **camada de enriquecimento** — etapa posterior e independente do fluxo base descrito em `docs/spec-pdf-apoio.md`. O fluxo base produz um HTML validado e aprovado. O enriquecimento opera sobre esse HTML para adicionar três camadas de valor:

1. **Racks da banca** — padrões de formulação identificados nas provas FGV
2. **Mnemônicos de mercado** — recursos de memorização já circulantes entre candidatos
3. **Bateria estendida** — questões reais FGV além das 3 do fluxo base

O artefato de saída deste fluxo é o **HTML enriquecido**, não o PDF. O PDF é gerado manualmente pelo operador após aprovação (ver §7).

**Sistema visual:** segue integralmente `docs/spec-pdf-apoio.md §2`. Não há novos componentes visuais — apenas uso dos boxes e estilos já definidos (`.box-pega`, `.box-dica`, `.box-conceito`, tabelas, seq-grid).

---

## Princípio Editorial Inegociável — Mnemônicos

> **Mnemônicos são capturados do mercado, nunca inventados.**

A função deste fluxo é identificar e registrar mnemônicos que candidatos reais já usam. Inventar um mnemônico é criar ruído: o candidato que já conhece outro fica confuso; o candidato que ainda não conhece aprende algo sem respaldo de uso real.

| Fontes independentes encontradas | Conduta |
|----------------------------------|---------|
| ≥ 3 | Transcrição literal (com atribuição genérica: "mnemônico circulante entre candidatos") |
| 2 | Versão adaptada (unificação das variações encontradas) |
| 1 | Descartado |
| 0 | Sem mnemônico — rack apresentado sem recurso de memorização — registrado como tarefa aberta |

"Fonte independente" = livro didático, apostila de cursinho, canal do YouTube ou post amplamente compartilhado (≥ 500 interações) — cada um conta como 1. A mesma pessoa em plataformas diferentes conta como 1.

---

## Etapa 1 — Preparação

**Input:**
- HTML base aprovado: `{nome-base}.html` (ex.: `competencias-gerais-bloco-b0-aula-01.html`)
- Análise de banca da área correspondente: `docs/extensivo-enare/estudo-banca-fgv/analise-banca-fgv-{area}.md`

**Ações:**

1. Ler o HTML base completo e identificar:
   - Tema central e subtemas de cada página de conteúdo (Bloco 3)
   - As 3 questões já presentes no Bloco 5 (para não duplicar)
   - Conceitos centrais testados no Bloco 6 (recuperação ativa)

2. Ler a análise de banca e extrair:
   - Racks identificados para os temas desta aula
   - Questões reais FGV já catalogadas por tema
   - Observações sobre formulação preferida pela banca

3. Montar uma tabela de trabalho (mental ou em comentário HTML temporário):

   | Tema da aula | Racks identificados | Questões reais disponíveis | Mnemônico candidato |
   |---|---|---|---|
   | {tema 1} | {rack A} | Q20XX-NN, Q20XX-NN | {buscar} |
   | {tema 2} | — | Q20XX-NN | — |

---

## Etapa 2 — Identificação e Validação de Racks

**Definição:** Um rack da banca é um padrão de formulação recorrente que a FGV sustenta em ≥ 3 questões reais da área ao longo das edições disponíveis.

**Critérios de validação de um rack:**

- [ ] Padrão documentado em ≥ 3 questões reais identificadas por número (Q20XX-NN)
- [ ] Padrão pertence ao tema desta aula (não rack genérico de outra aula)
- [ ] Padrão não é trivialmente óbvio (ex.: "a FGV usa verbos de ação" não é rack — é uma observação sobre toda prova objetiva)
- [ ] A descrição do rack é acionável: o candidato, ao ler, sabe o que esperar e como responder diferente

**Formatos de rack válidos:**

- Rack de estrutura: "a FGV apresenta um serviço público funcionando, descreve uma ação da equipe e pede identificação do princípio ou atributo que a ação viola ou exemplifica"
- Rack de distrator: "a FGV inclui sempre uma alternativa com o termo correto mas aplicado ao contexto errado (ex.: integralidade numa questão de universalidade)"
- Rack de cenário: "questões de {tema X} tipicamente situam a ação em UBS ou ESF e apresentam conflito entre profissional e usuário"

**O que NÃO é rack:**
- Observação sobre percentual de frequência histórica ("este tema aparece em 40% das provas")
- Generalização sobre nível cognitivo ("a FGV cobra análise, não memorização")
- Qualquer informação que não seja acionável para o candidato na hora da prova

---

### CHECKPOINT 1 — Antes de escrever qualquer HTML

Responder internamente antes de avançar:

1. Cada rack listado está sustentado por ≥ 3 questões reais com número identificado?
2. Algum "rack" é na verdade uma observação sobre frequência ou nível cognitivo? → Excluir.
3. A descrição de cada rack é acionável (candidato sabe o que esperar)?

Se qualquer resposta for negativa, corrigir antes de avançar.

---

## Etapa 3 — Busca de Mnemônicos de Mercado

Para cada tema com rack validado, buscar mnemônicos nas fontes disponíveis no projeto (`fontes/`, análises de banca) e, quando autorizado, em fontes externas de referência.

**Registro por tema:**

```
Tema: {nome do tema}
Fontes consultadas: {lista}
Mnemônicos encontrados:
  - Fonte 1: "{texto literal}" — {tipo de fonte}
  - Fonte 2: "{texto literal}" — {tipo de fonte}
Contagem de fontes independentes: {N}
Conduta aplicada: {transcrição literal / adaptado / descartado / sem mnemônico — tarefa aberta}
```

**Formato de apresentação no HTML (quando incluído):**

```html
<div class="box-dica">
  <strong>Mnemônico circulante:</strong> {texto do mnemônico}<br>
  <em>Ajuda a lembrar: {explicação de como o mnemônico mapeia para o conteúdo}</em>
</div>
```

> Ver `docs/spec-pdf-apoio.md §2` para especificação visual dos boxes.

---

## Etapa 4 — Enriquecimento do HTML

### 4.1 Inserção de racks

Cada rack validado é inserido no Bloco 3 (Conteúdo Principal) da página correspondente ao tema, em uma subseção chamada **"Como a FGV formula"**, imediatamente após o conteúdo teórico do tema.

Estrutura HTML da subseção de rack:

```html
<div class="box-pega">
  <strong>Como a FGV formula este tema</strong><br>
  {descrição acionável do rack — 2 a 4 frases}<br><br>
  <em>Questões de referência: Q{ano}-{nn}, Q{ano}-{nn}, Q{ano}-{nn}</em>
</div>
```

> `.box-pega` (verde-lima) é o componente correto para racks — são armadilhas e padrões da banca.  
> Ver `docs/spec-pdf-apoio.md §2` para especificação visual.

### 4.2 Inserção de mnemônicos

Mnemônicos são inseridos imediatamente após o rack do mesmo tema (se rack existir) ou após o bloco teórico do tema (se não houver rack).

### 4.3 Bateria estendida

A bateria estendida adiciona questões reais FGV ao Bloco 5, além das 3 questões do fluxo base.

**Política de seleção (ver também `docs/spec-pdf-apoio.md §4`):**

- Questões reais FGV das edições 2024 e 2025, identificadas por número (Q{ano}-{nn})
- Apenas questões cujo tema está diretamente coberto nesta aula
- Sem repetir questões já usadas como âncora nas 3 questões base
- Máximo de 3 questões adicionais por aula (total máximo: 6 questões)
- Cada questão adicional vem com gabarito comentado na mesma página

**Estrutura da página de questão adicional:** idêntica às páginas do Bloco 5 do fluxo base — uma questão por página, gabarito comentado (com explicação de cada distrator) na mesma página.

**Cabeçalho de identificação:**

```html
<p class="questao-origem">Questão real FGV · ENARE {ano} · Q{nn}</p>
```

---

### CHECKPOINT 2 — Antes de fechar o HTML enriquecido

- [ ] Cada rack tem ≥ 3 questões reais de referência listadas por número?
- [ ] Nenhum rack é uma estatística de frequência ou observação sobre nível cognitivo?
- [ ] Mnemônicos sem 3 fontes independentes foram excluídos ou registrados como tarefa aberta?
- [ ] Questões adicionais são reais FGV, identificadas por número, e cobrem tema desta aula?
- [ ] Nenhuma questão — base ou adicional — testa meta-informação (frequência, banca, curso)?
- [ ] O sistema visual segue `docs/spec-pdf-apoio.md §2` sem desvios?

---

## Etapa 5 — Validação

### 5.1 Regra do Aluno Ansioso

Aplicar `docs/spec-pdf-apoio.md §8`:

> "Se o aluno tem 10 minutos para folhear esta aula antes da prova, quanto desse tempo ele gasta vendo conteúdo que pode cair vs. informação sobre o curso ou a banca?"

A proporção mínima continua sendo **70% conteúdo**. O enriquecimento não deve inverter essa proporção: racks são conteúdo (padrões acionáveis); mnemônicos são conteúdo (recursos de memorização); estatísticas de banca não são conteúdo.

### 5.2 Validação de questões

Para cada questão adicionada (real FGV ou adaptada), aplicar o critério de `docs/spec-pdf-apoio.md §4`:

> *"Essa questão poderia aparecer no ENARE tal como está?"*

Se não, remover.

### 5.3 Tarefas abertas

Para cada tema sem mnemônico (zero fontes independentes encontradas), registrar uma tarefa aberta no Bloco 7 (Referências + Anotações) do HTML enriquecido:

```html
<p class="tarefa-aberta"><strong>Tarefa aberta:</strong> Mnemônico para {tema} — nenhuma fonte de mercado identificada. Verificar em edições futuras ou fontes especializadas em {área}.</p>
```

---

### CHECKPOINT 3 — Antes de entregar

- [ ] Regra do aluno ansioso: ≥ 70% do conteúdo é acionável para a prova?
- [ ] Todas as questões passam no teste "poderia cair no ENARE"?
- [ ] Tarefas abertas registradas no Bloco 7 para todos os temas sem mnemônico?
- [ ] Nomenclatura do arquivo de saída segue o padrão `{nome-base}-com-evidencia.html`?
- [ ] Nenhuma modificação foi feita nas seções que não foram tocadas pelo enriquecimento?

---

## Etapa 6 — Entrega

### 6.1 Artefato de saída

O produto final deste fluxo é o **HTML enriquecido**:

```
{nome-base}-com-evidencia.html
```

Exemplos:
- `competencias-gerais-bloco-b0-aula-01-com-evidencia.html`
- `enfermagem-bloco-b4-aula-02-com-evidencia.html`

O arquivo é salvo na mesma pasta do HTML base: `docs/extensivo-enare/pdfs/`

> Nomenclatura base segue `docs/spec-pdf-apoio.md §9`.

### 6.2 Relatório de enriquecimento

Junto com o HTML, produzir um relatório curto (em texto, para o Lucas):

```
Aula: {nome-base}
Racks inseridos: {N} ({lista de temas})
Mnemônicos inseridos: {N} ({lista de temas})
Questões adicionadas: {N} (Q{ano}-{nn}, ...)
Tarefas abertas: {N} ({lista de temas sem mnemônico})
Observações: {qualquer desvio ou decisão editorial relevante}
```

### 6.3 Aprovação e commit

Segue o fluxo de `docs/spec-pdf-apoio.md §10`: 1 aula por vez, commit somente após "aprovado" do Lucas.

Mensagem de commit:

```
docs: enriquecimento {Área} Bloco {Bn} Aula {nn} [Extensivo ENARE 2026]
```

### 6.4 Relatório consolidado de tarefas abertas

A cada 5 aulas enriquecidas, produzir um relatório consolidado das tarefas abertas acumuladas — temas sem mnemônico de mercado encontrado. Esse relatório é um ponto de parada: Lucas decide se busca as fontes, aceita a entrega sem mnemônico, ou consulta um especialista da área.

---

## 11 Regras Invioláveis

1. **Rack sem 3 questões reais** = não é rack. Não entra no HTML.
2. **Mnemônico inventado** = nunca. Zero exceções.
3. **Mnemônico com 1 fonte independente** = descartado. Não entra, não adapta.
4. **Questão que testa frequência histórica, percentual de variação ou meta-informação** = excluída. Mesmo que seja questão "real" de outro contexto.
5. **Rack formulado como estatística** ("este tema aparece em X% das provas") = não é rack. Reescrever como padrão acionável ou excluir.
6. **Proporção conteúdo < 70%** = refazer antes de entregar.
7. **Questão adicionada sem número de identificação real** (Q{ano}-{nn}) = não entra na bateria estendida.
8. **Questão adicionada que duplica tema ou distrator de questão já presente no Bloco 5 base** = excluída.
9. **Modificação de seção não relacionada ao enriquecimento** = proibida. O HTML enriquecido preserva integralmente o conteúdo do HTML base em tudo que não foi explicitamente tocado.
10. **Tarefa aberta não registrada** = violação. Todo tema sem mnemônico de mercado deve estar no Bloco 7.
11. **Commit sem aprovação do Lucas** = proibido. Mesmo que o checkpoint interno tenha passado.

---

## §7 — Conversão Manual para PDF

A conversão do HTML enriquecido para PDF é responsabilidade do operador e está fora do escopo do fluxo automatizado.

### Processo

1. Abrir o arquivo `{nome-base}-com-evidencia.html` no Chrome ou Edge
2. `Ctrl+P` (ou `Cmd+P` no Mac) → "Salvar como PDF"
3. Configurações obrigatórias:
   - Tamanho do papel: **A4**
   - Escala: **100%**
   - Margens: **Nenhuma** (ou "Mínimas", conforme o CSS já define as margens)
   - Cabeçalhos e rodapés do navegador: **desativados**
4. Salvar como `{nome-base}-com-evidencia.pdf` na mesma pasta do HTML

### Resultado esperado

```
docs/extensivo-enare/pdfs/
├── competencias-gerais-bloco-b0-aula-01.html          ← HTML base (aprovado)
├── competencias-gerais-bloco-b0-aula-01-com-evidencia.html  ← HTML enriquecido
└── competencias-gerais-bloco-b0-aula-01-com-evidencia.pdf   ← PDF entregue ao aluno
```

O HTML base não é substituído. Ambos os arquivos coexistem.

---

## Considerações Finais

### O que este fluxo NÃO faz

- Não corrige o conteúdo do HTML base (isso é escopo do fluxo base e requer novo ciclo de aprovação)
- Não reescreve questões do Bloco 5 original
- Não modifica objetivos, recuperação ativa ou referências do HTML base
- Não substitui a análise de banca por padrões descobertos no enriquecimento — a análise de banca é a fundação, não o produto

### Relação entre os dois fluxos

```
Fluxo base (spec-pdf-apoio.md)
  → HTML base aprovado
      ↓
Fluxo de enriquecimento (este documento)
  → HTML enriquecido (-com-evidencia.html)
      ↓
Conversão manual pelo operador
  → PDF entregue ao aluno (-com-evidencia.pdf)
```

Os dois fluxos são independentes e sequenciais. Um HTML base pode existir sem enriquecimento. O enriquecimento nunca precede a aprovação do HTML base.
