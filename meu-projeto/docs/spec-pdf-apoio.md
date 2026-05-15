# Spec — PDFs de Apoio das Aulas · Extensivo ENARE 2026

**Versão:** 1.0  
**Aprovado em:** 2026-05-12  
**Aplica-se a:** todos os 15 blocos (B0–B14), todas as aulas

---

## 1. Estrutura de Páginas por Aula

Cada PDF tem entre 9 e 11 páginas A4, nesta sequência fixa:

| Bloco | Páginas | Conteúdo |
|-------|---------|----------|
| **Bloco 1** — Capa | 1 | Logo, área, código da aula, título, subtítulo |
| **Bloco 2** — Objetivos de Aprendizagem | 1 | 3 objetivos de **conteúdo** + pré-requisito + metadados |
| **Bloco 3** — Conteúdo Principal | 2–4 | Teoria, tabelas, casos, comparativos textuais |
| **Bloco 4** — Como Usar o Bloco *(só Aula 01)* | 1 | Sequência de aulas; presente apenas na calibragem |
| **Bloco 5** — Questões de Fixação | 3 | Uma questão por página; gabarito comentado na mesma página |
| **Bloco 6** — Recuperação Ativa + Síntese | 1 | "Se esquecer tudo" + "Teste-se sem olhar" |
| **Bloco 7** — Referências + Anotações | 1 | Normativos e espaço de escrita |

**Total típico:** 10 páginas. Pode chegar a 11 em aulas com conteúdo mais denso.

---

## 2. Sistema Visual

**Referência de identidade:** `docs/extensivo-enare/branding/extensivo-enare-brand.md`  
**Referência de código:** `docs/extensivo-enare/pdfs/enfermagem-bloco-03-aula-01.html` (piloto aprovado)

| Elemento | Valor |
|----------|-------|
| Fundo de página | `#F6F4ED` (creme) |
| Acento principal | `#0D8A8D` (teal) |
| Verde primário | `#1F5C23` (verde-floresta) |
| Destaque | `#C6D834` (verde-lima) |
| Tipografia corpo | Bricolage Grotesque |
| Títulos | Barlow Condensed 700/800 |
| Logo | Playfair Display italic + Barlow Condensed 800 + Space Grotesk Light |

**Boxes de destaque:**
- `.box-pega` (verde-lima) — armadilhas e pegadinhas da banca
- `.box-dica` (teal) — estratégia e dica de prova
- `.box-conceito` (verde-floresta) — conceito central da aula

---

## 3. Princípios de Produção

### Princípio 1 — Análise é fundação, não conteúdo

A análise de banca (Fase 2 — `docs/extensivo-enare/estudo-banca-fgv/`) orienta o que entra na aula e em que ordem de importância. Ela **não** vira tema de página, gráfico de barras ou tabela comparativa entre edições.

Quando a calibragem precisar sinalizar relevância de um tema, usar no máximo uma frase dentro do Bloco 2 ou Bloco 3:

> *"Este tema está no foco das últimas edições do ENARE."*

Sem percentuais, sem variações em pontos percentuais, sem comparações numéricas ano-a-ano no corpo da aula.

### Princípio 2 — Toda questão do PDF tem que poder cair no ENARE

Se a FGV nunca formularia aquela questão, o PDF não a inclui.

**Proibido nos Blocos 5 e 6:**
- Questões sobre estatística de banca
- Questões sobre percentual de mudança cognitiva entre edições
- Questões sobre qual tema lidera em frequência histórica
- Qualquer meta-informação sobre o curso ou a prova

**Critério de validação:** ao escrever cada questão, perguntar — *"essa questão poderia aparecer no ENARE tal como está?"* Se a resposta for não, reescrever ou trocar.

### Princípio 3 — Calibragem ensina a lógica da banca através do conteúdo

A Aula 01 de cada bloco é a aula de calibragem. Ela apresenta a lógica da banca **através** de conteúdos fundacionais da área — não em substituição a eles.

Para mostrar como a banca cobra hoje: usar dois exemplos de enunciado lado a lado (pergunta direta × cenário aplicado), **sem tabela de variação ou percentuais**.

---

## 4. Política de Questões (Bloco 5)

- **3 questões por aula**, uma por página
- **Questão 1:** tema central da aula, progressão M/C
- **Questão 2:** mesmo tema ou tema relacionado, nível Ap (caso clínico ou institucional)
- **Questão 3 — "Questão-âncora":** formato de caso prático no padrão FGV-2025 — cenário completo com identificação de princípio, conduta ou normativo aplicado ou violado. Obrigatória em todas as aulas
- **Gabarito comentado:** na mesma página, após as alternativas. Cada distrator tem sua explicação específica
- **Proibido:** questões sobre estatística de banca, rankings de frequência, percentuais de variação, meta-informação sobre o curso

---

## 5. Bloco 2 — Objetivos de Aprendizagem

Os 3 objetivos descrevem o que o aluno vai **saber fazer** após a aula em termos de conteúdo do edital ENARE — não o que vai aprender sobre a banca, o curso ou o método.

**Proibido:** objetivos do tipo "entender como a FGV cobra", "reconhecer a virada cognitiva", "mapear os temas por frequência". Esses são meta-objetivos sobre o curso, não objetivos de conteúdo.

**Correto:** "Aplicar os princípios doutrinários do SUS para identificar violações em cenários clínicos" / "Distinguir os atributos da APS em questões de caso no padrão FGV".

---

## 6. Bloco 6 — Recuperação Ativa

**"Se esquecer tudo, lembre disto"** — 3 frases-síntese de conteúdo da aula (não sobre a banca; sobre o que foi ensinado)

**"Teste-se sem olhar"** — 3 a 5 perguntas curtas de recuperação ativa
- Sem gabarito visível na mesma página
- Formato: pergunta direta, resposta esperada de 1 a 2 frases
- Testa os conceitos centrais da aula, não detalhes periféricos

---

## 7. Aulas de Calibragem (Aula 01 de cada bloco)

- Calibragem não é ausência de conteúdo. A Aula 01 apresenta a lógica da banca **através** dos conteúdos fundacionais
- Inclui o Bloco 4 (sequência de aulas do bloco) — única aula do bloco com esse bloco
- **Proibido no corpo da aula:** tabelas estatísticas com percentuais por edição, gráficos de barras por frequência de tema, comparativos numéricos ano-a-ano
- Para mostrar como a banca cobra: dois exemplos de enunciado lado a lado (pergunta direta × cenário aplicado), sem tabela de variação

---

## 8. Regra do Aluno Ansioso

Ao revisar cada PDF antes de commitar, perguntar:

> *"Se o aluno tem 10 minutos para folhear esta aula antes da prova, quanto desse tempo ele gasta vendo conteúdo que pode cair vs. informação sobre o curso ou a banca?"*

Se a proporção não for de pelo menos **70% conteúdo**, refazer.

---

## 9. Nomenclatura de Arquivos

```
{area-kebab-case}-bloco-{codigo}-aula-{nn}.html
```

Exemplos:
- `competencias-gerais-bloco-b0-aula-01.html`
- `enfermagem-bloco-b4-aula-02.html`
- `saude-coletiva-bloco-b12-aula-03.html`

---

## 10. Fluxo de Aprovação

1 aula por vez — commitar somente após "aprovado" do Lucas.  
Cada commit isolado com mensagem: `docs: PDF {Área} Bloco {Bn} Aula {nn} [Extensivo ENARE 2026]`
