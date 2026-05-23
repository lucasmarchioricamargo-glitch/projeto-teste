# CHANGELOG — Banco de Dados Residências

Registro humano de mudanças no banco (`residencias/detalhado/*.json`). O banco está hoje fora de controle de versão (ver pendência arquitetural na story `lead-magnet-mini-mapa/1.1`). Este arquivo serve como rastro até o banco ser versionado adequadamente.

## 2026-05-21 — Correção HCFMUSP: campo `area` mal-formatado

**Arquivo afetado:** `detalhado/SP_lote4_hcfmusp.json`
**Instituição:** Hospital das Clínicas da Faculdade de Medicina da Universidade de São Paulo (HCFMUSP) — banca Interna, não-ENARE
**Escopo:** 35 entries / 93 vagas / 10 profissões

### Problema

Vagas do HCFMUSP estavam gravadas com `area` = nome do **sub-programa multiprofissional** (ex: `"Atenção Oncológica ao Adulto"`, `"Cardiologia e Pneumologia"`) em vez de `area` = nome da **profissão**. O campo `programa.nome` no JSON já indicava corretamente a profissão (ex: `"Enfermagem"`, `"Fisioterapia"`, `"Biomedicina Translacional"`).

Detectado pelo script `extract-mini-mapa.js` (no repo lead-magnet) via campo `subspec_nao_mapeada` do `DIVERGENCIAS.json` — as 9 áreas sujas geravam 93 vagas que não eram contabilizadas em nenhuma das 12 profissões alvo do Mini-Mapa.

### Regra de correção aplicada

```
SE inst.nome == "Hospital das Clínicas da Faculdade de Medicina da Universidade de São Paulo (HCFMUSP)"
   E vaga.area ∈ {
     "Atenção Oncológica ao Adulto",
     "Cardiologia e Pneumologia",
     "Cuidado ao Paciente Nefropata",
     "Gestão Integrada de Serviços de Saúde",
     "Hospitalar e Redes de Atenção à Saúde",
     "Neonatologia",
     "Pediatria com ênfase em Cardiopulmonar",
     "Saúde no Cuidado ao Paciente Crítico",
     "Urgência e Trauma"
   }
ENTÃO vaga.area := normalizar(programa.nome)
   onde normalizar:
     "Biomedicina Translacional" → "Biomedicina"
     "Farmácia Translacional"    → "Farmácia"
     <outros>                    → <programa.nome inalterado>
```

100% determinística (35/35 entries batem a regra). Zero ambiguidade.

### Distribuição das 93 vagas migradas por profissão

| Profissão | +vagas |
|---|---:|
| Enfermagem | 29 |
| Fisioterapia | 23 |
| Nutrição | 14 |
| Serviço Social | 6 |
| Terapia Ocupacional | 6 |
| Fonoaudiologia | 4 |
| Odontologia | 3 |
| Biomedicina | 3 |
| Farmácia | 3 |
| Psicologia | 2 |
| **TOTAL** | **93** |

### Outras alterações no mesmo arquivo

A vaga com `area="Nutrição Clínica"` (4 vagas no programa "Nutrição") **não foi tocada** — está corretamente classificada como subspecialidade de Nutrição via `SUBSPEC_TO_PARENT` no `extract-mini-mapa.js`. Reagregada para Nutrição automaticamente pelo script.

### Verificação

- Pré-correção: HCFMUSP/Enfermagem contava 0 vagas (todas mal-formatadas).
- Pós-correção: HCFMUSP/Enfermagem conta 29 vagas.
- Sanity: nenhuma das 9 DIRTY_AREAS permanece no HCFMUSP.
- Outros 24 lotes SP, e os 121 lotes não-SP, **não foram tocados**.
