#!/usr/bin/env node
/**
 * extract-mini-mapa.js — Pipeline de dados para o lead magnet Mini-Mapa das Residências.
 *
 * Lê o banco JSON de residências (indexado por `index.json` + arquivos de lote)
 * e gera 12 datasets segmentados por profissão em $RESIDENCIAS_DATA_DIR/mini-mapa/.
 *
 * Story de referência: docs/stories/lead-magnet-mini-mapa/1.1.story.md (v1.1, Ready).
 *
 * Uso:
 *   RESIDENCIAS_DATA_DIR=/path/to/residencias node scripts/extract-mini-mapa.js
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ============================================================================
// Constantes de produto (NÃO derivar dinamicamente do banco)
// ============================================================================

// Lista FIXA das 12 profissões do Mini-Mapa por decisão de produto.
// Áreas presentes no banco fora desta lista (ex: Ciências Biológicas,
// Saúde da Família) pertencem ao escopo do Extensivo ENARE — não ao
// Mini-Mapa — e são silenciosamente filtradas.
const PROFISSOES_MINI_MAPA = [
  'Biomedicina',
  'Educação Física',
  'Enfermagem',
  'Farmácia',
  'Fisioterapia',
  'Fonoaudiologia',
  'Medicina Veterinária',
  'Nutrição',
  'Odontologia',
  'Psicologia',
  'Serviço Social',
  'Terapia Ocupacional'
];

// Pesos do score composto (AC3): vagas / ENARE / geografia
const PESO_VAGAS = 0.4;
const PESO_ENARE = 0.4;
const PESO_GEO = 0.2;

// AC4: profissões com menos de 20 UFs viram "parcial"
const COBERTURA_LIMIAR_UFS = 20;

// AC2: até 20 instituições no top
const TOP_N = 20;

// Calendário ENARE 2026/2027 (cronograma divulgado pela FGV/EBSERH em maio/2026;
// edital completo com vagas/instituições ainda pendente — flag abaixo sinaliza).
const CALENDARIO_ENARE_2026_2027 = {
  edital_completo_pendente: true,
  datas: [
    { data: '27/04/2026', evento: 'Adesão de instituições (início)', fonte: 'FGV/EBSERH' },
    { data: '15/05/2026', evento: 'Adesão de instituições (fim)', fonte: 'FGV/EBSERH' },
    { data: '08/06/2026', evento: 'Inscrições candidatos (início)', fonte: 'FGV/EBSERH' },
    { data: '22/06/2026', evento: 'Inscrições candidatos (fim)', fonte: 'FGV/EBSERH' },
    { data: '13/09/2026', evento: 'Prova', fonte: 'FGV/EBSERH' }
  ]
};

// ============================================================================
// Utilitários
// ============================================================================

function fail(msg) {
  console.error(`\n[extract-mini-mapa] ERRO: ${msg}\n`);
  process.exit(1);
}

function slugify(nome) {
  return nome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

// ============================================================================
// Pipeline
// ============================================================================

function carregarBanco(dataDir) {
  const indexPath = path.join(dataDir, 'index.json');
  if (!fs.existsSync(indexPath)) fail(`index.json não encontrado em ${dataDir}`);

  const detalhadoDir = path.join(dataDir, 'detalhado');
  if (!fs.existsSync(detalhadoDir)) fail(`subdiretório 'detalhado/' não existe em ${dataDir}`);

  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  const mtimes = [fs.statSync(indexPath).mtime];

  // Lotes: por instituição (chave = UF|nome), guardamos programas por profissão
  // Estrutura: insts.get(prof).get(instKey) = { uf, nome, cidade, ..., programas: [{area, vagas, nome_programa}] }
  const insts = new Map();
  for (const prof of PROFISSOES_MINI_MAPA) insts.set(prof, new Map());

  const ufsPorProf = new Map();
  for (const prof of PROFISSOES_MINI_MAPA) ufsPorProf.set(prof, new Set());

  let totalLotesLidos = 0;
  let areasIgnoradas = 0;

  for (const estado of index.estados) {
    const uf = estado.sigla;
    for (const arquivo of estado.arquivos) {
      const filePath = path.join(detalhadoDir, arquivo);
      if (!fs.existsSync(filePath)) fail(`arquivo de lote referenciado em index.json não encontrado: ${arquivo}`);
      mtimes.push(fs.statSync(filePath).mtime);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      totalLotesLidos++;

      for (const inst of (data.instituicoes || [])) {
        const cidade = inst.cidade || data.cidade || '';
        const edital = inst.edital || {};
        const banca = edital.banca || '';
        const isEnare = /ENARE/i.test(banca);
        const instKey = `${uf}|${inst.nome}`;

        for (const programa of (inst.programas || [])) {
          for (const vaga of (programa.vagas || [])) {
            const area = vaga.area;
            const qtd = vaga.quantidade || 0;
            if (qtd <= 0) continue;
            if (!PROFISSOES_MINI_MAPA.includes(area)) {
              areasIgnoradas++;
              continue;
            }
            // Pega ou cria o registro da inst para essa profissão
            if (!insts.get(area).has(instKey)) {
              insts.get(area).set(instKey, {
                uf,
                nome: inst.nome,
                cidade,
                estado: uf,
                banca,
                link_edital: edital.link || '',
                datas: {
                  inscricao_inicio: edital.inscricao_inicio || '',
                  inscricao_fim: edital.inscricao_fim || '',
                  prova: edital.prova || ''
                },
                programas: [],
                _is_enare: isEnare,
                _total_vagas: 0
              });
            }
            const rec = insts.get(area).get(instKey);
            rec.programas.push({ area, vagas: qtd, nome_programa: programa.nome || '' });
            rec._total_vagas += qtd;
            ufsPorProf.get(area).add(uf);
          }
        }
      }
    }
  }

  // Validação cruzada com _resumo.json (AC1: tolerância 0, abortar se diverge)
  const divergencias = [];
  for (const estado of index.estados) {
    const uf = estado.sigla;
    const resumoPath = path.join(detalhadoDir, estado.resumo);
    if (!fs.existsSync(resumoPath)) fail(`resumo não encontrado: ${estado.resumo}`);
    mtimes.push(fs.statSync(resumoPath).mtime);
    const resumo = JSON.parse(fs.readFileSync(resumoPath, 'utf8'));
    const totalResumo = resumo.total_vagas_por_profissao || {};

    for (const prof of PROFISSOES_MINI_MAPA) {
      let sumLotes = 0;
      for (const rec of insts.get(prof).values()) {
        if (rec.uf === uf) sumLotes += rec._total_vagas;
      }
      const sumResumo = totalResumo[prof] || 0;
      if (sumLotes !== sumResumo) {
        divergencias.push({ uf, prof, lotes: sumLotes, resumo: sumResumo, diff: sumLotes - sumResumo });
      }
    }
  }

  return { insts, ufsPorProf, mtimes, divergencias, totalLotesLidos, areasIgnoradas };
}

function calcularRanking(insts, ufsPorProf) {
  const ranked = new Map();
  for (const prof of PROFISSOES_MINI_MAPA) {
    const lista = [...insts.get(prof).values()];
    if (lista.length === 0) {
      fail(`profissão alvo ausente do banco fonte: ${prof} (esperado por contrato de produto)`);
    }

    const maxVagas = Math.max(...lista.map(i => i._total_vagas));

    // Contagem de instituições da profissão por UF (componente geográfico)
    const instCountPerUf = new Map();
    for (const rec of lista) {
      instCountPerUf.set(rec.uf, (instCountPerUf.get(rec.uf) || 0) + 1);
    }
    const geoRaws = [...instCountPerUf.values()].map(n => 1 / Math.sqrt(n));
    const maxGeo = Math.max(...geoRaws);

    for (const rec of lista) {
      const compVagas = maxVagas > 0 ? rec._total_vagas / maxVagas : 0;
      const compEnare = rec._is_enare ? 1.0 : 0.0;
      const geoRaw = 1 / Math.sqrt(instCountPerUf.get(rec.uf));
      const compGeo = maxGeo > 0 ? geoRaw / maxGeo : 0;
      rec._score = PESO_VAGAS * compVagas + PESO_ENARE * compEnare + PESO_GEO * compGeo;
    }

    // Tiebreak por (1) score desc, (2) total_vagas desc, (3) nome asc (determinístico)
    lista.sort((a, b) => {
      if (b._score !== a._score) return b._score - a._score;
      if (b._total_vagas !== a._total_vagas) return b._total_vagas - a._total_vagas;
      return a.nome.localeCompare(b.nome, 'pt-BR');
    });

    ranked.set(prof, lista);
  }
  return ranked;
}

function buildOutput(prof, ranked, ufsPorProf, dataExtracao) {
  const lista = ranked.get(prof);
  const ufs = ufsPorProf.get(prof);
  const cobertura = ufs.size >= COBERTURA_LIMIAR_UFS ? 'completa' : 'parcial';

  const top = lista.slice(0, TOP_N).map((rec, idx) => ({
    rank: idx + 1,
    nome: rec.nome,
    cidade: rec.cidade,
    estado: rec.estado,
    banca: rec.banca,
    link_edital: rec.link_edital,
    datas: {
      inscricao_inicio: rec.datas.inscricao_inicio,
      inscricao_fim: rec.datas.inscricao_fim,
      prova: rec.datas.prova
    },
    programas: rec.programas.map(p => ({
      area: p.area,
      vagas: p.vagas,
      nome_programa: p.nome_programa
    }))
  }));

  return {
    profissao: prof,
    ano: 2026,
    data_extracao: dataExtracao,
    cobertura_geografica: cobertura,
    total_instituicoes_disponiveis: lista.length,
    instituicoes: top,
    calendario_enare_2026_2027: CALENDARIO_ENARE_2026_2027
  };
}

function validarSchema(prof, obj) {
  const erros = [];
  if (obj.profissao !== prof) erros.push('profissao mismatch');
  if (obj.ano !== 2026) erros.push('ano != 2026');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(obj.data_extracao)) erros.push('data_extracao não é ISO YYYY-MM-DD');
  if (!['completa', 'parcial'].includes(obj.cobertura_geografica)) erros.push('cobertura_geografica inválida');
  if (typeof obj.total_instituicoes_disponiveis !== 'number') erros.push('total_instituicoes_disponiveis não numérico');
  if (!Array.isArray(obj.instituicoes)) erros.push('instituicoes não é array');
  if (obj.instituicoes.length === 0) erros.push('instituicoes vazio');
  if (obj.instituicoes.length > TOP_N) erros.push(`instituicoes > ${TOP_N}`);
  for (const [i, inst] of obj.instituicoes.entries()) {
    if (inst.rank !== i + 1) erros.push(`instituicoes[${i}].rank inválido`);
    if (!inst.nome) erros.push(`instituicoes[${i}].nome vazio`);
    if (!inst.estado) erros.push(`instituicoes[${i}].estado vazio`);
    if (!Array.isArray(inst.programas) || inst.programas.length === 0) erros.push(`instituicoes[${i}].programas vazio`);
  }
  if (!obj.calendario_enare_2026_2027 || obj.calendario_enare_2026_2027.edital_completo_pendente !== true) {
    erros.push('calendario_enare_2026_2027.edital_completo_pendente deve ser true');
  }
  return erros;
}

function escreverAtomico(outDir, filename, conteudo) {
  const finalPath = path.join(outDir, filename);
  const tmpPath = `${finalPath}.tmp`;
  fs.writeFileSync(tmpPath, conteudo);
  fs.renameSync(tmpPath, finalPath);
}

// ============================================================================
// Main
// ============================================================================

function main() {
  const dataDir = process.env.RESIDENCIAS_DATA_DIR;
  if (!dataDir) {
    fail('env var RESIDENCIAS_DATA_DIR é obrigatória. Aponte para o diretório do banco residencias/ (ex: RESIDENCIAS_DATA_DIR=/path/to/residencias node scripts/extract-mini-mapa.js).');
  }
  if (!fs.existsSync(dataDir)) fail(`diretório RESIDENCIAS_DATA_DIR não existe: ${dataDir}`);

  console.log(`[extract-mini-mapa] lendo banco em ${dataDir}`);

  const { insts, ufsPorProf, mtimes, divergencias, totalLotesLidos, areasIgnoradas } = carregarBanco(dataDir);

  console.log(`[extract-mini-mapa] ${totalLotesLidos} lotes lidos, ${areasIgnoradas} entradas de vaga em áreas fora do escopo (silenciadas)`);

  if (divergencias.length > 0) {
    console.error(`\n[extract-mini-mapa] VALIDAÇÃO CRUZADA FALHOU: ${divergencias.length} divergências entre soma dos lotes e total_vagas_por_profissao no _resumo.json:`);
    for (const d of divergencias) {
      console.error(`  ${d.uf} / ${d.prof}: lotes=${d.lotes}, resumo=${d.resumo} (diff=${d.diff > 0 ? '+' : ''}${d.diff})`);
    }
    fail('abortar conforme AC1 (tolerância 0). Corrigir banco fonte ou amendar story para relaxar tolerância.');
  }

  const maxMtime = mtimes.reduce((a, b) => (a > b ? a : b));
  const dataExtracao = isoDate(maxMtime);

  const ranked = calcularRanking(insts, ufsPorProf);

  // Build + validate em memória antes de qualquer I/O
  const outputs = [];
  for (const prof of PROFISSOES_MINI_MAPA) {
    const obj = buildOutput(prof, ranked, ufsPorProf, dataExtracao);
    const erros = validarSchema(prof, obj);
    if (erros.length > 0) {
      fail(`schema inválido para ${prof}:\n  - ${erros.join('\n  - ')}`);
    }
    outputs.push({ prof, slug: slugify(prof), obj });
  }

  // Escrita atômica (.tmp + rename) — só agora que validou todos os 12
  const outDir = path.join(dataDir, 'mini-mapa');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (const { slug, obj } of outputs) {
    const conteudo = JSON.stringify(obj, null, 2) + '\n';
    escreverAtomico(outDir, `mini-mapa-${slug}.json`, conteudo);
  }

  console.log(`[extract-mini-mapa] OK — 12 arquivos gerados em ${outDir}`);
  console.log(`[extract-mini-mapa] data_extracao=${dataExtracao} (max mtime de ${mtimes.length} arquivos fonte)`);
}

main();
