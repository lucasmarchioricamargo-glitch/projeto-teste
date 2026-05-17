# EPIC-001 — Lead Magnet "Mini-Mapa das Residências" v1

**Status:** Draft
**Owner:** @pm (Morgan)
**Created:** 2026-05-17
**Branch:** `feature/servico-social-bloco-b13` (a migrar para `feature/lead-magnet-v1` antes de iniciar a Story 1.1)
**Estimated Effort:** 2–3 semanas (Fase 1 da arquitetura geral do funil)

---

## 1. Contexto Estratégico

A **Elite Treinamentos em Saúde** (vertical ativa: Residência PRO) precisa transformar 162k views/mês no Instagram em uma base de leads automatizada. Hoje a captura é manual (Camila responde DM 1x1), a base não escala e o funil não tem produto de entrada gratuito.

Esta epic produz o lead magnet **Mini-Mapa das Residências** — um recorte gratuito do banco de dados JSON já existente (27 estados, 160 arquivos, 12 profissões cobertas) — entregue como PDF segmentado por profissão via Instagram → ManyChat → Email → sequência de nutrição → Curso R$197.

> Análise estratégica completa: handoff de @analyst (Atlas) + @funnel-architect (Finn) registrado nesta conversa em 2026-05-17.

## 2. Decisões Firmadas

| # | Decisão | Justificativa |
|---|---|---|
| D1 | Mini-Mapa segmentado por profissão (12 PDFs) | Personalização aumenta percepção de valor + permite gatilho ManyChat por profissão |
| D2 | Recorte: top 20 programas + calendário ENARE 2026 | Filtro > volume. 27 estados completos = paralisia. Top 20 = consumível |
| D3 | Promessa central: economia de tempo + risco de perder edital | Não promete aprovação (responsabilidade) |
| D4 | 3 níveis de produto: Free / R$47 / Bônus | Mini-Mapa free (TOFU) ≠ Mapa completo R$47 (tripwire) ≠ Mapa bônus do Curso/Mentoria |
| D5 | Design manual Canva/Figma | Visual premium > automação. Branding Camila Nara já definido |
| D6 | Captura via Instagram + ManyChat (sem LP nesta fase) | Aproveita audiência existente, zero tráfego pago. LP fica para FASE 3 |
| D7 | 5 palavras-gatilho ManyChat | MAPAENFERMAGEM / MAPAFISIO / MAPANUTRICAO / MAPAPSICOLOGIA + MAPA genérico |
| D8 | Sequência de 7 emails em 14 dias | Briefing Finn; copy @conversion-copywriter (Rex) |
| D9 | Camila adiciona CTA `MAPA{PROFISSÃO}` nos carrosséis | Extensão do protocolo R1 já em uso |

## 3. Objetivos Mensuráveis (KPIs Fase 1)

| KPI | Meta v1 | Meta otimizada |
|---|---|---|
| Comentários gerados por views | 0.3% (≈490/mês) | 1% (≈1.620/mês) |
| Taxa de captura DM → email | 60% | 75% |
| Taxa email → Curso (14 dias) | 2% | 5–8% |
| Cross-sell Mini-Mapa → Mapa R$47 | 3% | 8% |
| Receita adicional projetada Fase 1 | R$4.300/mês | R$15k+/mês |

## 4. Critérios de Aceitação do Epic

1. ✅ 12 PDFs (1 por profissão) gerados a partir do banco JSON, com top 20 programas + calendário 2026
2. ✅ Conta MailerLite criada com 12 listas segmentadas por profissão
3. ✅ ManyChat configurado com 5 palavras-gatilho ativas
4. ✅ Sequência de 7 emails de nutrição programada e testada
5. ✅ PDFs hospedados em CDN/Drive com URLs estáveis
6. ✅ Link da bio atualizado com Mini-Mapa + Curso
7. ✅ Camila treinada para incluir CTA `MAPA{PROFISSÃO}` em carrosséis novos
8. ✅ Primeiro lead capturado end-to-end (smoke test)

## 5. Stories da Epic

| ID | Título | Owner | Esforço | Bloqueada por |
|---|---|---|---|---|
| 1.1 | Pipeline de Dados (top 20 por profissão) | @dev | 2h | — |
| 1.2 | Design Template Master + 12 PDFs | @ux-design-expert | 2 dias | 1.1 |
| 1.3 | Infraestrutura de Email (MailerLite) | @dev | 1h | — |
| 1.4 | Captura Automatizada (ManyChat) | @dev | 2h | 1.3 |
| 1.5 | Sequência de Nutrição (7 emails) | @conversion-copywriter + @dev | 1 dia | 1.2, 1.3 |
| 1.6 | Distribuição (host, bio, CTA Camila) | @dev + Camila | 1h | 1.2, 1.4 |

## 6. Caminho Crítico

```
1.1 ─┐
     ├─→ 1.2 ─┐
     │       ├─→ 1.5 ─→ 1.6 → 🟢 Magnet em produção
1.3 ─┴─→ 1.4 ─┘
```

## 7. Dependências e Pré-requisitos

| Pré-requisito | Status | Owner |
|---|---|---|
| Banco JSON 27 estados | ✅ Concluído (2026-05-03) | — |
| Branding book Camila Nara (paleta + tipografia) | ✅ Documentado em memória | — |
| Acesso à conta Instagram/ManyChat da Camila | ⚠️ Verificar | Lucas |
| Permissão para alterar link da bio | ⚠️ Verificar | Lucas |
| Acordo com Camila sobre CTA `MAPA{PROFISSÃO}` | ✅ Confirmado nesta sessão | — |

## 8. Fora de Escopo (vai para epics futuros)

- **EPIC-002 — Tráfego Pago (FASE 3):** Pixel Meta corrigido (T9), LP de captura standalone, campanha Lead R$30–50/dia, retargeting
- **EPIC-003 — Mapa R$47 v2 (Web App):** Migração do banco JSON para app web filtrável com notificações
- **EPIC-004 — Mentoria Upsell Automation:** Formulário Typeform/Tally + sequência pós-Curso

## 9. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Edital ENARE 2026 atrasa → conteúdo desatualizado | Média | Alto | Datas ENARE 2025 ainda referência. Adicionar disclaimer "atualização prevista para junho/2026" |
| Camila esquece de incluir CTA | Alta | Médio | Checklist anexado ao Notion/post-it. Template de card final pronto |
| ManyChat tem limite gratuito de contatos | Média | Médio | Verificar plano. Migrar para plano pago se cruzar 1k contatos |
| Mini-Mapa canibaliza Mapa R$47 | Aceito | Baixo | Aceito como trade-off (1 venda em 4 meses do R$47 standalone) |

## 10. Definition of Done (Epic)

- Todas as 6 stories com status `Done`
- Smoke test ponta-a-ponta executado com sucesso (1 lead real capturado e nutrido)
- Memória do projeto Elite Treinamentos atualizada com novo status da Fase 1
- Handoff para @pm preparar EPIC-002 (Tráfego Pago) com pré-requisitos validados

---

## Change Log

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 2026-05-17 | 1.0 | Epic criada a partir de handoff @analyst + @funnel-architect | @pm (Morgan) |
