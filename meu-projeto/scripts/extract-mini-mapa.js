#!/usr/bin/env node
/**
 * extract-mini-mapa.js — Pipeline de dados para o lead magnet Mini-Mapa das Residências.
 *
 * Lê o banco JSON de residências (indexado por `index.json` + arquivos de lote)
 * e gera 12 datasets segmentados por profissão em $RESIDENCIAS_DATA_DIR/mini-mapa/,
 * acompanhados de um relatório classificado de divergências contra o `_resumo.json`
 * (informativo, não bloqueador — ver AC9 da story v1.2).
 *
 * Story de referência: docs/stories/lead-magnet-mini-mapa/1.1.story.md (v1.2, Ready).
 *
 * Uso:
 *   RESIDENCIAS_DATA_DIR=/path/to/residencias node scripts/extract-mini-mapa.js
 *
 * Env var opcional `LEAD_MAGNET_OUTPUT_MIRROR`: se setada, o script copia os 13
 * arquivos gerados (12 mini-mapas + DIVERGENCIAS.json) para o diretório-espelho
 * também — útil pra versionar os outputs em git (banco continua o destino
 * primário; mirror serve só pra rastreamento/backup via repo lead-magnet).
 * Sem a env var setada, comportamento é 100% inalterado.
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ============================================================================
// Constantes de produto (NÃO derivar dinamicamente do banco)
// ============================================================================

// Lista FIXA das 12 profissões do Mini-Mapa por decisão de produto.
// Áreas presentes no banco fora desta lista pertencem ao escopo do Extensivo
// ENARE — não ao Mini-Mapa — e são silenciosamente filtradas (ou reagregadas
// sob a profissão-pai, via SUBSPEC_TO_PARENT abaixo).
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

// Mapeamento canônico subspec→profissão-pai.
//
// REGRA CRÍTICA: usado EXCLUSIVAMENTE quando o campo `area` da vaga é uma
// subspecialidade. NUNCA usar nome do programa (`programa.nome`) para mapear:
// programas multiprofissionais como "Atenção Cardiopulmonar" ou "Clínica
// Médica e Cirúrgica" têm vagas de várias profissões e o nome do programa
// não indica profissão — matching por nome do programa daria classificação
// errada.
//
// A reagregação serve APENAS pra normalizar a comparação com `_resumo.json`
// (que tipicamente agrega subspec sob a profissão-pai). Os 12 JSONs de output
// preservam o campo `area` original do lote.
//
// Lista empírica, derivada da auditoria de 2026-05-20. Áreas silenciadas que
// não estejam aqui nem em OUT_OF_SCOPE_AREAS vão para `subspec_nao_mapeada`
// no relatório DIVERGENCIAS.json.
const SUBSPEC_TO_PARENT = Object.freeze({
  // Enfermagem
  'Enfermagem Obstétrica': 'Enfermagem',
  'Estomaterapia': 'Enfermagem',
  // Medicina Veterinária
  'Anestesiologia Veterinária': 'Medicina Veterinária',
  'Anestesiologia de Pequenos Animais': 'Medicina Veterinária',
  'Patologia Clínica Veterinária': 'Medicina Veterinária',
  'Patologia Veterinária': 'Medicina Veterinária',
  'Patologia Animal': 'Medicina Veterinária',
  'Diagnóstico por Imagem Veterinário': 'Medicina Veterinária',
  'Clínica Médica de Pequenos Animais': 'Medicina Veterinária',
  'Clínica Cirúrgica de Pequenos Animais': 'Medicina Veterinária',
  'Clínica e Cirurgia de Grandes Animais': 'Medicina Veterinária',
  'Clínica Médica de Equídeos': 'Medicina Veterinária',
  'Clínica Médica de Ruminantes': 'Medicina Veterinária',
  'Grandes Animais': 'Medicina Veterinária',
  'Animais Silvestres e Exóticos': 'Medicina Veterinária',
  // Odontologia
  'Cirurgia e Traumatologia Buco-Maxilo-Facial': 'Odontologia',
  'Cirurgia e Traumatologia Bucomaxilofacial': 'Odontologia',
  'Odontopediatria': 'Odontologia',
  'Estomatologia': 'Odontologia',
  'Periodontia': 'Odontologia',
  // Farmácia
  'Farmácia (Análises Clínicas)': 'Farmácia',
  'Farmácia (Farmácia Clínica)': 'Farmácia',
  'Farmácia – Análises Clínicas': 'Farmácia',
  'Análises Clínicas': 'Farmácia',
  // Fonoaudiologia
  'Fonoaudiologia – Saúde Auditiva': 'Fonoaudiologia',
  // Nutrição
  'Nutrição Clínica': 'Nutrição'
});

// Áreas conhecidas fora do escopo do Mini-Mapa (silenciadas sem reportar).
// Pertencem a outros produtos (ex: Extensivo ENARE) ou são áreas que não
// correspondem a nenhuma das 12 profissões alvo.
const OUT_OF_SCOPE_AREAS = Object.freeze(new Set([
  'Ciências Biológicas',
  'Saúde da Família',
  'Saúde Coletiva',
  'Saúde Pública/Saúde Coletiva',
  'Biologia',
  'Física/Física Médica'
]));

// UFs já auditadas contra o detalhamento do PDF oficial.
// Quando uma UF passa por auditoria PDF, adicionar aqui — o relatório usa
// essa lista para sinalizar quais UFs ainda têm dívida técnica de validação.
const UFS_AUDITADAS_CONTRA_PDF = Object.freeze(['CE']);

// Pesos do score composto (AC3 v1.3): vagas / ENARE.
// Componente geográfico foi REMOVIDO em 2026-05-20: penalizava grandes
// centros (SP/MG/RJ/BA/RS) tirando-os do top 20 mesmo com muitas vagas
// (ex: UNIFESP 36v fora vs Liga RN 2v dentro), contra a estratégia de
// produto de focar grandes centros. 70% vagas + 30% ENARE preserva o
// alinhamento com o upsell do Curso ENARE R$197 mas enfatiza volume.
const PESO_VAGAS = 0.7;
const PESO_ENARE = 0.3;

// AC4: profissões com menos de 20 UFs viram "parcial"
const COBERTURA_LIMIAR_UFS = 20;

// AC2: até 20 instituições no top
const TOP_N = 20;

// Calendário ENARE 2026/2027
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

  // Output state — vagas com `area` em uma das 12 profissões entram diretamente;
  // vagas com `area` em SUBSPEC_TO_PARENT também entram, sob a profissão-pai
  // (variante a v1.4: agregado de vagas inclui subspec, mas `programas[]` no
  // output preserva o `area` original — candidato vê total correto E os
  // programas específicos).
  const insts = new Map();
  for (const prof of PROFISSOES_MINI_MAPA) insts.set(prof, new Map());

  const ufsPorProf = new Map();
  for (const prof of PROFISSOES_MINI_MAPA) ufsPorProf.set(prof, new Set());

  // Tracking separado pra relatório de divergências distinguir exact vs subspec.
  const exactPerUfProf = new Map();      // uf -> Map(prof -> qtd) (apenas area == prof)
  const subspecReagregado = new Map();   // uf -> Map(parent -> qtd) (apenas area subspec)
  // Áreas silenciadas sem mapping conhecido nem entrada em OUT_OF_SCOPE_AREAS.
  const subspecNaoMapeadaRaw = new Map(); // "UF|area" -> {uf, area, qtd, programas:Set}

  let totalLotesLidos = 0;
  let areasIgnoradas = 0;

  function makeInstRec(uf, inst, cidade, edital, banca, isEnare) {
    return {
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
    };
  }

  for (const estado of index.estados) {
    const uf = estado.sigla;
    if (!exactPerUfProf.has(uf)) exactPerUfProf.set(uf, new Map());
    if (!subspecReagregado.has(uf)) subspecReagregado.set(uf, new Map());

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

            // Resolve a profissão-pai: area exata OU subspec mapeada.
            let parent = null;
            let isSubspec = false;
            if (PROFISSOES_MINI_MAPA.includes(area)) {
              parent = area;
            } else if (SUBSPEC_TO_PARENT[area]) {
              parent = SUBSPEC_TO_PARENT[area];
              isSubspec = true;
            }

            if (parent) {
              // Entra no output sob a profissão-pai. `programas[]` preserva `area` original
              // (que pode ser subspec ex: "Anestesiologia Veterinária") pra o candidato
              // ver os programas específicos.
              if (!insts.get(parent).has(instKey)) {
                insts.get(parent).set(instKey, makeInstRec(uf, inst, cidade, edital, banca, isEnare));
              }
              const rec = insts.get(parent).get(instKey);
              rec.programas.push({ area, vagas: qtd, nome_programa: programa.nome || '' });
              rec._total_vagas += qtd;
              ufsPorProf.get(parent).add(uf);

              // Tracking pro relatório de divergências.
              if (isSubspec) {
                areasIgnoradas++; // contador histórico — subspec NÃO está na lista das 12
                const m = subspecReagregado.get(uf);
                m.set(parent, (m.get(parent) || 0) + qtd);
              } else {
                const m = exactPerUfProf.get(uf);
                m.set(parent, (m.get(parent) || 0) + qtd);
              }
            } else {
              // Sem parent: ou OUT_OF_SCOPE_AREAS (silencia) ou candidata a extender mapping.
              areasIgnoradas++;
              if (!OUT_OF_SCOPE_AREAS.has(area)) {
                const key = `${uf}|${area}`;
                if (!subspecNaoMapeadaRaw.has(key)) {
                  subspecNaoMapeadaRaw.set(key, { uf, area, qtd: 0, programas: new Set() });
                }
                const ent = subspecNaoMapeadaRaw.get(key);
                ent.qtd += qtd;
                if (programa.nome) ent.programas.add(programa.nome);
              }
              // OUT_OF_SCOPE_AREAS: silenciada sem reportar (esperado).
            }
          }
        }
      }
    }
  }

  // Validação cruzada com _resumo.json — gera divergencias classificadas (NÃO aborta).
  // AC9 v1.2: relatório informativo, não bloqueador.
  const divergencias = [];
  for (const estado of index.estados) {
    const uf = estado.sigla;
    const resumoPath = path.join(detalhadoDir, estado.resumo);
    if (!fs.existsSync(resumoPath)) fail(`resumo não encontrado: ${estado.resumo}`);
    mtimes.push(fs.statSync(resumoPath).mtime);
    const resumo = JSON.parse(fs.readFileSync(resumoPath, 'utf8'));
    const totalResumo = resumo.total_vagas_por_profissao || {};
    const exactPorProf = exactPerUfProf.get(uf) || new Map();
    const reagPorParent = subspecReagregado.get(uf) || new Map();

    for (const prof of PROFISSOES_MINI_MAPA) {
      const sumLotesExato = exactPorProf.get(prof) || 0;
      const reagregada = reagPorParent.get(prof) || 0;
      const lotesReagregado = sumLotesExato + reagregada;
      const sumResumo = totalResumo[prof] || 0;

      if (lotesReagregado === sumResumo) continue; // Sem divergência após reagregação.

      const diff = lotesReagregado - sumResumo;
      const classificacao = diff > 0 ? 'resumo_defasado' : 'lotes_possivelmente_incompletos';
      const prioridade = diff > 0 ? 'baixa' : 'alta';
      const nota = diff > 0
        ? 'lotes > resumo após reagregar subspec — resumo provavelmente cópia defasada da Tabela 1 do PDF oficial. Lotes preferidos.'
        : 'lotes < resumo — possível captura faltando no banco. Verificar contra detalhamento do PDF oficial da UF antes de tratar como erro.';

      divergencias.push({
        uf,
        profissao: prof,
        lotes_exato: sumLotesExato,
        subspec_reagregada: reagregada,
        lotes_reagregado: lotesReagregado,
        resumo: sumResumo,
        diff,
        classificacao,
        prioridade,
        nota
      });
    }
  }

  // Agrega subspec_nao_mapeada (ordenado para idempotência).
  const subspecNaoMapeada = [...subspecNaoMapeadaRaw.values()]
    .map(e => ({
      uf: e.uf,
      area: e.area,
      qtd: e.qtd,
      programas: [...e.programas].sort()
    }))
    .sort((a, b) => a.uf.localeCompare(b.uf) || a.area.localeCompare(b.area, 'pt-BR'));

  return {
    insts,
    ufsPorProf,
    mtimes,
    divergencias,
    subspecNaoMapeada,
    totalLotesLidos,
    areasIgnoradas
  };
}

function calcularRanking(insts, ufsPorProf) {
  const ranked = new Map();
  for (const prof of PROFISSOES_MINI_MAPA) {
    const lista = [...insts.get(prof).values()];
    if (lista.length === 0) {
      fail(`profissão alvo ausente do banco fonte: ${prof} (esperado por contrato de produto)`);
    }

    const maxVagas = Math.max(...lista.map(i => i._total_vagas));

    for (const rec of lista) {
      const compVagas = maxVagas > 0 ? rec._total_vagas / maxVagas : 0;
      const compEnare = rec._is_enare ? 1.0 : 0.0;
      rec._score = PESO_VAGAS * compVagas + PESO_ENARE * compEnare;
    }

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

function buildDivergenceReport(dataExtracao, divergencias, subspecNaoMapeada) {
  // Ordena divergencias por (uf, profissao) para idempotência.
  const sortedDiv = [...divergencias].sort(
    (a, b) => a.uf.localeCompare(b.uf) || a.profissao.localeCompare(b.profissao, 'pt-BR')
  );

  function topUfsByCategory(cat) {
    const counts = new Map();
    for (const d of sortedDiv) {
      if (d.classificacao !== cat) continue;
      counts.set(d.uf, (counts.get(d.uf) || 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 5)
      .map(x => x[0]);
  }

  // Dívida técnica: UFs com divergências "lotes_possivelmente_incompletos"
  // que ainda não foram auditadas contra o detalhamento do PDF oficial.
  const ufsComAlta = new Set(
    sortedDiv
      .filter(d => d.classificacao === 'lotes_possivelmente_incompletos')
      .map(d => d.uf)
  );
  const ufsPendentes = [...ufsComAlta]
    .filter(uf => !UFS_AUDITADAS_CONTRA_PDF.includes(uf))
    .sort();

  return {
    data_extracao: dataExtracao,
    fonte_de_dados: 'lotes (residencias/detalhado/*.json)',
    criterio_comparacao: 'sum(lotes com subspec reagregada sob profissão-pai) vs total_vagas_por_profissao do _resumo',
    divida_tecnica_pdf_audit: {
      uf_ja_auditadas: [...UFS_AUDITADAS_CONTRA_PDF],
      uf_pendentes: ufsPendentes,
      nota: 'UFs em uf_pendentes têm divergências classificadas como "lotes_possivelmente_incompletos" mas ainda não foram auditadas contra o detalhamento do PDF oficial — pode ser captura faltando no banco, ou pode ser a mesma defasagem da Tabela 1 do PDF que confirmamos em CE. Dívida técnica para versões futuras: auditar cada UF contra PDF oficial antes de tratar essas divergências como erros do banco.'
    },
    resumo_por_categoria: {
      resumo_defasado: {
        n: sortedDiv.filter(d => d.classificacao === 'resumo_defasado').length,
        prioridade: 'baixa',
        nota: 'lotes > resumo: resumo é cópia da Tabela 1 do PDF oficial; tipicamente defasada quando programas são adicionados ao detalhamento sem atualizar o agregado. Lotes preferidos.',
        uf_principais: topUfsByCategory('resumo_defasado')
      },
      lotes_possivelmente_incompletos: {
        n: sortedDiv.filter(d => d.classificacao === 'lotes_possivelmente_incompletos').length,
        prioridade: 'alta',
        nota: 'lotes < resumo: pode ser captura faltando no banco. Verificar contra detalhamento do PDF oficial da UF antes de tratar como erro real.',
        uf_principais: topUfsByCategory('lotes_possivelmente_incompletos')
      },
      subspec_nao_mapeada: {
        n: subspecNaoMapeada.length,
        prioridade: 'media',
        nota: 'áreas silenciadas nos lotes sem mapping em SUBSPEC_TO_PARENT nem em OUT_OF_SCOPE_AREAS. Pode indicar subspec nova (extender SUBSPEC_TO_PARENT) ou nome de programa multiprofissional usado erroneamente no campo area (corrigir lote).'
      }
    },
    divergencias: sortedDiv,
    subspec_nao_mapeada: subspecNaoMapeada
  };
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

  const {
    insts, ufsPorProf, mtimes, divergencias, subspecNaoMapeada,
    totalLotesLidos, areasIgnoradas
  } = carregarBanco(dataDir);

  console.log(`[extract-mini-mapa] ${totalLotesLidos} lotes lidos, ${areasIgnoradas} entradas de vaga fora das 12 profissões (reagregadas via SUBSPEC_TO_PARENT, silenciadas via OUT_OF_SCOPE_AREAS, ou registradas em subspec_nao_mapeada)`);

  const maxMtime = mtimes.reduce((a, b) => (a > b ? a : b));
  const dataExtracao = isoDate(maxMtime);

  const ranked = calcularRanking(insts, ufsPorProf);

  // Build + validate em memória antes de qualquer I/O.
  const outputs = [];
  for (const prof of PROFISSOES_MINI_MAPA) {
    const obj = buildOutput(prof, ranked, ufsPorProf, dataExtracao);
    const erros = validarSchema(prof, obj);
    if (erros.length > 0) {
      fail(`schema inválido para ${prof}:\n  - ${erros.join('\n  - ')}`);
    }
    outputs.push({ prof, slug: slugify(prof), obj });
  }

  // Relatório de divergências (AC9 v1.2: informativo, não bloqueador).
  const divReport = buildDivergenceReport(dataExtracao, divergencias, subspecNaoMapeada);

  // Escrita atômica — só agora que validou todos os 12.
  const outDir = path.join(dataDir, 'mini-mapa');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (const { slug, obj } of outputs) {
    const conteudo = JSON.stringify(obj, null, 2) + '\n';
    escreverAtomico(outDir, `mini-mapa-${slug}.json`, conteudo);
  }
  escreverAtomico(outDir, 'DIVERGENCIAS.json', JSON.stringify(divReport, null, 2) + '\n');

  // Mirror opcional pra rastreamento/backup em git (LEAD_MAGNET_OUTPUT_MIRROR).
  // Banco continua destino primário; mirror serve só pra versionar os outputs
  // no repo lead-magnet. Sem a env var setada, este bloco é no-op.
  const outputMirror = process.env.LEAD_MAGNET_OUTPUT_MIRROR;
  if (outputMirror) {
    if (!fs.existsSync(outputMirror)) fs.mkdirSync(outputMirror, { recursive: true });
    for (const { slug, obj } of outputs) {
      const conteudo = JSON.stringify(obj, null, 2) + '\n';
      escreverAtomico(outputMirror, `mini-mapa-${slug}.json`, conteudo);
    }
    escreverAtomico(outputMirror, 'DIVERGENCIAS.json', JSON.stringify(divReport, null, 2) + '\n');
    console.log(`[extract-mini-mapa] MIRROR — outputs também espelhados em ${outputMirror}`);
    console.log(`[extract-mini-mapa]   lembrete: commitar o mirror no git pra ter o backup persistido`);
  }

  console.log(`[extract-mini-mapa] OK — 12 mini-mapas + DIVERGENCIAS.json gerados em ${outDir}`);
  console.log(`[extract-mini-mapa]   resumo_defasado:                 ${divReport.resumo_por_categoria.resumo_defasado.n.toString().padStart(3)} divergências (baixa)`);
  console.log(`[extract-mini-mapa]   lotes_possivelmente_incompletos: ${divReport.resumo_por_categoria.lotes_possivelmente_incompletos.n.toString().padStart(3)} divergências (ALTA — verificar contra PDF)`);
  console.log(`[extract-mini-mapa]   subspec_nao_mapeada:             ${divReport.resumo_por_categoria.subspec_nao_mapeada.n.toString().padStart(3)} áreas`);
  console.log(`[extract-mini-mapa] data_extracao=${dataExtracao} (max mtime de ${mtimes.length} arquivos fonte)`);
}

main();
