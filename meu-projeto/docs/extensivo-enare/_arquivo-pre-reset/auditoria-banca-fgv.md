# Auditoria de Cobertura — Estudo de Banca FGV/ENARE

**Data da auditoria:** 2026-05-10  
**Auditora:** Claude Code (solicitado por Lucas Marchiori)  
**Escopo:** Todos os artefatos do Extensivo ENARE em `docs/extensivo-enare/`

---

## Resumo Executivo

O estudo de banca que fundamentou a curadoria do Extensivo ENARE **cobre exclusivamente o ENARE 2025/2026** (prova de 19/10/2025). A edição ENARE 2024/2025 (primeira da FGV) **não é mencionada em nenhum artefato do projeto**. Não existe documento de estudo de banca como artefato isolado — o "perfil da FGV" foi construído de forma implícita, embutido nos roteiros e no PDF piloto, sem rastreabilidade metodológica. A distribuição de questões no PDF piloto é rotulada como "estimada", sinalizando ausência de contagem sistematizada. O critério de aceitação definido nesta tarefa **não é atendido** em nenhum dos 4 requisitos. O bloqueio imediato ao piloto é a tabela de distribuição de temas (página 5 do PDF), cuja base de dados é incompleta e não verificável.

---

## 1. Auditoria dos Artefatos

### Artefatos localizados com menção a estudo de banca FGV/ENARE

| Artefato | Tipo | Edições analisadas (declaradas) | Metodologia explícita? |
|---|---|---|---|
| `fase-1-linhas-gerais.md` | Documento de escopo | Apenas ENARE 2025 (`**Banca de referência:** FGV/EBSERH (ENARE 2025)`) | Não |
| `roteiros/bloco-03-enfermagem.md` | Roteiro de gravação | Apenas ENARE 2025 (`baseada no ENARE 2025`, linha 54) | Não |
| `roteiros/bloco-00-sus.md` | Roteiro de gravação | FGV genérica, sem citar edição | Não |
| `pdfs/enfermagem-bloco-03-aula-01.html` | PDF piloto | Apenas ENARE 2025 (`Com base nas questões do ENARE 2025`, linha 814) | Não — tabela rotulada como "estimada" |
| Demais roteiros (blocos 01–02, 04–12) | Roteiros de gravação | FGV genérica, sem citar edição | Não |

**Nenhum documento de estudo de banca dedicado** (ex.: análise de gabaritos, mapeamento de questões por tema, comparação de edições) foi encontrado no projeto.

---

### Análise detalhada por critério

#### 1.1 Edições do ENARE-FGV analisadas

| Edição | Mencionada? | Prova analisada? | Gabarito presente no projeto? |
|---|---|---|---|
| ENARE 2024/2025 (1ª FGV) | ❌ Não | ❌ Não | ❌ Não |
| ENARE 2025/2026 (2ª FGV) | ✅ Sim (por nome) | ⚠️ Implícita, sem metodologia | ❌ Não |

#### 1.2 Referência às URLs oficiais das provas

| URL | Presente em algum artefato? |
|---|---|
| `https://mapa-vagas-enare-ebserh.conhecimento.fgv.br/provas-gabaritos-multiuni.html` (2024/2025) | ❌ Ausente |
| `https://enare2025-ebserh.conhecimento.fgv.br/` (2025/2026) | ❌ Ausente |

Nenhuma URL oficial de prova ou gabarito é referenciada em qualquer documento do projeto.

#### 1.3 Análise comparativa entre edições

Inexistente. Nenhum artefato menciona:
- Diferenças de formato entre as duas edições FGV
- O fato de que a edição 2024/2025 teve duas fases (objetiva + análise curricular)
- O cancelamento da análise curricular e sua implicação metodológica
- Peso por área em cada edição
- Temas recorrentes vs. temas que apareceram apenas em uma edição

#### 1.4 Rastreabilidade das "incidências" declaradas

Cada bloco do `fase-1-linhas-gerais.md` contém uma seção `**Tópicos de alta incidência (FGV):**`. Esses tópicos **não têm fonte citada**, número de questões, nem ano de referência. São afirmações sem evidência documental no projeto.

O PDF piloto declara explicitamente: *"Com base nas questões do ENARE 2025 (FGV/EBSERH), a distribuição estimada para Enfermagem é:"* — a palavra **"estimada"** é um sinal de que não houve contagem real de todas as questões da prova.

