# Mini-Mapa das Residências — Lead Magnet

Datasets segmentados por profissão para o lead magnet **Mini-Mapa das Residências** da Elite Treinamentos em Saúde (Residência PRO). 12 arquivos JSON (1 por profissão), cada um com até 20 instituições de residência multiprofissional, ordenadas por score composto. Servem como input estruturado para o time de design produzir os PDFs.

**Origem:** gerados por `scripts/extract-mini-mapa.js` (repo `meu-projeto-leadmagnet`, branch `feature/lead-magnet-v2`) a partir do banco JSON em `residencias/detalhado/`. Ver story `docs/stories/lead-magnet-mini-mapa/1.1.story.md` para ACs completos.

---

## Como rodar

Pré-requisitos: Node.js 18+ instalado.

```bash
cd /caminho/para/meu-projeto-leadmagnet/meu-projeto
RESIDENCIAS_DATA_DIR=/caminho/para/residencias node scripts/extract-mini-mapa.js
```

A env var `RESIDENCIAS_DATA_DIR` é **obrigatória** — aponta para o diretório do banco residências (contém `index.json` + `detalhado/`). Script falha cedo se ausente ou inválida.

**Idempotência:** rodar 2x consecutivamente produz output byte-idêntico (`diff -r` retorna zero). O campo `data_extracao` deriva de `max(mtime)` dos arquivos fonte, não da hora de execução.

**Saída:** 12 arquivos `mini-mapa-{slug-profissao}.json` + `DIVERGENCIAS.json` em `$RESIDENCIAS_DATA_DIR/mini-mapa/`.

### Mirror versionado (recomendado pra rastrear histórico)

O banco residências está hoje fora do controle de versão (ver pendência arquitetural na story 1.1). Pra ter os outputs versionados em git, o script aceita uma env var opcional `LEAD_MAGNET_OUTPUT_MIRROR` que espelha os 13 arquivos gerados num diretório-secundário — geralmente apontando pra dentro do repo lead-magnet em `data/mini-mapa/`.

**Fluxo de 2 passos (importante):**

```bash
# Passo 1 — rodar com a env var setada (escreve no banco E no mirror)
RESIDENCIAS_DATA_DIR=/caminho/para/residencias \
LEAD_MAGNET_OUTPUT_MIRROR=/caminho/para/meu-projeto-leadmagnet/meu-projeto/data/mini-mapa \
  node scripts/extract-mini-mapa.js

# Passo 2 — commitar o mirror em git (senão o backup não fica persistido)
cd /caminho/para/meu-projeto-leadmagnet/meu-projeto
git add data/mini-mapa/
git commit -m "data: regenerate mini-mapas (data_extracao=YYYY-MM-DD)"
git push
```

**Sem a env var setada:** comportamento 100% idêntico ao default — só escreve no banco. Nenhum mirror, nenhum risco de quebrar idempotência.

**Atenção:** o mirror só fica correto se commitado depois de rodar. O script não chama git — apenas copia os arquivos. Se você rodar e esquecer de commitar, o mirror fica defasado em relação ao banco. README e este checklist existem pra te lembrar.

---

# Escopo do Mini-Mapa

Este script gera lead magnets apenas para 12 profissões. Áreas como Ciências Biológicas e Saúde da Família existem no banco fonte mas são EXCLUÍDAS desta extração — pertencem ao Extensivo ENARE, não ao Mini-Mapa. A lista das 12 é fixa por decisão de produto e não deve ser derivada dinamicamente do banco.

**Lista fixa das 12 profissões:**
- Biomedicina
- Educação Física
- Enfermagem
- Farmácia
- Fisioterapia
- Fonoaudiologia
- Medicina Veterinária
- Nutrição
- Odontologia
- Psicologia
- Serviço Social
- Terapia Ocupacional

---

## Critério de ranking — Score composto 70 / 30 (sem geografia)

Para cada **instituição** dentro do conjunto da profissão:

```
score(inst, profissao) =
    0.70 * normalizar(vagas_totais_da_profissao_na_inst, max_no_dataset_da_profissao)
  + 0.30 * (1.0 if banca contém "ENARE" else 0.0)
```

- **Componente vagas (70%):** `vagas_inst / max(vagas_inst)` dentro do conjunto da profissão. Reagregação: vagas com `area` em subspecialidades canônicas (ex: "Anestesiologia Veterinária", "Enfermagem Obstétrica", "Cirurgia BMF", "Farmácia (Análises Clínicas)") são somadas sob a profissão-pai correspondente. A lista canônica `SUBSPEC_TO_PARENT` está no topo do script.
- **Componente ENARE (30%):** 1.0 ou 0.0. Reflete o alinhamento estratégico do produto com o upsell do Curso ENARE R$197.

