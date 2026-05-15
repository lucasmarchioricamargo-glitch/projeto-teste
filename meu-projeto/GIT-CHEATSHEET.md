# Git — Cheatsheet do Lucas
> Referência rápida para o projeto Extensivo ENARE · Residência PRO

---

## Os 5 comandos do dia a dia

### 1. `git status` — "o que mudou desde a última foto?"

Roda sempre antes de qualquer outra coisa. Mostra o estado atual dos arquivos.

```bash
git status
```

**O que você vai ver no seu projeto:**

```
On branch feature/teste-coderabbit

Changes to be committed:        ← arquivos prontos para o commit (na moldura)
    new file: docs/extensivo-enare/pdfs/enfermagem-bloco-03-aula-02.pdf

Changes not staged for commit:  ← arquivos modificados, mas ainda fora da moldura
    modified: docs/extensivo-enare/branding/extensivo-enare-brand.md

Untracked files:                ← arquivos novos que o Git ainda não conhece
    docs/extensivo-enare/pdfs/enfermagem-bloco-03-aula-03.html
```

---

### 2. `git add` — "colocar na moldura antes de fotografar"

Escolhe quais arquivos vão entrar no próximo commit.

```bash
# Adicionar um arquivo específico
git add docs/extensivo-enare/pdfs/enfermagem-bloco-03-aula-02.pdf

# Adicionar uma pasta inteira
git add docs/extensivo-enare/pdfs/

# Adicionar tudo que mudou de uma vez (use com cuidado)
git add .
```

> **Dica:** prefira adicionar por arquivo ou pasta específica.
> O `git add .` pode incluir arquivos que você não queria salvar.

---

### 3. `git commit -m "mensagem"` — "tirar a foto com legenda"

Salva permanentemente no histórico os arquivos que estão na moldura.

```bash
git commit -m "feat: adiciona PDF Enfermagem Aula 02 — SAE fundamentos"
```

> Depois do `-m` vem a mensagem entre aspas. Ela é o título da foto.
> Sempre descreva **o que mudou** — não "fiz alterações".

---

### 4. `git log` — "ver o álbum de fotos"

Mostra o histórico de commits (versões salvas).

```bash
# Versão resumida — uma linha por commit (recomendada para o dia a dia)
git log --oneline

# Versão completa — mostra data, autor e mensagem completa
git log
```

**Como ler a saída do `--oneline`:**
```
a8b86da feat: identidade visual e PDF-piloto do Extensivo ENARE  ← commit mais recente
0337688 docs: adiciona roteiros de gravação completos do ENARE
c72784b fix: remove debug log
↑
ID único    Mensagem do commit
(7 letras)
```

---

### 5. `git diff` — "ver o que mudou antes de fotografar"

Mostra as alterações linha a linha em arquivos **ainda não adicionados** com `git add`.

```bash
# Ver todas as mudanças não salvas
git diff

# Ver mudança em um arquivo específico
git diff docs/extensivo-enare/branding/extensivo-enare-brand.md
```

**Quando usar:** antes de fazer um commit, para revisar o que vai entrar na foto.

---

## Fluxo completo para o projeto ENARE

O ciclo que você vai repetir sempre:

```
1. Trabalha no projeto (cria PDF, edita conteúdo, etc.)
         ↓
2. git status          → ver o que mudou
         ↓
3. git add <arquivo>   → escolher o que vai na foto
         ↓
4. git status          → confirmar que está certo
         ↓
5. git commit -m "..." → tirar a foto
         ↓
6. git log --oneline   → ver que o commit apareceu
```

---

## Quando fazer commit no projeto ENARE

| Momento | Exemplo de mensagem |
|---|---|
| Terminou um PDF de aula | `feat: PDF Enfermagem Aula 03 — SAE diagnóstico e intervenção` |
| Terminou um bloco inteiro | `feat: completa Bloco 03 Enfermagem — 18 PDFs` |
| Atualizou o design system | `feat: atualiza design system — ajusta espaçamento dos boxes` |
| Antes do Claude fazer mudança grande | `chore: snapshot antes de refatorar template dos PDFs` |
| Corrigiu erro em questão | `fix: Enfermagem Aula 01 Q3 — corrige alternativa D` |
| Aprovou versão final de um bloco | `release: Bloco 03 Enfermagem aprovado para produção` |