A seção de referências do PDF cita: `FUNDAÇÃO GETULIO VARGAS (FGV). ENARE 2025 — Exame Nacional de Residência Multiprofissional em Saúde. Rio de Janeiro: EBSERH/FGV, 2025. [Prova e gabarito oficial].` — formato de citação bibliográfica genérica, sem evidência de que o arquivo foi obtido e analisado.

---

## 2. Diagnóstico de Lacunas

### ✅ Coberto adequadamente

| Item | Evidência |
|---|---|
| Estrutura formal do ENARE 2025/2026 (100 questões, 20 SUS + 80 específicas, 5h) | `fase-1-linhas-gerais.md`, linhas 11–19 |
| Reconhecimento de que FGV usa raciocínio clínico, não memorização | `enfermagem-bloco-03-aula-01.html`, linhas 706–717 |
| Identificação de FGV como banca atual (desde 2021 per PDF piloto) | `enfermagem-bloco-03-aula-01.html`, linha 702 |

### ⚠️ Coberto parcialmente

| Item | Problema |
|---|---|
| Tópicos de alta incidência por profissão | Presentes para todos os 13 blocos, mas baseados apenas em ENARE 2025/2026 (implícito) e sem rastreabilidade |
| Perfil da banca FGV | Caracterizado no PDF piloto (raciocínio clínico, cenários SUS), mas sem análise comparativa de estilo entre edições |
| Distribuição de questões por área (Enfermagem) | Presente no PDF, mas rotulada como "estimada" — não verificável |

### ❌ Ausente

| Lacuna | Detalhe |
|---|---|
| Mapeamento da prova ENARE 2024/2025 | Nenhuma questão, nenhuma referência, nenhum gabarito |
| Mapeamento da prova ENARE 2025/2026 com contagem real | Distribuição "estimada", sem evidência de análise questão a questão |
| Análise comparativa entre as duas edições FGV | Inexistente |
| Identificação de padrões estáveis vs. variáveis | Inexistente — impossível sem duas edições analisadas |
| Justificativa pedagógica rastreável para priorização de temas | Os critérios de prioridade não têm origem documentada |
| Documento de estudo de banca como artefato isolado e auditável | Inexistente |
| Arquivos de prova/gabarito de qualquer edição | Inexistentes no projeto |
| Registro do cancelamento da análise curricular 2024/2025 e implicações | Inexistente |

### 🎯 Impacto pedagógico estimado por lacuna

| Lacuna | Impacto | Bloqueante? |
|---|---|---|
| Ausência do ENARE 2024/2025 | **ALTO.** Temas recorrentes em ambas as edições são os que o produto deve cobrir com mais profundidade. Sem a 2024/2025, não há como distinguir recorrência de coincidência — a priorização de temas pode estar errada. | Sim — bloqueia confiança na curadoria |
| Distribuição "estimada" no PDF piloto | **ALTO.** A tabela de distribuição de temas por área (página 5 do PDF) é a promessa principal da Aula 1 ao aluno. Se os percentuais são estimativas sem base, o aluno está recebendo dados potencialmente incorretos como fato. | Sim — bloqueia o piloto como produto final |
| Ausência de padrões estáveis vs. variáveis | **ALTO.** Sem esse mapeamento, não há como saber quais aulas têm risco de ser mal calibradas (conteúdo em excesso para temas pouco cobrados, ou vice-versa). | Sim — bloqueia a curadoria de carga horária |
| Ausência de justificativa pedagógica documentada | **MÉDIO.** Internamente crítico para revisões futuras e para comunicação com professores convidados. Não bloqueia o aluno imediatamente, mas cria dívida técnica. | Não |
| Impacto estrutural do cancelamento da análise curricular | **BAIXO-MÉDIO.** Relevante para entender por que o ENARE 2025/2026 é fase única, mas não muda o conteúdo das aulas. | Não |

---

## 3. Plano de Remediação

### Prioridade 1 — Blocante do piloto (executar antes de validar o PDF como produto final)

**O quê:** Construir a tabela real de distribuição de questões do ENARE 2025/2026 para Enfermagem.

**Como:**
1. Baixar a prova e o gabarito oficial da edição 2025/2026 via `https://enare2025-ebserh.conhecimento.fgv.br/`
2. Classificar as 80 questões de Enfermagem por área temática (usando as categorias já definidas no PDF: Saúde Coletiva/APS, SAE/PE, Urgência/Emergência, etc.)
3. Calcular percentuais reais e substituir "distribuição estimada" por "distribuição real — ENARE 2025"
4. Atualizar a tabela no `enfermagem-bloco-03-aula-01.html` (e no `.pdf` exportado)