**Exemplo numérico — UNIFESP em Enfermagem:**
- Vagas UNIFESP/Enf: 36
- Max vagas Enf no dataset: 215 (SES-PE, banca UPENET)
- Banca UNIFESP: ENARE → compE = 1.0
- compV = 36/215 = **0.167**
- score = 0.7 × 0.167 + 0.3 × 1.0 = 0.117 + 0.300 = **0.417**

**Por que não tem componente geográfico:** versão anterior usava 40/40/20 com 20% em `1/√n_inst_por_uf`. Penalizava grandes centros (SP/MG/RJ/BA/RS): UNIFESP 36v ENARE caía rank 30, atrás de Liga RN 2v ENARE no rank 20. Removido em 2026-05-20 — ver Change Log v1.3 da story 1.1.

---

## Calendário ENARE 2026/2027

| Período | Evento |
|---|---|
| 27/04/2026 – 15/05/2026 | Adesão de instituições (encerrada em 15/05) |
| 08/06/2026 – 22/06/2026 | Inscrições candidatos |
| 13/09/2026 | Prova |

Fonte: FGV / EBSERH (7ª edição do ENARE).

**`edital_completo_pendente: true`** no JSON: o calendário oficial foi divulgado em maio/2026 mas o edital completo (com lista de instituições aderentes e vagas por programa) ainda não foi publicado. Quando o edital sair, regenerar dataset (sem mudança de schema). O time de design deve mencionar essa pendência nos PDFs.

---

## Estrutura de cada `mini-mapa-{slug-profissao}.json`

```json
{
  "profissao": "Enfermagem",
  "ano": 2026,
  "data_extracao": "2026-05-21",
  "cobertura_geografica": "completa",
  "total_instituicoes_disponiveis": 205,
  "instituicoes": [
    {
      "rank": 1,
      "nome": "...",
      "cidade": "...",
      "estado": "CE",
      "banca": "ENARE",
      "link_edital": "https://...",
      "datas": {
        "inscricao_inicio": "DD/MM/AAAA",
        "inscricao_fim": "DD/MM/AAAA",
        "prova": "DD/MM/AAAA"
      },
      "programas": [
        {"area": "Enfermagem", "vagas": 6, "nome_programa": "Enfermagem Obstétrica"}
      ]
    }
  ],
  "calendario_enare_2026_2027": { "edital_completo_pendente": true, "datas": [...] }
}
```

**Campos importantes:**
- `cobertura_geografica`: `"completa"` se profissão tem vagas em ≥20 UFs; `"parcial"` caso contrário (Medicina Veterinária e Biomedicina caem em parcial).
- `total_instituicoes_disponiveis`: contagem antes do corte top 20 — use no PDF se quiser comunicar "as 20 melhores entre 205".
- `instituicoes[].datas`: são datas da última edição publicada do edital DESSA instituição (ex: ciclo ENARE 2025/2026). NÃO confundir com `calendario_enare_2026_2027` no topo, que é o cronograma consolidado da próxima edição.
- `instituicoes[].programas[].area`: pode ser o nome da profissão OU uma subspecialidade (ex: "Enfermagem Obstétrica", "Anestesiologia Veterinária"). A reagregação subspec→profissão-pai é feita no agregado de vagas e no ranking; os nomes específicos das subspecs são preservados aqui para o candidato ver os programas reais.

---

## Relatório de divergências — `DIVERGENCIAS.json`

Junto aos 12 mini-mapas, o script gera `DIVERGENCIAS.json` com divergências detectadas entre `sum(lotes reagregados)` e `total_vagas_por_profissao` do `_resumo.json` correspondente. **Não bloqueia geração** — apenas relata para curadoria.

**Categorias:**
- `resumo_defasado` (baixa): lotes > resumo. Resumo é cópia da Tabela 1 do PDF oficial; tipicamente defasada. Lotes preferidos.
- `lotes_possivelmente_incompletos` (alta): lotes < resumo. Pode ser captura faltando no banco. Verificar contra detalhamento do PDF oficial da UF antes de tratar como erro.
- `subspec_nao_mapeada` (média): área silenciada sem mapping em `SUBSPEC_TO_PARENT`. Estender o mapping ou corrigir lote.

Ver `divida_tecnica_pdf_audit.uf_pendentes` no JSON para a lista de UFs que ainda precisam de validação contra PDF oficial.

---

## Histórico de versões da story

Ver `docs/stories/lead-magnet-mini-mapa/1.1.story.md` (Change Log) para o histórico completo: v1.0 (story criada) → v1.4 (reagregação subspec→parent estendida pro output).
