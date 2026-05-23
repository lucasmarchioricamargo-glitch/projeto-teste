'use strict';
/**
 * Testes do pipeline extract-mini-mapa.js (Story 1.1).
 *
 * Cobre 6 cenários focados nas decisões frágeis do produto:
 *   1. Idempotência (AC5)
 *   2. Reagregação subspec→parent — incluindo regressão UFRGS (v1.4):
 *      _total_vagas e ranking refletem total reagregado, area original preservada
 *   3. Filtro 12 profissões: OUT_OF_SCOPE_AREAS silencia sem reportar
 *   4. Filtro 12 profissões: área não-mapeada vira subspec_nao_mapeada
 *   5. Score ranking 70/30 (vagas/ENARE), sem componente geográfico (AC3 v1.3)
 *   6. Falha controlada: RESIDENCIAS_DATA_DIR ausente → exit !=0
 *
 * Runner: node --test (built-in, Node 18+).
 * Uso:
 *   node --test scripts/__tests__/extract-mini-mapa.test.js
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

const SCRIPT_PATH = path.resolve(__dirname, '..', 'extract-mini-mapa.js');

const PROFS_12 = [
  'Biomedicina', 'Educação Física', 'Enfermagem', 'Farmácia', 'Fisioterapia',
  'Fonoaudiologia', 'Medicina Veterinária', 'Nutrição', 'Odontologia',
  'Psicologia', 'Serviço Social', 'Terapia Ocupacional'
];

// ============================================================================
// Helpers
// ============================================================================

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'extract-mini-mapa-test-'));
}

function writeFixture(dataDir, estados) {
  fs.mkdirSync(path.join(dataDir, 'detalhado'), { recursive: true });
  const indexEstados = [];
  for (const est of estados) {
    const arquivos = [];
    for (const lote of (est.lotes || [])) {
      fs.writeFileSync(
        path.join(dataDir, 'detalhado', lote.fname),
        JSON.stringify({ estado: est.uf, instituicoes: lote.instituicoes }, null, 2)
      );
      arquivos.push(lote.fname);
    }
    const resumoFname = `${est.uf}_resumo.json`;
    fs.writeFileSync(
      path.join(dataDir, 'detalhado', resumoFname),
      JSON.stringify({
        estado: est.uf,
        total_vagas_por_profissao: est.resumo || {}
      }, null, 2)
    );
    indexEstados.push({ sigla: est.uf, arquivos, resumo: resumoFname });
  }
  fs.writeFileSync(
    path.join(dataDir, 'index.json'),
    JSON.stringify({ estados: indexEstados }, null, 2)
  );
}

/** Baseline: 1 UF com 1 inst tendo 1 vaga em cada das 12 profs.
 *  Necessário porque o script aborta se uma das 12 profissões alvo está ausente. */
function baselineEstado() {
  return {
    uf: 'ZZ',
    lotes: [{
      fname: 'ZZ_lote1.json',
      instituicoes: [{
        nome: 'Inst Baseline ZZ',
        cidade: 'Cidade ZZ',
        edital: { banca: 'ENARE', link: 'http://baseline.test', inscricao_inicio: '01/01/2026', inscricao_fim: '01/02/2026', prova: '01/03/2026' },
        programas: PROFS_12.map(p => ({
          nome: `Programa ${p}`,
          vagas: [{ area: p, quantidade: 1 }]
        }))
      }]
    }],
    resumo: Object.fromEntries(PROFS_12.map(p => [p, 1]))
  };
}

function runScript(dataDir, extraEnv = {}) {
  return spawnSync('node', [SCRIPT_PATH], {
    env: { ...process.env, RESIDENCIAS_DATA_DIR: dataDir, ...extraEnv },
    encoding: 'utf8'
  });
}

function readOutput(dataDir, slug) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, 'mini-mapa', `mini-mapa-${slug}.json`), 'utf8'));
}

function readDiverg(dataDir) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, 'mini-mapa', 'DIVERGENCIAS.json'), 'utf8'));
}

function cleanup(dataDir) {
  try { fs.rmSync(dataDir, { recursive: true, force: true }); } catch {}
}

// ============================================================================
// Test 1: idempotência (AC5)
// ============================================================================