**Agente:** `@analyst` (classifica questões) + `@dev` (atualiza o HTML/PDF)

---

### Prioridade 2 — Blocante da curadoria (executar antes de gravar ou publicar qualquer bloco)

**O quê:** Realizar o estudo de banca completo com as duas edições FGV e produzir um documento de análise comparativa.

**Como:**
1. Baixar prova e gabarito do ENARE 2024/2025 via `https://mapa-vagas-enare-ebserh.conhecimento.fgv.br/provas-gabaritos-multiuni.html`
2. Baixar prova e gabarito do ENARE 2025/2026 via `https://enare2025-ebserh.conhecimento.fgv.br/`
3. Para cada profissão coberta pelo Extensivo, mapear as 80 questões de cada edição por área temática
4. Para o SUS/Tronco Comum, mapear as 20 questões de cada edição por disciplina
5. Produzir o documento `docs/extensivo-enare/estudo-banca-fgv/analise-comparativa.md` com:
   - Tabela: peso por área, edição 2024/2025 vs. 2025/2026
   - Lista de temas recorrentes (presentes nas duas edições)
   - Lista de temas variáveis (apareceram em apenas uma)
   - Padrões estáveis de estilo de enunciado e tipo de distrator
6. Atualizar a seção `**Tópicos de alta incidência (FGV):**` de cada bloco em `fase-1-linhas-gerais.md` com base na análise real, adicionando a coluna de edições em que cada tema apareceu

**Agente:** `@analyst` (mapeamento e classificação) → revisão por `@pm` (validação pedagógica)

**Profissões a priorizar** (pelo volume de candidatos e impacto do piloto):
1. Enfermagem ⭐ — piloto já em produção, bloqueante imediato
2. SUS/Tronco Comum ⭐ — base de todos os blocos
3. Fisioterapia ⭐ — área da Camila Nara
4. Psicologia e Serviço Social ⚠️ — alta sensibilidade editorial

---

### Prioridade 3 — Melhoria incremental (não bloqueia produção, mas reduz risco)

**O quê:** Documentar as implicações metodológicas da estrutura de duas fases do ENARE 2024/2025.

**Como:**
1. Registrar em `docs/extensivo-enare/estudo-banca-fgv/historico-formato.md`:
   - Linha do tempo do ENARE com bancas (pré-FGV e pós-FGV)
   - Mudanças de formato entre 2024/2025 (objetiva + análise curricular) e 2025/2026 (fase única)
   - Por que a análise curricular foi cancelada e o que isso sinaliza sobre a direção do exame
2. Usar este registro para calibrar o risco editorial das áreas sensíveis (Psicologia, Serviço Social), que podem ter sido avaliadas de forma diferente na análise curricular

**Agente:** `@analyst`

---

## 4. Critério de Aceitação

O estudo de banca **não será considerado completo** até que existam, no projeto, os seguintes artefatos com evidência verificável:

| Critério | Status atual | Evidência necessária |
|---|---|---|
| Mapeamento de TODAS as questões do ENARE 2024/2025 | ❌ Ausente | Arquivo com 80q × profissão classificadas por área + 20q SUS classificadas por disciplina |
| Mapeamento de TODAS as questões do ENARE 2025/2026 | ❌ Ausente (distribuição estimada, não contada) | Mesmo formato acima, com percentuais reais substituindo os estimados |
| Análise comparativa de peso por grande área entre as duas edições | ❌ Ausente | Tabela comparativa com delta entre edições por profissão |
| Padrões estáveis (recorrentes nas duas) vs. variáveis (só em uma) | ❌ Ausente | Lista anotada com classificação estável/variável por tema |
| Justificativa pedagógica documentada para priorização das aulas | ❌ Ausente | Seção "Critério de priorização" em `fase-1-linhas-gerais.md` com referência ao estudo de banca |

**Status geral:** 0 de 5 critérios atendidos.

---

*Auditoria conduzida com base nos artefatos presentes em `docs/extensivo-enare/` em 2026-05-10. Nenhuma conclusão foi inferida além do que está documentado — ausências foram registradas como lacunas, não como cobertura implícita.*