---

## Boas mensagens de commit

### Fórmula simples:
```
tipo: o que foi feito — onde / detalhes
```

### Tipos mais usados:
| Tipo | Quando usar |
|---|---|
| `feat:` | Adicionou algo novo (PDF, aula, bloco) |
| `fix:` | Corrigiu um erro (questão errada, gabarito, texto) |
| `docs:` | Atualizou documentação (cheatsheet, roteiro, branding) |
| `chore:` | Manutenção sem impacto no conteúdo (snapshot, reorganização) |
| `release:` | Versão aprovada e finalizada |

### Exemplos reais para o ENARE:

✅ **Bons:**
```
feat: PDF Enfermagem Aula 02 — SAE fundamentos e legislação
feat: adiciona box "Pega no ENARE" nas aulas 03 e 04
fix: Enfermagem Aula 01 Q1 — reformula distratores B e D
docs: atualiza branding book com paleta final aprovada
feat: completa Bloco 05 Fisioterapia — 20 PDFs e design system
chore: snapshot antes de migrar template de PDF para nova versão
```

❌ **Ruins:**
```
mudanças
fix
atualização
salvo
bloco feito
```

> **Regra de ouro:** leia a mensagem 6 meses depois e veja se entenderia o que foi feito sem abrir o arquivo.

---

## Como voltar atrás

### Ver o histórico (ponto de partida):
```bash
git log --oneline
```

### Ver o que mudou desde o último commit:
```bash
git diff
```

### Descartar mudanças em um arquivo (ANTES de fazer git add):
```bash
# Cuidado: apaga as mudanças não salvas no arquivo
git checkout -- docs/extensivo-enare/pdfs/enfermagem-bloco-03-aula-01.html
```

### Restaurar um arquivo de um commit anterior:
```bash
# Passo 1: descobrir o ID do commit que você quer
git log --oneline

# Passo 2: restaurar o arquivo daquele commit
git checkout a8b86da -- docs/extensivo-enare/pdfs/enfermagem-bloco-03-aula-01.pdf
#           ↑
#           ID do commit (substitua pelo real)
```

### Desfazer o último commit (mas manter os arquivos):
```bash
# Volta o commit, mas deixa os arquivos como estavam
git reset --soft HEAD~1
```

---

## O que NUNCA fazer

| Proibido | Por quê |
|---|---|
| Editar a pasta `.git` manualmente | É o banco de dados do Git — qualquer edição pode corromper tudo |
| Commitar arquivos `.env` | Contêm senhas e tokens — se for para nuvem, vaza para todo mundo |
| Commitar a pasta `node_modules/` | Tem milhares de arquivos pesados — o `.gitignore` já bloqueia isso |
| Usar `git push --force` | Sobrescreve o histórico remoto — pode apagar trabalho de outras pessoas |
| Fazer um commit gigante com tudo | Prefira commits pequenos e focados — mais fácil de entender e reverter |

---

## Referência rápida — tabela completa

| Comando | O que faz | Quando usar |
|---|---|---|
| `git status` | Ver o estado atual | Sempre, antes de qualquer coisa |
| `git add <arquivo>` | Preparar arquivo para commit | Depois de terminar uma parte |
| `git add .` | Preparar tudo de uma vez | Com cuidado — revise antes |
| `git commit -m "msg"` | Salvar no histórico | Depois do `git add` |
| `git log --oneline` | Ver histórico resumido | Para navegar nas versões |
| `git log` | Ver histórico completo | Para ver detalhes de cada commit |
| `git diff` | Ver o que mudou | Antes de fazer `git add` |
| `git diff --staged` | Ver o que está na moldura | Depois do `git add`, antes do commit |

---

*Criado em 2026-05-10 · Projeto Extensivo ENARE · Residência PRO*