test('1. idempotência — 2 runs consecutivos produzem output byte-idêntico', () => {
  const dataDir = makeTmpDir();
  try {
    writeFixture(dataDir, [baselineEstado()]);

    const r1 = runScript(dataDir);
    assert.equal(r1.status, 0, `1º run falhou: ${r1.stderr}`);

    const outDir = path.join(dataDir, 'mini-mapa');
    const snap1 = {};
    for (const f of fs.readdirSync(outDir)) {
      snap1[f] = fs.readFileSync(path.join(outDir, f), 'utf8');
    }

    const r2 = runScript(dataDir);
    assert.equal(r2.status, 0, `2º run falhou: ${r2.stderr}`);

    const snap2 = {};
    for (const f of fs.readdirSync(outDir)) {
      snap2[f] = fs.readFileSync(path.join(outDir, f), 'utf8');
    }

    // Mesmo conjunto de arquivos
    assert.deepEqual(
      Object.keys(snap1).sort(),
      Object.keys(snap2).sort(),
      'lista de arquivos diverge entre runs'
    );

    // Conteúdo byte-idêntico
    for (const f of Object.keys(snap1)) {
      assert.equal(snap2[f], snap1[f], `${f} difere entre runs`);
    }

    // data_extracao deve derivar de max(mtime), não da hora de execução
    const enf1 = JSON.parse(snap1['mini-mapa-enfermagem.json']);
    const enf2 = JSON.parse(snap2['mini-mapa-enfermagem.json']);
    assert.equal(enf2.data_extracao, enf1.data_extracao, 'data_extracao mudou entre runs');
  } finally {
    cleanup(dataDir);
  }
});

// ============================================================================
// Test 2: reagregação subspec→parent + total no score (regressão UFRGS v1.4)
// ============================================================================

test('2. reagregação subspec→parent — vagas, area original e ranking refletem total reagregado', () => {
  const dataDir = makeTmpDir();
  try {
    // 2 inst MedVet na UF "RR":
    //   Inst A: 1 vaga area="Medicina Veterinária" + 3 vagas area="Anestesiologia Veterinária" = 4 vagas
    //   Inst B: 3 vagas area="Medicina Veterinária" exact
    // Esperado: A (4v) rank ACIMA de B (3v) — prova que score usa total reagregado.
    // O programa.nome "Saúde Coletiva" é deliberadamente NÃO uma das 12 profs nem subspec —
    // confirma que mapping usa SÓ area, NÃO programa.nome (regra crítica AC9).
    writeFixture(dataDir, [
      baselineEstado(),
      {
        uf: 'RR',
        lotes: [{
          fname: 'RR_lote1.json',
          instituicoes: [
            {
              nome: 'Inst A — reagregada',
              cidade: 'Cidade RR',
              edital: { banca: 'ENARE', link: 'http://A', inscricao_inicio: '', inscricao_fim: '', prova: '' },
              programas: [
                {
                  nome: 'Saúde Coletiva',
                  vagas: [{ area: 'Medicina Veterinária', quantidade: 1 }]
                },
                {
                  nome: 'Saúde Coletiva',
                  vagas: [{ area: 'Anestesiologia Veterinária', quantidade: 3 }]
                }
              ]
            },
            {
              nome: 'Inst B — só exact',
              cidade: 'Cidade RR',
              edital: { banca: 'ENARE', link: 'http://B', inscricao_inicio: '', inscricao_fim: '', prova: '' },
              programas: [{
                nome: 'Programa MedVet',
                vagas: [{ area: 'Medicina Veterinária', quantidade: 3 }]
              }]
            }
          ]
        }],
        resumo: { 'Medicina Veterinária': 4 }
      }
    ]);

    const r = runScript(dataDir);
    assert.equal(r.status, 0, `script falhou: ${r.stderr}`);

    const mm = readOutput(dataDir, 'medicina-veterinaria');

    const instA = mm.instituicoes.find(i => i.nome === 'Inst A — reagregada');
    assert.ok(instA, 'Inst A não está no top 20 de MedVet');

    // (a) Total reagregado: soma das vagas em programas[] deve ser 4 (1 exact + 3 subspec)
    const totalA = instA.programas.reduce((s, p) => s + p.vagas, 0);
    assert.equal(totalA, 4,
      `regressão UFRGS: Inst A deveria ter 4 vagas (1 exact + 3 subspec), mas tem ${totalA}`);

    // (b) Areas preservadas: subspec "Anestesiologia Veterinária" NÃO foi reescrita pra "Medicina Veterinária"
    const areas = instA.programas.map(p => p.area).sort();
    assert.ok(areas.includes('Anestesiologia Veterinária'),
      `area original da subspec foi reescrita; areas presentes: ${JSON.stringify(areas)}`);
    assert.ok(areas.includes('Medicina Veterinária'),
      `area exact ausente; areas presentes: ${JSON.stringify(areas)}`);

    // (c) Ranking usa total reagregado: A (4v) acima de B (3v)
    const instB = mm.instituicoes.find(i => i.nome === 'Inst B — só exact');
    assert.ok(instB, 'Inst B não está no top 20');
    assert.ok(instA.rank < instB.rank,
      `regressão UFRGS: Inst A reagregada (rank ${instA.rank}) deveria estar acima de Inst B exact (rank ${instB.rank})`);
  } finally {
    cleanup(dataDir);
  }
});

// ============================================================================
// Test 3: OUT_OF_SCOPE_AREAS silencia sem reportar
// ============================================================================

test('3. filtro 12 profissões — OUT_OF_SCOPE_AREAS silencia sem entrar em mini-mapa nem em divergencias', () => {
  const dataDir = makeTmpDir();
  try {
    writeFixture(dataDir, [
      baselineEstado(),
      {
        uf: 'XX',
        lotes: [{
          fname: 'XX_lote1.json',
          instituicoes: [{
            nome: 'Inst out-of-scope',
            cidade: 'Cidade XX',
            edital: { banca: 'ENARE', link: 'http://X', inscricao_inicio: '', inscricao_fim: '', prova: '' },
            programas: [{
              nome: 'Saúde da Família',
              vagas: [{ area: 'Saúde da Família', quantidade: 5 }] // OUT_OF_SCOPE_AREAS
            }]
          }]
        }],
        resumo: {}
      }
    ]);

    const r = runScript(dataDir);
    assert.equal(r.status, 0, `script falhou: ${r.stderr}`);

    // (a) Inst NÃO aparece em nenhum dos 12 mini-mapas
    const outDir = path.join(dataDir, 'mini-mapa');
    const miniMapaFiles = fs.readdirSync(outDir).filter(f => f.startsWith('mini-mapa-') && f.endsWith('.json'));
    for (const f of miniMapaFiles) {
      const mm = JSON.parse(fs.readFileSync(path.join(outDir, f), 'utf8'));
      const found = mm.instituicoes.find(i => i.nome === 'Inst out-of-scope');
      assert.equal(found, undefined, `Inst out-of-scope vazou em ${f}`);
    }

    // (b) NÃO entra em subspec_nao_mapeada (porque está em OUT_OF_SCOPE_AREAS)
    const div = readDiverg(dataDir);
    const inDirty = div.subspec_nao_mapeada.find(e => e.area === 'Saúde da Família');
    assert.equal(inDirty, undefined,
      'Saúde da Família deveria ser silenciada, mas apareceu em subspec_nao_mapeada');
  } finally {
    cleanup(dataDir);
  }
});

// ============================================================================
// Test 4: subspec não-mapeada vira relatório
// ============================================================================

test('4. filtro 12 profissões — área não em PROFS/SUBSPEC_TO_PARENT/OUT_OF_SCOPE vira subspec_nao_mapeada', () => {
  const dataDir = makeTmpDir();
  try {
    writeFixture(dataDir, [
      baselineEstado(),
      {
        uf: 'YY',
        lotes: [{
          fname: 'YY_lote1.json',
          instituicoes: [{
            nome: 'Inst com area inédita',
            cidade: 'Cidade YY',
            edital: { banca: 'ENARE', link: 'http://Y', inscricao_inicio: '', inscricao_fim: '', prova: '' },
            programas: [{
              nome: 'Programa Y',
              vagas: [{ area: 'Foo Específico Inexistente', quantidade: 2 }]
            }]
          }]
        }],
        resumo: {}
      }
    ]);

    const r = runScript(dataDir);
    assert.equal(r.status, 0, `script falhou: ${r.stderr}`);

    const div = readDiverg(dataDir);
    const entry = div.subspec_nao_mapeada.find(e => e.area === 'Foo Específico Inexistente');
    assert.ok(entry, `area inédita deveria virar entry em subspec_nao_mapeada`);
    assert.equal(entry.uf, 'YY');
    assert.equal(entry.qtd, 2);
    assert.ok(entry.programas.includes('Programa Y'),
      `programa de origem deveria estar listado em entry.programas; recebido: ${JSON.stringify(entry.programas)}`);
  } finally {
    cleanup(dataDir);
  }
});

// ============================================================================
// Test 5: score ranking 70/30 sem componente geográfico
// ============================================================================

test('5. score 70/30 sem geografia — ENARE pequena perde pra não-ENARE grande, ordem confirma ausência de geo', () => {
  const dataDir = makeTmpDir();
  try {
    // 3 inst pra Enfermagem na UF "RK":
    //   A: ENARE / 20v   → score 0.7*(20/30) + 0.3 = 0.7667
    //   B: Interna / 30v → score 0.7*(30/30) + 0   = 0.7000  (max_vagas)
    //   C: ENARE / 5v    → score 0.7*(5/30)  + 0.3 = 0.4167
    // Ordem esperada: A > B > C.
    // A > B prova peso ENARE significativo (0.3 vence diferença de 10 vagas).
    // B > C prova que peso vagas (0.7) também é significativo.
    // Todas mesma UF: prova que NÃO há componente geográfico (se houvesse, distorceria).
    writeFixture(dataDir, [
      baselineEstado(),
      {
        uf: 'RK',
        lotes: [{
          fname: 'RK_lote1.json',
          instituicoes: [
            {
              nome: 'Inst A — ENARE 20v',
              cidade: 'Cidade RK',
              edital: { banca: 'ENARE', link: 'http://A', inscricao_inicio: '', inscricao_fim: '', prova: '' },
              programas: [{ nome: 'P', vagas: [{ area: 'Enfermagem', quantidade: 20 }] }]
            },
            {
              nome: 'Inst B — Interna 30v',
              cidade: 'Cidade RK',
              edital: { banca: 'Interna', link: 'http://B', inscricao_inicio: '', inscricao_fim: '', prova: '' },
              programas: [{ nome: 'P', vagas: [{ area: 'Enfermagem', quantidade: 30 }] }]
            },
            {
              nome: 'Inst C — ENARE 5v',
              cidade: 'Cidade RK',
              edital: { banca: 'ENARE', link: 'http://C', inscricao_inicio: '', inscricao_fim: '', prova: '' },
              programas: [{ nome: 'P', vagas: [{ area: 'Enfermagem', quantidade: 5 }] }]
            }
          ]
        }],
        resumo: { 'Enfermagem': 55 }
      }
    ]);

    const r = runScript(dataDir);
    assert.equal(r.status, 0, `script falhou: ${r.stderr}`);

    const mm = readOutput(dataDir, 'enfermagem');
    const rankA = mm.instituicoes.find(i => i.nome === 'Inst A — ENARE 20v')?.rank;
    const rankB = mm.instituicoes.find(i => i.nome === 'Inst B — Interna 30v')?.rank;
    const rankC = mm.instituicoes.find(i => i.nome === 'Inst C — ENARE 5v')?.rank;

    assert.ok(rankA && rankB && rankC,
      `todas as 3 inst deveriam estar no top 20 (ranks: A=${rankA}, B=${rankB}, C=${rankC})`);
    assert.ok(rankA < rankB,
      `A (ENARE 20v, score esperado 0.767) deveria ranquear acima de B (Interna 30v, score 0.700); ranks A=${rankA} B=${rankB}`);
    assert.ok(rankB < rankC,
      `B (Interna 30v, score 0.700) deveria ranquear acima de C (ENARE 5v, score 0.417); ranks B=${rankB} C=${rankC}`);
  } finally {
    cleanup(dataDir);
  }
});

// ============================================================================
// Test 6: falha controlada — RESIDENCIAS_DATA_DIR ausente
// ============================================================================

test('6. falha controlada — RESIDENCIAS_DATA_DIR ausente: exit !=0 com mensagem útil', () => {
  // Spawn sem RESIDENCIAS_DATA_DIR — não usa runScript (que sempre seta a env var)
  const env = { ...process.env };
  delete env.RESIDENCIAS_DATA_DIR;

  const r = spawnSync('node', [SCRIPT_PATH], { env, encoding: 'utf8' });

  assert.notEqual(r.status, 0, 'esperava exit code != 0 sem RESIDENCIAS_DATA_DIR');
  assert.ok(/RESIDENCIAS_DATA_DIR/i.test(r.stderr),
    `stderr deveria mencionar RESIDENCIAS_DATA_DIR; recebido: ${r.stderr}`);
});
