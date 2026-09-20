// ============================================================
// IMPÉRIO - SISTEMA COMPLETO
// ============================================================

// ============================================================
// VARIÁVEIS GERAIS
// ============================================================

let etapaAtual = 1;
let pontosDisponiveis = 3;
let fotoPersonagem = "";

let origemSelecionada = null;
let mutacoesCobaiaSelecionadas = []; // até 2 nomes de mutação, só usado quando origemSelecionada.nome === "Cobaia"
let categoriaSelecionada = "";
let classeSelecionada = null;

// --- Trilhas, Talentos e Rituais (IMPÉRIO) ---
let trilhaSelecionada = { combatente: null, especialista: null, ocultista: null };
let talentosEscolhidos = { combatente: {}, especialista: {}, ocultista: {} };
let rituaisConhecidos = [];
let elementoRitualAtivo = null;

// Habilidade base de cada categoria (Combatente/Especialista/Ocultista)
const habilidadeBaseCategoria = {
    combatente: {
        nome: "Instinto de Batalha",
        desc: "Ao fazer um teste de Luta ou Pontaria, pode gastar 2 PE para ser considerado treinado nessa perícia durante o teste."
    },
    especialista: {
        nome: "Aplicação de Conhecimento",
        desc: "Ao fazer um teste de perícia (exceto Luta e Pontaria), pode gastar 2 PE para ser considerado treinado nessa perícia durante o teste."
    },
    ocultista: {
        nome: "Toque do Além",
        desc: "Ao fazer um teste envolvendo o sobrenatural (rituais, percepção de entidades, resistência mental), pode gastar 2 PE para ser considerado treinado nesse teste."
    }
};

let atributos = {
    agilidade: 1,
    forca: 1,
    intelecto: 1,
    presenca: 1,
    vigor: 1
};

let periciasSelecionadas = [];

// ============================================================
// PERÍCIAS
// ============================================================

const periciasBase = {
    combatente: 1,
    ocultista: 3,
    especialista: 7
};

const listaDePericias = [
    { nome: "Acrobacia", atributo: "agilidade" },
    { nome: "Adestramento", atributo: "presenca", somenteTreinada: true },
    { nome: "Artes", atributo: "presenca", somenteTreinada: true },
    { nome: "Atletismo", atributo: "forca" },
    { nome: "Atualidades", atributo: "intelecto" },
    { nome: "Ciências", atributo: "intelecto", somenteTreinada: true },
    { nome: "Crime", atributo: "agilidade" },
    { nome: "Diplomacia", atributo: "presenca" },
    { nome: "Enganação", atributo: "presenca" },
    { nome: "Equitação", atributo: "agilidade" },
    { nome: "Etiqueta", atributo: "presenca", somenteTreinada: true },
    { nome: "Fortitude", atributo: "vigor" },
    { nome: "Furtividade", atributo: "agilidade" },
    { nome: "Iniciativa", atributo: "agilidade" },
    { nome: "Intimidação", atributo: "presenca" },
    { nome: "Intuição", atributo: "presenca" },
    { nome: "Investigação", atributo: "intelecto" },
    { nome: "Luta", atributo: "forca" },
    { nome: "Medicina", atributo: "intelecto" },
    { nome: "Ocultismo", atributo: "intelecto", somenteTreinada: true },
    { nome: "Percepção", atributo: "presenca" },
    { nome: "Pilotagem", atributo: "agilidade", somenteTreinada: true },
    { nome: "Pontaria", atributo: "agilidade" },
    { nome: "Profissão", atributo: "intelecto", somenteTreinada: true },
    { nome: "Reflexos", atributo: "agilidade" },
    { nome: "Religião", atributo: "presenca", somenteTreinada: true },
    { nome: "Sobrevivência", atributo: "intelecto" },
    { nome: "Tática", atributo: "intelecto", somenteTreinada: true },
    { nome: "Tecnologia", atributo: "intelecto", somenteTreinada: true },
    { nome: "Vontade", atributo: "presenca" }
];

const abreviacaoAtributo = {
    agilidade: "AGI",
    forca: "FOR",
    intelecto: "INT",
    presenca: "PRE",
    vigor: "VIG"
};

// ============================================================
// ARMAS
// ============================================================

let armasSelecionadas = [];
let nivelPersonagem = 1;

// Valores manuais que sobrescrevem a sugestão automática (null = usar sugestão)
let statsManuais = {
    pv: null,
    pe: null,
    protecao: null,
    san: null,
    defesa: null,
    esquiva: null,
    bloqueio: null,
    contraAtaque: null,
    dt: null
};

function statManualAlterado(campo, valor) {
    statsManuais[campo] = valor;
    salvarProgresso();
}

// PV / PE / SAN atuais, usados durante a partida (null = ainda não inicializado, usa o máximo)
let statusAtual = {
    pv: null,
    pe: null,
    san: null
};

const sufixoStatus = { pv: "PV", pe: "PE", san: "SAN" };

// Recalcula e redesenha a barra + números de um recurso (PV, PE ou SAN)
function atualizarBarraStatus(campo) {
    const sufixo = sufixoStatus[campo];
    if (!sufixo) return;

    const personagem = obterPersonagem();
    const max = personagem[campo];

    if (statusAtual[campo] === null) {
        statusAtual[campo] = max;
    }

    const atual = Math.max(0, Math.min(max, statusAtual[campo]));
    statusAtual[campo] = atual;

    ["ficha", "jogo"].forEach(prefixo => {
        const elAtual = document.getElementById(`${prefixo}${sufixo}Atual`);
        const elMax = document.getElementById(`${prefixo}${sufixo}Max`);
        const elBarra = document.getElementById(`${prefixo}${sufixo}Barra`);

        if (elAtual) elAtual.textContent = atual;
        if (elMax) elMax.textContent = max;
        if (elBarra) elBarra.style.width = max > 0 ? `${(atual / max) * 100}%` : "0%";
    });
}

// Botões +/- da ficha final, para acompanhar dano/gasto durante a sessão
function ajustarStatus(campo, delta) {
    if (statusAtual[campo] === null) {
        statusAtual[campo] = obterPersonagem()[campo];
    }

    statusAtual[campo] += delta;
    atualizarBarraStatus(campo);
    salvarProgresso();
}

// ============================================================
// SALVAMENTO AUTOMÁTICO (localStorage)
// ============================================================

const CHAVE_PROGRESSO = "imperio_progresso";

function salvarProgresso() {
    try {
        const estado = {
            etapaAtual,
            atributos: { ...atributos },
            pontosDisponiveis,
            categoriaSelecionada,
            classeNome: classeSelecionada ? classeSelecionada.nome : null,
            origemNome: origemSelecionada ? origemSelecionada.nome : null,
            mutacoesCobaiaNomes: [...mutacoesCobaiaSelecionadas],
            periciasSelecionadas: [...periciasSelecionadas],
            armasNomes: armasSelecionadas.map(arma => arma.nome),
            protecaoNome: protecaoSelecionada ? protecaoSelecionada.nome : null,
            escudoEquipado,
            equipamentosEspeciais: { ...equipamentosEspeciais },
            espacoOcupadoCavalo,
            consumiveisSelecionados: JSON.parse(JSON.stringify(consumiveisSelecionados)),
            nivelPersonagem,
            nexPersonagem,
            statsManuais: { ...statsManuais },
            statusAtual: { ...statusAtual },
            fotoPersonagem,
            trilhaSelecionadaNomes: {
                combatente: trilhaSelecionada.combatente ? trilhaSelecionada.combatente.nome : null,
                especialista: trilhaSelecionada.especialista ? trilhaSelecionada.especialista.nome : null,
                ocultista: trilhaSelecionada.ocultista ? trilhaSelecionada.ocultista.nome : null
            },
            talentosEscolhidos: JSON.parse(JSON.stringify(talentosEscolhidos)),
            escolhasNexRitual: JSON.parse(JSON.stringify(escolhasNexRitual)),
            rituaisConhecidosRef: rituaisConhecidos.map(r => ({ elemento: r.elemento, nome: r.nome })),
            respostaParanormal: document.getElementById("respostaEle")?.dataset.resposta || null,
            campos: {
                personagem: document.getElementById("personagem")?.value || "",
                jogador: document.getElementById("jogador")?.value || "",
                aparencia: document.getElementById("aparencia")?.value || "",
                personalidade: document.getElementById("personalidade")?.value || "",
                historico: document.getElementById("historico")?.value || "",
                objetivo: document.getElementById("objetivo")?.value || ""
            },
            finalizado: document.getElementById("fichaFinal")?.classList.contains("ativa") || false
        };

        localStorage.setItem(CHAVE_PROGRESSO, JSON.stringify(estado));
    } catch (erro) {
        console.error("Não foi possível salvar o progresso automaticamente:", erro);
    }
}

function limparProgressoSalvo() {
    try {
        localStorage.removeItem(CHAVE_PROGRESSO);
    } catch (erro) {
        console.error(erro);
    }
}

function restaurarProgresso() {
    let salvo = null;

    try {
        salvo = JSON.parse(localStorage.getItem(CHAVE_PROGRESSO));
    } catch (erro) {
        salvo = null;
    }

    if (!salvo) return;

    const nomeSalvo = salvo.campos?.personagem;
    const continuar = confirm(
        `Encontramos um personagem salvo automaticamente${nomeSalvo ? ` ("${nomeSalvo}")` : ""}. Deseja continuar de onde parou?`
    );

    if (!continuar) {
        limparProgressoSalvo();
        return;
    }

    atributos = { ...atributos, ...(salvo.atributos || {}) };
    pontosDisponiveis = typeof salvo.pontosDisponiveis === "number" ? salvo.pontosDisponiveis : pontosDisponiveis;

    Object.keys(atributos).forEach(nome => {
        const campo = document.getElementById(nome);
        if (campo) campo.textContent = atributos[nome];
    });

    const pontosEl = document.getElementById("pontosDisponiveis");
    if (pontosEl) pontosEl.textContent = pontosDisponiveis;
    atualizarEfeitosDeAtributo();

    categoriaSelecionada = salvo.categoriaSelecionada || "";

    if (categoriaSelecionada && classes[categoriaSelecionada]) {
        classeSelecionada = classes[categoriaSelecionada].find(c => c.nome === salvo.classeNome) || null;
    }

    origemSelecionada = origens.find(o => o.nome === salvo.origemNome) || null;
    mutacoesCobaiaSelecionadas = (origemSelecionada && origemSelecionada.nome === "Cobaia" && Array.isArray(salvo.mutacoesCobaiaNomes))
        ? salvo.mutacoesCobaiaNomes.filter(nome => mutacoesCobaia.some(m => m.nome === nome)).slice(0, LIMITE_MUTACOES_COBAIA)
        : [];

    ["combatente", "especialista", "ocultista"].forEach(cat => {
        const nomeTrilhaSalva = salvo.trilhaSelecionadaNomes && salvo.trilhaSelecionadaNomes[cat];
        trilhaSelecionada[cat] = nomeTrilhaSalva
            ? (trilhas[cat] || []).find(t => t.nome === nomeTrilhaSalva) || null
            : null;
    });

    talentosEscolhidos = (salvo.talentosEscolhidos && typeof salvo.talentosEscolhidos === "object")
        ? salvo.talentosEscolhidos
        : { combatente: {}, especialista: {}, ocultista: {} };

    escolhasNexRitual = (salvo.escolhasNexRitual && typeof salvo.escolhasNexRitual === "object")
        ? salvo.escolhasNexRitual
        : { combatente: {}, especialista: {} };

    rituaisConhecidos = Array.isArray(salvo.rituaisConhecidosRef)
        ? salvo.rituaisConhecidosRef
            .map(ref => {
                const ritual = (rituais[ref.elemento] || []).find(r => r.nome === ref.nome);
                return ritual ? { ...ritual, elemento: ref.elemento } : null;
            })
            .filter(Boolean)
        : [];

    periciasSelecionadas = Array.isArray(salvo.periciasSelecionadas) ? salvo.periciasSelecionadas : [];

    armasSelecionadas = Array.isArray(salvo.armasNomes)
        ? salvo.armasNomes.map(nome => listaDeArmas.find(a => a.nome === nome)).filter(Boolean)
        : [];

    protecaoSelecionada = salvo.protecaoNome
        ? listaDeProtecoes.find(p => p.nome === salvo.protecaoNome) || null
        : null;
    escudoEquipado = !!salvo.escudoEquipado;
    equipamentosEspeciais = {
        mochilaTatica: !!salvo.equipamentosEspeciais?.mochilaTatica,
        cavalo: !!salvo.equipamentosEspeciais?.cavalo
    };
    espacoOcupadoCavalo = equipamentosEspeciais.cavalo
        ? Math.max(0, Math.min(20, Number(salvo.espacoOcupadoCavalo) || 0))
        : 0;
    consumiveisSelecionados = criarEstadoConsumiveis();
    if (salvo.consumiveisSelecionados) {
        listaDeConsumiveis.forEach(item => {
            const salvoItem = salvo.consumiveisSelecionados[item.nome] || {};
            consumiveisSelecionados[item.nome] = {
                personagem: Math.max(0, Math.floor(Number(salvoItem.personagem) || 0)),
                cavalo: equipamentosEspeciais.cavalo
                    ? Math.max(0, Math.floor(Number(salvoItem.cavalo) || 0))
                    : 0
            };
        });
    }

    nivelPersonagem = salvo.nivelPersonagem || 1;
    nexPersonagem = typeof salvo.nexPersonagem === "number" ? salvo.nexPersonagem : 0;
    statsManuais = { ...statsManuais, ...(salvo.statsManuais || {}) };
    statusAtual = { ...statusAtual, ...(salvo.statusAtual || {}) };
    fotoPersonagem = salvo.fotoPersonagem || "";

    const nivelInput = document.getElementById("nivelPersonagem");
    if (nivelInput) nivelInput.value = nivelPersonagem;

    const nexInput = document.getElementById("nexPersonagem");
    if (nexInput) nexInput.value = nexPersonagem;

    if (salvo.campos) {
        Object.entries(salvo.campos).forEach(([id, valor]) => {
            const el = document.getElementById(id);
            if (el) el.value = valor;
        });
    }

    atualizarFotoPersonagem();

    if (salvo.respostaParanormal) {
        responderEle(salvo.respostaParanormal);
    }

    if (salvo.finalizado) {
        finalizarFicha();
    } else {
        mostrarTela("criador");
        mudarEtapa(salvo.etapaAtual || 1);
    }
}

// Verifica se uma perícia está treinada (escolhida ou concedida de graça pela origem)
function estaTreinado(nomePericia) {
    if (periciasSelecionadas.includes(nomePericia)) return true;
    if (origemSelecionada && origemSelecionada.pericias.includes(nomePericia)) return true;
    return false;
}

function alterarNivelPersonagem() {
    const campo = document.getElementById("nivelPersonagem");
    if (!campo) return;

    let valor = parseInt(campo.value, 10);
    if (isNaN(valor)) valor = 1;
    valor = Math.max(1, Math.min(20, valor));

    campo.value = valor;
    nivelPersonagem = valor;
    salvarProgresso();
}

let nexPersonagem = 0;

function alterarNex() {
    const campo = document.getElementById("nexPersonagem");
    if (!campo) return;

    const personagemAntes = obterPersonagem();

    let valor = parseInt(campo.value, 10);
    if (isNaN(valor)) valor = 0;
    valor = Math.max(0, Math.min(99, valor));

    campo.value = valor;
    nexPersonagem = valor;

    const personagemDepois = obterPersonagem();
    ["pv", "pe", "san"].forEach(campoStatus => {
        if (statusAtual[campoStatus] === null) return;

        const maximoAntes = Number(personagemAntes[campoStatus]) || 0;
        const maximoDepois = Number(personagemDepois[campoStatus]) || 0;
        const aumento = maximoDepois - maximoAntes;

        // Ao subir o NEX, o recurso atual acompanha o aumento do máximo.
        // Assim, um personagem que estava cheio continua cheio; se estava
        // ferido ou já gastou PE/SAN, conserva essa diferença.
        if (aumento > 0) {
            statusAtual[campoStatus] += aumento;
        }
    });

    atualizarCaracteristicas();
    ["pv", "pe", "san"].forEach(atualizarBarraStatus);
    salvarProgresso();
}

// Quantos "novos níveis de exposição" o personagem já alcançou (0 = ainda no NEX inicial de 5%)
function incrementosNex() {
    if (!classeSelecionada || !Array.isArray(classeSelecionada.progressao)) return 0;

    return classeSelecionada.progressao.filter(p => p.nex <= nexPersonagem).length;
}

// ============================================================
// RITUAIS x PROGRESSÃO DE NEX
// ============================================================
// Ocultista: começa com 3 rituais de 1º círculo à escolha e aprende
// mais um ritual automaticamente a cada avanço de NEX, respeitando
// o círculo máximo já liberado. Esses ganhos não custam Sanidade.
// Combatente/Especialista: em cada Poder de Classe (NEX 15/30/45/60/75/90),
// escolhem entre +4 de Sanidade OU liberar 1 vaga de ritual (o círculo
// máximo dessa vaga acompanha o NEX atual, igual ao Ocultista). A vaga
// só é preenchida de fato na Etapa de Rituais, escolhendo qualquer
// ritual dentro do círculo permitido.

let escolhasNexRitual = { combatente: {}, especialista: {} };

// Círculo máximo de ritual que pode ser conjurado em determinado NEX
function circuloMaximoPorNex(nex) {
    if (nex >= 85) return 4;
    if (nex >= 55) return 3;
    if (nex >= 25) return 2;
    return 1;
}

// Quantos Poderes de Classe (já alcançados no NEX atual) foram trocados por uma vaga de ritual
function contarEscolhasRitualNex(categoria) {
    if (!escolhasNexRitual[categoria] || !classeSelecionada) return 0;

    return classeSelecionada.progressao.filter(p =>
        p.nex <= nexPersonagem && escolhasNexRitual[categoria][p.nex]
    ).length;
}

// Vagas automáticas de ritual: a cada 15% de NEX (15, 30, 45...) alcançado,
// Combatente/Especialista ganham 1 ritual de graça, sem precisar escolher — não consome a escolha de Sanidade/Ritual.
function vagasAutomaticasRitual(categoria) {
    if (categoria === "ocultista" || !classeSelecionada) return 0;
    let vagas = 0;
    for (let nex = 15; nex <= nexPersonagem; nex += 15) vagas++;
    return vagas;
}

// Limite de rituais conhecidos, de acordo com a categoria da classe
function limiteRituais() {
    if (!categoriaSelecionada || !classeSelecionada) return 0;

    if (categoriaSelecionada === "ocultista") {
        return 3 + incrementosNex();
    }

    return contarEscolhasRitualNex(categoriaSelecionada) + vagasAutomaticasRitual(categoriaSelecionada);
}

// Círculo máximo que o personagem pode escolher para um NOVO ritual agora
function circuloMaximoRitualAtual() {
    // Ocultista e a vaga de ritual (trocada por Sanidade num Poder de Classe) liberam o mesmo teto de círculo pelo NEX atual
    return circuloMaximoPorNex(nexPersonagem);
}

// DT de resistência para quem sofre o efeito de um ritual: 10 + Presença + 1 por avanço de NEX
function dtResistenciaRitual() {
    return 10 + (Number(atributos.presenca) || 0) + incrementosNex();
}

// Soma de Sanidade ganha pela progressão de NEX. Em CADA nível de NEX (5, 10, 15...),
// Combatente/Especialista escolhem entre +Sanidade ou 1 vaga de ritual; se escolheram
// ritual naquele nível, não recebem a Sanidade dele.
function sanidadeGanhaPorNex() {
    if (!classeSelecionada || !Array.isArray(classeSelecionada.progressao)) return 0;

    if (categoriaSelecionada === "ocultista") {
        return incrementosNex() * classeSelecionada.sanNex;
    }

    const escolhas = escolhasNexRitual[categoriaSelecionada] || {};
    let total = 0;

    classeSelecionada.progressao
        .filter(p => p.nex <= nexPersonagem)
        .forEach(p => {
            total += escolhas[p.nex] ? 0 : classeSelecionada.sanNex;
        });

    return total;
}

const listaDeArmas = [
    { nome: "Nodachi", categoria: "Haste", nivel: 3, proficiencia: "Marcial", dano: "1d12", pericia: "Luta", alcance: "Longo", maos: "Duas mãos", peso: "Pesado", tamanho: "Grande", espaco: 4, especial: "Exige as duas mãos; -5 em ambientes fechados." },
    { nome: "Wakizashi Amaldiçoado", categoria: "Corte", nivel: 4, proficiencia: "Marcial", dano: "1d6", pericia: "Luta", alcance: "Curto", maos: "Uma mão", peso: "Leve", tamanho: "Pequena", espaco: 1, especial: "Uma vez por cena, sussurra o nome de quem cairá em seguida; se a previsão se cumprir na mesma cena, você recebe +5 no próximo teste de Luta." },
    { nome: "Tantō de Prata Bendita", categoria: "Corte", nivel: 0, proficiencia: "Simples", dano: "1d4", pericia: "Luta", alcance: "Curto", maos: "Uma mão", peso: "Leve", tamanho: "Pequena", espaco: 1, especial: "+1d4 de dano contra entidades paranormais." },
    { nome: "Nagamaki", categoria: "Haste", nivel: 2, proficiencia: "Marcial", dano: "1d10", pericia: "Luta", alcance: "Médio-Longo", maos: "Duas mãos", peso: "Médio", tamanho: "Grande", espaco: 3, especial: "Alcance maior; atinge primeiro contra armas curtas." },
    { nome: "Kusarigama", categoria: "Haste", nivel: 2, proficiencia: "Marcial", dano: "1d6", pericia: "Luta", alcance: "Médio (com corrente)", maos: "Uma mão", peso: "Leve", tamanho: "Média", espaco: 2, especial: "Duas lâminas ligadas por corrente; pode desarmar o alvo." },
    { nome: "Kodachi", categoria: "Corte", nivel: 1, proficiencia: "Marcial", dano: "1d6", pericia: "Luta", alcance: "Curto", maos: "Uma mão", peso: "Leve", tamanho: "Pequena", espaco: 1, especial: "+2 em testes de Iniciativa enquanto empunhada." },
    { nome: "Chokuto Ancestral", categoria: "Corte", nivel: 2, proficiencia: "Marcial", dano: "1d8", pericia: "Luta", alcance: "Médio", maos: "Uma mão", peso: "Médio", tamanho: "Média", espaco: 2, especial: "Uma vez por combate, rerrola um dado de dano em 1." },
    { nome: "Tachi", categoria: "Corte", nivel: 3, proficiencia: "Marcial", dano: "1d10", pericia: "Luta", alcance: "Médio", maos: "Duas mãos", peso: "Médio", tamanho: "Grande", espaco: 2, especial: "Alcance maior que a katana; +5 em ataques contra alvos montados ou em movimento." },
    { nome: "Naginata de Templo", categoria: "Haste", nivel: 3, proficiencia: "Marcial", dano: "1d10", pericia: "Luta", alcance: "Longo", maos: "Duas mãos", peso: "Médio", tamanho: "Grande", espaco: 3, especial: "Pode atingir dois alvos adjacentes em um só golpe." },
    { nome: "Su Yari", categoria: "Haste", nivel: 0, proficiencia: "Simples", dano: "1d8", pericia: "Luta", alcance: "Longo", maos: "Duas mãos", peso: "Médio", tamanho: "Grande", espaco: 3, especial: "Mantém inimigos à distância; facilita ataques de oportunidade." },
    { nome: "Kamayari", categoria: "Haste", nivel: 1, proficiencia: "Marcial", dano: "1d8", pericia: "Luta", alcance: "Longo", maos: "Duas mãos", peso: "Médio", tamanho: "Grande", espaco: 3, especial: "Pode agarrar e puxar o alvo para perto." },
    { nome: "Sasumata", categoria: "Haste", nivel: 1, proficiencia: "Simples", dano: "1d4", pericia: "Luta", alcance: "Longo", maos: "Duas mãos", peso: "Médio", tamanho: "Grande", espaco: 3, especial: "Não causa dano; em vez disso, imobiliza o alvo." },
    { nome: "Yumi de Guerra", categoria: "Distância", nivel: 2, proficiencia: "Distância", dano: "1d8", pericia: "Pontaria", alcance: "Longo (à distância)", maos: "Duas mãos", peso: "Médio", tamanho: "Grande", espaco: 3, especial: "Alcance longo; exige espaço livre para o disparo." },
    { nome: "Hankyu", categoria: "Distância", nivel: 0, proficiencia: "Distância", dano: "1d6", pericia: "Pontaria", alcance: "Médio (à distância)", maos: "Uma mão", peso: "Leve", tamanho: "Média", espaco: 2, especial: "Compacto; pode ser usado montado sem penalidade." },
    { nome: "Fukiya", categoria: "Distância", nivel: 2, proficiencia: "Distância", dano: "1d4", pericia: "Pontaria", alcance: "Médio (à distância)", maos: "Uma mão", peso: "Leve", tamanho: "Pequena", espaco: 1, especial: "Dardos podem ser preparados com toxinas." },
    { nome: "Shuriken Rituais", categoria: "Distância", nivel: 3, proficiencia: "Distância", dano: "1d4", pericia: "Pontaria", alcance: "Curto (arremesso)", maos: "Uma mão", peso: "Leve", tamanho: "Pequena", espaco: 1, especial: "+5 de dano contra entidades paranormais." },
    { nome: "Teppo", categoria: "Distância", nivel: 3, proficiencia: "Distância", dano: "1d10", pericia: "Pontaria", alcance: "Médio (à distância)", maos: "Duas mãos", peso: "Pesado", tamanho: "Grande", espaco: 4, especial: "Recarga lenta: dispara uma vez a cada duas rodadas." },
    { nome: "Kunai", categoria: "Distância", nivel: 1, proficiencia: "Simples", dano: "1d4", pericia: "Pontaria", alcance: "Curto (arremesso)", maos: "Uma mão", peso: "Leve", tamanho: "Pequena", espaco: 1, especial: "Também funciona como faca de combate corpo a corpo (teste de Luta em vez de Pontaria) e como ferramenta de escalada." },
    { nome: "Kanabo", categoria: "Impacto", nivel: 3, proficiencia: "Marcial", dano: "1d12", pericia: "Luta", alcance: "Médio", maos: "Duas mãos", peso: "Pesado", tamanho: "Grande", espaco: 4, especial: "Ignora parte da proteção de armaduras leves." },
    { nome: "Jitte", categoria: "Impacto", nivel: 1, proficiencia: "Simples", dano: "1d4", pericia: "Luta", alcance: "Curto", maos: "Uma mão", peso: "Leve", tamanho: "Pequena", espaco: 1, especial: "Pode ser usada para desarmar o oponente." },
    { nome: "Tessen", categoria: "Impacto", nivel: 2, proficiencia: "Simples", dano: "1d4", pericia: "Luta", alcance: "Curto", maos: "Uma mão", peso: "Leve", tamanho: "Pequena", espaco: 1, especial: "Discreta; passa despercebida em ambientes formais." },
    { nome: "Senbon", categoria: "Distância", nivel: 4, proficiencia: "Simples", dano: "1d3", pericia: "Pontaria", alcance: "Curto (arremesso)", maos: "Uma mão", peso: "Leve", tamanho: "Pequena", espaco: 1, especial: "Pode arremessar até 3 de uma vez em um único ataque; pode ser untado com veneno antes do uso." },
    { nome: "Tekkō", categoria: "Impacto", nivel: 0, proficiencia: "Simples", dano: "2xFOR", pericia: "Luta", alcance: "Curto", maos: "Uma ou duas mãos", peso: "Leve", tamanho: "Pequena", espaco: 1, especial: "Soqueiras de ferro; o dano é igual ao dobro da sua Força." },
    { nome: "Nunchako", categoria: "Impacto", nivel: 2, proficiencia: "Simples", dano: "1d4", pericia: "Luta", alcance: "Curto", maos: "Uma mão", peso: "Leve", tamanho: "Pequena", espaco: 1, especial: "Pode ser usado para bloquear ataques corpo a corpo com facilidade." },
    { nome: "Kusari-fundo", categoria: "Impacto", nivel: 3, proficiencia: "Marcial", dano: "1d6", pericia: "Luta", alcance: "Médio (com corrente)", maos: "Uma mão", peso: "Leve", tamanho: "Pequena", espaco: 1, especial: "Pode enrolar e imobilizar um membro do alvo, mesmo a curta distância." },
    { nome: "Corrente de Selamento", categoria: "Impacto", nivel: 4, proficiencia: "Ritual", dano: "1d6", pericia: "Luta", alcance: "Médio (com corrente)", maos: "Uma mão", peso: "Leve", tamanho: "Média", espaco: 2, especial: "Pode prender uma entidade em vez de causar dano." },
    { nome: "Shikomi Katana", categoria: "Corte", nivel: 3, proficiencia: "Marcial", dano: "1d8", pericia: "Luta", alcance: "Curto", maos: "Uma mão", peso: "Leve", tamanho: "Pequena", espaco: 1, especial: "Disfarçada de bengala comum; +10 no primeiro ataque se o alvo não souber que é uma arma." },
    { nome: "Sodegarami", categoria: "Haste", nivel: 4, proficiencia: "Marcial", dano: "1d6", pericia: "Luta", alcance: "Longo", maos: "Duas mãos", peso: "Médio", tamanho: "Grande", espaco: 3, especial: "Feita para capturar, não matar: em vez de causar dano, pode prender o alvo pela roupa ou por um membro, deixando-o imobilizado até se soltar." },
    { nome: "Katana", categoria: "Corte", nivel: 2, proficiencia: "Marcial", dano: "1d8", pericia: "Luta", alcance: "Médio", maos: "Uma mão", peso: "Médio", tamanho: "Média", espaco: 2, especial: "Lâmina extremamente afiada; ignora 1 ponto de Proteção do alvo." },
    { nome: "Yoroi Doushi", categoria: "Corte", nivel: 1, proficiencia: "Marcial", dano: "1d6", pericia: "Luta", alcance: "Curto", maos: "Uma mão", peso: "Leve", tamanho: "Pequena", espaco: 1, especial: "Adaga \"perfura-armaduras\": ignora toda a Proteção do alvo." }
];

// Proteções: só uma pode ser equipada por vez (não acumulam entre si)
const listaDeProtecoes = [
    { nome: "Proteção Leve", bonusDefesa: 5, espaco: 2, especial: null },
    { nome: "Proteção Pesada", bonusDefesa: 10, espaco: 3, especial: "-2 em testes de Acrobacia e Furtividade enquanto equipada." }
];

// Escudo: acumula com a proteção, mas só concede o bônus se estiver empunhado
const escudo = { nome: "Escudo", bonusDefesa: 2, espaco: 1, especial: "Só concede o bônus de Defesa se estiver empunhado em uma das mãos." };

let protecaoSelecionada = null;
let escudoEquipado = false;

// Equipamentos especiais e consumíveis possuem regras de espaço próprias.
const listaDeEquipamentosEspeciais = [
    {
        id: "mochilaTatica",
        nome: "Mochila Tática",
        categoria: 1,
        especial: "+2 no espaço total do inventário do personagem. Limite de 1 por pessoa."
    },
    {
        id: "cavalo",
        nome: "Cavalo",
        categoria: 1,
        especial: "Fornece 20 espaços separados do inventário do personagem."
    }
];

// ============================================================
// REGRAS DE COMBATE E CONDIÇÕES DE STATUS (referência para o Modo de Jogo)
// ============================================================
// Conteúdo de referência original do IMPÉRIO — mecânicas numéricas próprias,
// não copiadas de nenhum outro sistema.
const regrasCombate = [
    { titulo: "Teste de Ataque", texto: "Role 1d20 + a perícia usada (Luta para corpo a corpo, Pontaria para à distância). Se o resultado igualar ou superar a Defesa do alvo, o ataque acerta." },
    { titulo: "Acerto Crítico", texto: "Um resultado natural 20 no teste de ataque acerta automaticamente e dobra o dano do golpe." },
    { titulo: "Margem de Dano", texto: "Para cada 5 pontos que o resultado do ataque ultrapassar a Defesa do alvo, some +1d6 de dano extra." },
    { titulo: "Iniciativa", texto: "No início do combate, cada participante rola 1d20 + Agilidade. Os turnos seguem do maior para o menor resultado." },
    { titulo: "Ação Padrão", texto: "Atacar, usar uma perícia com risco, ou conjurar um ritual." },
    { titulo: "Ação de Movimento", texto: "Deslocar-se até o limite de deslocamento, levantar-se do chão ou sacar/guardar um item." },
    { titulo: "Ação Completa", texto: "Substitui a ação padrão e a de movimento no turno; usada para ações mais demoradas." },
    { titulo: "Reação", texto: "Usada fora do seu turno, em resposta a um gatilho específico. Apenas uma por rodada." },
    { titulo: "Ação Livre", texto: "Falar poucas palavras ou soltar algo que já esteja segurando. Não consome outras ações." },
    { titulo: "Deslocamento", texto: "9 metros por turno. Reduzido à metade enquanto uma Proteção Pesada estiver equipada." },
    { titulo: "Descanso Curto", texto: "Até 1 hora de descanso recupera Pontos de Esforço iguais à Presença do personagem." },
    { titulo: "Descanso Longo", texto: "Uma noite inteira de sono recupera todos os PV e PE, além de metade da Sanidade perdida (arredondando para baixo)." }
];

const condicoesStatus = [
    { nome: "Agarrado", efeito: "Não pode se mover nem usar ações que exijam deslocamento. Sofre -5 em testes de Luta e Pontaria até se soltar." },
    { nome: "Alquebrado", efeito: "Até o fim da cena, os ataques do personagem causam -1d6 de dano." },
    { nome: "Apavorado", efeito: "Não pode se aproximar voluntariamente da fonte do medo e sofre -5 em qualquer teste enquanto ela estiver visível." },
    { nome: "Atordoado", efeito: "Perde a próxima ação padrão do turno; só pode agir com ação de movimento ou reação." },
    { nome: "Caído", efeito: "Sofre -5 em ataques corpo a corpo e concede +5 a ataques corpo a corpo feitos contra si. Gasta metade do deslocamento para se levantar." },
    { nome: "Cego", efeito: "Falha automaticamente em testes que dependam de visão e sofre -5 em testes de ataque. Quem o ataca recebe +5 para acertá-lo." },
    { nome: "Confuso", efeito: "No início do turno, role 1d4: 1-2 age normalmente, 3 perde a ação, 4 ataca o alvo mais próximo, aliado ou não." },
    { nome: "Desprevenido", efeito: "Não pode usar reações e sofre -5 na Defesa contra o próximo ataque que receber." },
    { nome: "Enjoado", efeito: "Só pode realizar uma ação por turno — padrão ou de movimento, nunca as duas." },
    { nome: "Exausto", efeito: "Sofre -5 em testes de Força, Agilidade e Vigor até conseguir descansar." },
    { nome: "Fascinado", efeito: "Não pode agir contra a fonte da fascinação e sofre -5 em testes de Percepção para notar qualquer outra coisa." },
    { nome: "Imóvel", efeito: "Não pode se deslocar, mas age normalmente com ações que não dependam de movimento." },
    { nome: "Inconsciente", efeito: "Não pode agir e cai no chão. Qualquer ataque corpo a corpo contra o personagem é automaticamente um acerto crítico." },
    { nome: "Sangrando", efeito: "Perde 1 PV no início de cada turno até receber cuidados ou um teste de Medicina bem-sucedido estancar o ferimento." },
    { nome: "Surdo", efeito: "Falha automaticamente em testes que dependam de audição e não pode reagir a efeitos sonoros." },
    { nome: "Vulnerável", efeito: "O próximo ataque recebido causa dano dobrado." }
];

const listaDeConsumiveis = [
    {
        nome: "Bomba",
        uso: "Pontaria (For ou Agi)",
        alcance: "Médio",
        raio: "3m³",
        espaco: 0.5,
        valor: "10.000"
    },
    {
        nome: "Poção Curativa",
        uso: "Toque",
        alcance: "—",
        raio: "—",
        espaco: 0.5,
        valor: "1.000"
    },
    {
        nome: "Veneno",
        uso: "Toque",
        alcance: "—",
        raio: "—",
        espaco: 0.5,
        valor: "7.000"
    },
    {
        nome: "Antídoto",
        uso: "Toque",
        alcance: "—",
        raio: "—",
        espaco: 0.5,
        valor: "20.000"
    }
];

let equipamentosEspeciais = {
    mochilaTatica: false,
    cavalo: false
};

let espacoOcupadoCavalo = 0;

function criarEstadoConsumiveis() {
    return Object.fromEntries(
        listaDeConsumiveis.map(item => [
            item.nome,
            { personagem: 0, cavalo: 0 }
        ])
    );
}

let consumiveisSelecionados = criarEstadoConsumiveis();

// Calcula o texto de dano de uma arma, resolvendo fórmulas dinâmicas
// (ex.: Tekkō causa o dobro da Força, em vez de um dado fixo)
function calcularDano(arma) {
    if (arma.dano === "2xFOR") {
        return `${atributos.forca * 2} (2× Força)`;
    }

    return arma.dano;
}

// Capacidade de espaço no inventário: 2 se Força for 0, senão Força x 5.
// A Mochila Tática acrescenta 2. Consumíveis do personagem também ocupam espaço.
function capacidadeInventario() {
    const capacidadeBase = atributos.forca === 0 ? 2 : atributos.forca * 5;
    return capacidadeBase + (equipamentosEspeciais.mochilaTatica ? 2 : 0);
}

function capacidadeCavalo() {
    return equipamentosEspeciais.cavalo ? 20 : 0;
}

function espacoConsumiveis(local) {
    return listaDeConsumiveis.reduce((total, item) => {
        const quantidade = Number(consumiveisSelecionados[item.nome]?.[local]) || 0;
        return total + quantidade * item.espaco;
    }, 0);
}

// Quantos "slots" do personagem já estão ocupados.
function espacoUsado() {
    let total = armasSelecionadas.reduce((soma, arma) => soma + arma.espaco, 0);

    if (protecaoSelecionada) total += protecaoSelecionada.espaco;
    if (escudoEquipado) total += escudo.espaco;
    total += espacoConsumiveis("personagem");

    return total;
}

// O espaço reservado para acampamento, água e comida é separado dos consumíveis.
function espacoUsadoCavalo() {
    if (!equipamentosEspeciais.cavalo) return 0;
    return Math.max(0, Number(espacoOcupadoCavalo) || 0) + espacoConsumiveis("cavalo");
}

function toggleEquipamentoEspecial(id) {
    if (!Object.prototype.hasOwnProperty.call(equipamentosEspeciais, id)) return;

    equipamentosEspeciais[id] = !equipamentosEspeciais[id];

    if (id === "cavalo" && !equipamentosEspeciais.cavalo) {
        espacoOcupadoCavalo = 0;
        listaDeConsumiveis.forEach(item => {
            consumiveisSelecionados[item.nome].cavalo = 0;
        });
    }

    mostrarArmas();
    salvarProgresso();
}

function alterarEspacoOcupadoCavalo(valor) {
    if (!equipamentosEspeciais.cavalo) return;

    const consumiveisNoCavalo = espacoConsumiveis("cavalo");
    const limite = Math.max(0, capacidadeCavalo() - consumiveisNoCavalo);
    espacoOcupadoCavalo = Math.max(0, Math.min(limite, Number(valor) || 0));

    mostrarArmas();
    salvarProgresso();
}

function alterarQuantidadeConsumivel(nome, local, valor) {
    const item = listaDeConsumiveis.find(consumivel => consumivel.nome === nome);
    if (!item || !["personagem", "cavalo"].includes(local)) return;
    if (local === "cavalo" && !equipamentosEspeciais.cavalo) return;

    const estadoItem = consumiveisSelecionados[nome];
    const quantidadeAtual = Number(estadoItem?.[local]) || 0;
    const quantidadePedida = Math.max(0, Math.floor(Number(valor) || 0));
    const capacidade = local === "personagem" ? capacidadeInventario() : capacidadeCavalo();
    const usadoAtual = local === "personagem" ? espacoUsado() : espacoUsadoCavalo();
    const disponivelSemEsteItem = capacidade - (usadoAtual - quantidadeAtual * item.espaco);
    const quantidadeMaxima = Math.max(
        0,
        Math.floor((disponivelSemEsteItem / item.espaco) + 0.000001)
    );
    const quantidadeFinal = Math.min(quantidadePedida, quantidadeMaxima);

    if (quantidadeFinal < quantidadePedida) {
        alert(
            `Não há espaço suficiente. Você pode carregar no máximo ${quantidadeMaxima} unidade(s) de ${item.nome} nesse local.`
        );
    }

    consumiveisSelecionados[nome][local] = quantidadeFinal;
    mostrarArmas();
    salvarProgresso();
}

// Texto/valor da proteção atualmente equipada, usado como sugestão do stat "Proteção"
function protecaoEquipadaTexto() {
    return protecaoSelecionada ? protecaoSelecionada.bonusDefesa : 0;
}

// Penalidade de -2 em Acrobacia/Furtividade ao usar Proteção Pesada
function penalidadeArmaduraPesada(nomePericia) {
    const afetadas = ["Acrobacia", "Furtividade"];

    if (protecaoSelecionada?.nome === "Proteção Pesada" && afetadas.includes(nomePericia)) {
        return -2;
    }

    return 0;
}

function toggleProtecao(nome) {
    const protecao = listaDeProtecoes.find(p => p.nome === nome);
    if (!protecao) return;

    const jaEquipada = protecaoSelecionada?.nome === nome;

    if (jaEquipada) {
        protecaoSelecionada = null;
    } else {
        const espacoSemProtecaoAtual = espacoUsado() - (protecaoSelecionada ? protecaoSelecionada.espaco : 0);

        if (espacoSemProtecaoAtual + protecao.espaco > capacidadeInventario()) {
            alert(
                `Seu inventário comporta ${capacidadeInventario()} espaço(s) no total ` +
                `(baseado na sua Força: ${atributos.forca}). Essa proteção ocupa ${protecao.espaco} espaço(s).`
            );
            return;
        }

        protecaoSelecionada = protecao;
    }

    mostrarArmas();
    atualizarCaracteristicas();
    salvarProgresso();
}

function toggleEscudo() {
    if (escudoEquipado) {
        escudoEquipado = false;
    } else {
        if (espacoUsado() + escudo.espaco > capacidadeInventario()) {
            alert(
                `Seu inventário comporta ${capacidadeInventario()} espaço(s) no total ` +
                `(baseado na sua Força: ${atributos.forca}). O escudo ocupa ${escudo.espaco} espaço(s).`
            );
            return;
        }

        escudoEquipado = true;
    }

    mostrarArmas();
    atualizarCaracteristicas();
    salvarProgresso();
}

function toggleArma(nome) {
    const arma = listaDeArmas.find(a => a.nome === nome);
    if (!arma) return;

    const jaSelecionada = armasSelecionadas.some(a => a.nome === nome);

    if (jaSelecionada) {
        armasSelecionadas = armasSelecionadas.filter(a => a.nome !== nome);
    } else {
        if (espacoUsado() + arma.espaco > capacidadeInventario()) {
            alert(
                `Seu inventário comporta ${capacidadeInventario()} espaço(s) no total ` +
                `(baseado na sua Força: ${atributos.forca}). Essa arma ocupa ${arma.espaco} espaço(s), ` +
                `e você já está usando ${espacoUsado()} de ${capacidadeInventario()}.`
            );
            return;
        }

        armasSelecionadas.push(arma);
    }

    mostrarArmas();
    salvarProgresso();
}

function mostrarArmas() {
    const resumo = document.getElementById("resumoArma");
    const lista = document.getElementById("listaArmas");
    if (!lista) return;

    const capacidade = capacidadeInventario();
    const usado = espacoUsado();
    const capacidadeDoCavalo = capacidadeCavalo();
    const usadoDoCavalo = espacoUsadoCavalo();

    if (resumo) {
        resumo.innerHTML = `
            <div class="pontos-box">
                <p>ESPAÇO DE INVENTÁRIO</p>
                <strong>${usado} / ${capacidade}</strong>
                <small>Capacidade pela Força (${atributos.forca})${equipamentosEspeciais.mochilaTatica ? " + Mochila Tática" : ""} — armas, proteção, escudo e consumíveis dividem o mesmo espaço</small>
            </div>
            ${equipamentosEspeciais.cavalo ? `
                <div class="pontos-box pontos-box-cavalo">
                    <p>ESPAÇO DO CAVALO</p>
                    <strong>${usadoDoCavalo} / ${capacidadeDoCavalo}</strong>
                    <small>Inclui o espaço reservado e os consumíveis guardados no cavalo</small>
                </div>
            ` : ""}
        `;
    }

    const protecoesEl = document.getElementById("listaProtecoes");
    if (protecoesEl) {
        const itensProtecao = listaDeProtecoes.map(protecao => {
            const selecionada = protecaoSelecionada?.nome === protecao.nome;
            const semEspaco = !selecionada && (usado + protecao.espaco > capacidade);

            return `
                <label class="arma-item ${selecionada ? "selecionada" : ""} ${semEspaco ? "bloqueada" : ""}">

                    <input type="checkbox"
                           ${selecionada ? "checked" : ""}
                           ${semEspaco ? "disabled" : ""}
                           onchange="toggleProtecao('${protecao.nome}')">

                    <span class="arma-check-indicador"></span>

                    <div class="arma-topo">
                        <h4 class="arma-nome">${protecao.nome}</h4>
                        <span class="arma-dano-badge">+${protecao.bonusDefesa} Defesa</span>
                    </div>

                    <div class="arma-specs">
                        <span><strong>Espaço</strong> ${protecao.espaco} slot${protecao.espaco === 1 ? "" : "s"}</span>
                    </div>

                    ${protecao.especial ? `<p class="arma-especial">${protecao.especial}</p>` : ""}
                    ${semEspaco ? `<p class="arma-motivo">Sem espaço (precisa de ${protecao.espaco}, restam ${capacidade - usado})</p>` : ""}

                </label>
            `;
        }).join("");

        const semEspacoEscudo = !escudoEquipado && (usado + escudo.espaco > capacidade);

        const itemEscudo = `
            <label class="arma-item ${escudoEquipado ? "selecionada" : ""} ${semEspacoEscudo ? "bloqueada" : ""}">

                <input type="checkbox"
                       ${escudoEquipado ? "checked" : ""}
                       ${semEspacoEscudo ? "disabled" : ""}
                       onchange="toggleEscudo()">

                <span class="arma-check-indicador"></span>

                <div class="arma-topo">
                    <h4 class="arma-nome">${escudo.nome}</h4>
                    <span class="arma-dano-badge">+${escudo.bonusDefesa} Defesa</span>
                </div>

                <div class="arma-specs">
                    <span><strong>Espaço</strong> ${escudo.espaco} slot</span>
                </div>

                <p class="arma-especial">${escudo.especial}</p>
                ${semEspacoEscudo ? `<p class="arma-motivo">Sem espaço (precisa de ${escudo.espaco}, restam ${capacidade - usado})</p>` : ""}

            </label>
        `;

        protecoesEl.innerHTML = `
            <div class="grupo-armas">
                <div class="grupo-armas-header">
                    <h3>Proteção <small>(escolha só uma)</small></h3>
                </div>
                <div class="grupo-armas-lista">
                    ${itensProtecao}
                </div>
            </div>

            <div class="grupo-armas">
                <div class="grupo-armas-header">
                    <h3>Escudo <small>(acumula com a proteção)</small></h3>
                </div>
                <div class="grupo-armas-lista">
                    ${itemEscudo}
                </div>
            </div>
        `;
    }

    const categorias = ["Corte", "Haste", "Distância", "Impacto"];

    lista.innerHTML = categorias.map(categoria => {
        const armasDaCategoria = listaDeArmas
            .filter(arma => arma.categoria === categoria)
            .sort((a, b) => a.nivel - b.nivel);
        if (armasDaCategoria.length === 0) return "";

        const itensHTML = armasDaCategoria.map(arma => {
            const selecionada = armasSelecionadas.some(a => a.nome === arma.nome);
            const semEspaco = !selecionada && (usado + arma.espaco > capacidade);

            return `
                <label class="arma-item ${selecionada ? "selecionada" : ""} ${semEspaco ? "bloqueada" : ""}">

                    <input type="checkbox"
                           ${selecionada ? "checked" : ""}
                           ${semEspaco ? "disabled" : ""}
                           onchange="toggleArma('${arma.nome}')">

                    <span class="arma-check-indicador"></span>

                    <span class="arma-nivel-badge arma-nivel-${arma.nivel}">CATEGORIA ${arma.nivel}</span>

                    <div class="arma-topo">
                        <h4 class="arma-nome">${arma.nome}</h4>
                        <span class="arma-dano-badge">${calcularDano(arma)}</span>
                    </div>

                    <div class="arma-specs">
                        <span><strong>Prof.</strong> ${arma.proficiencia}</span>
                        <span><strong>Perícia</strong> ${arma.pericia}</span>
                        <span><strong>Alcance</strong> ${arma.alcance}</span>
                        <span><strong>Mãos</strong> ${arma.maos}</span>
                        <span><strong>Peso</strong> ${arma.peso}</span>
                        <span><strong>Tamanho</strong> ${arma.tamanho}</span>
                        <span><strong>Espaço</strong> ${arma.espaco} slot${arma.espaco === 1 ? "" : "s"}</span>
                    </div>

                    <p class="arma-especial">${arma.especial}</p>

                    ${semEspaco ? `<p class="arma-motivo">Sem espaço (precisa de ${arma.espaco}, restam ${capacidade - usado})</p>` : ""}

                </label>
            `;
        }).join("");

        return `
            <div class="grupo-armas">
                <div class="grupo-armas-header">
                    <h3>${categoria}</h3>
                    <span class="grupo-contador">${armasDaCategoria.length} arma${armasDaCategoria.length === 1 ? "" : "s"}</span>
                </div>
                <div class="grupo-armas-lista">
                    ${itensHTML}
                </div>
            </div>
        `;
    }).join("");

    const especiaisEl = document.getElementById("listaEquipamentosEspeciais");
    if (especiaisEl) {
        especiaisEl.innerHTML = `
            <div class="grupo-armas">
                <div class="grupo-armas-header">
                    <h3>Equipamentos especiais</h3>
                    <span class="grupo-contador">limites próprios</span>
                </div>
                <div class="grupo-armas-lista">
                    ${listaDeEquipamentosEspeciais.map(equipamento => {
                        const selecionado = equipamentosEspeciais[equipamento.id];
                        return `
                            <div class="arma-item equipamento-especial-item ${selecionado ? "selecionada" : ""}">
                                <label class="equipamento-especial-check">
                                    <input type="checkbox"
                                           ${selecionado ? "checked" : ""}
                                           onchange="toggleEquipamentoEspecial('${equipamento.id}')">
                                    <span class="arma-check-indicador"></span>
                                    <span class="arma-nivel-badge arma-nivel-${equipamento.categoria}">CATEGORIA ${equipamento.categoria}</span>
                                    <div class="arma-topo">
                                        <h4 class="arma-nome">${equipamento.nome}</h4>
                                    </div>
                                </label>
                                <p class="arma-especial">${equipamento.especial}</p>
                                ${equipamento.id === "cavalo" && selecionado ? `
                                    <label class="campo-cavalo">
                                        <span>Espaço já ocupado no cavalo (acampamento, água, comida, etc.)</span>
                                        <input type="number"
                                               min="0"
                                               max="${Math.max(0, capacidadeDoCavalo - espacoConsumiveis("cavalo"))}"
                                               step="1"
                                               value="${espacoOcupadoCavalo}"
                                               onchange="alterarEspacoOcupadoCavalo(this.value)">
                                    </label>
                                    <p class="espaco-cavalo-restante">
                                        Espaço restante para consumíveis: ${Math.max(0, capacidadeDoCavalo - usadoDoCavalo)}
                                    </p>
                                ` : ""}
                            </div>
                        `;
                    }).join("")}
                </div>
            </div>
        `;
    }

    const consumiveisEl = document.getElementById("listaConsumiveis");
    if (consumiveisEl) {
        consumiveisEl.innerHTML = `
            <div class="grupo-armas">
                <div class="grupo-armas-header">
                    <h3>Consumíveis</h3>
                    <span class="grupo-contador">quantidade livre, conforme o espaço</span>
                </div>
                <div class="grupo-armas-lista">
                    ${listaDeConsumiveis.map(item => {
                        const estado = consumiveisSelecionados[item.nome];
                        return `
                            <div class="arma-item consumivel-item">
                                <div class="arma-topo">
                                    <h4 class="arma-nome">${item.nome}</h4>
                                    <span class="arma-dano-badge">${item.valor}</span>
                                </div>
                                <div class="arma-specs">
                                    <span><strong>Uso</strong> ${item.uso}</span>
                                    <span><strong>Alcance</strong> ${item.alcance}</span>
                                    <span><strong>Raio</strong> ${item.raio}</span>
                                    <span><strong>Espaço</strong> ${item.espaco} por unidade</span>
                                </div>
                                <div class="consumivel-quantidades">
                                    <label>
                                        <span>Personagem</span>
                                        <input type="number"
                                               min="0"
                                               step="1"
                                               value="${estado.personagem}"
                                               onchange="alterarQuantidadeConsumivel('${item.nome}', 'personagem', this.value)">
                                    </label>
                                    <label>
                                        <span>Cavalo</span>
                                        <input type="number"
                                               min="0"
                                               step="1"
                                               value="${estado.cavalo}"
                                               ${equipamentosEspeciais.cavalo ? "" : "disabled"}
                                               onchange="alterarQuantidadeConsumivel('${item.nome}', 'cavalo', this.value)">
                                    </label>
                                </div>
                                ${!equipamentosEspeciais.cavalo ? `<p class="arma-motivo">Equipe o Cavalo para guardar consumíveis nele.</p>` : ""}
                            </div>
                        `;
                    }).join("")}
                </div>
            </div>
        `;
    }
}

// Quantidade-base de perícias à escolha por categoria (antes de somar Intelecto)
function baseLimitePericiasCategoria(categoria) {
    if (categoria === "combatente") return 1;
    if (categoria === "especialista") return 7;
    if (categoria === "ocultista") return 3;
    return 0;
}

// Cada escolha do talento "Domínio Expandido" concede +2 perícias treinadas
function bonusPericiasDominioExpandido() {
    if (!categoriaSelecionada || !talentosEscolhidos[categoriaSelecionada]) return 0;

    return Object.values(talentosEscolhidos[categoriaSelecionada])
        .filter(nomeTalento => nomeTalento === "Domínio Expandido")
        .length * 2;
}

// Limite total de perícias que podem ser escolhidas livremente na Etapa de Perícias
function limitePericias() {
    if (!categoriaSelecionada) return 0;
    return baseLimitePericiasCategoria(categoriaSelecionada) + atributos.intelecto + bonusPericiasDominioExpandido();
}

function togglePericia(nome) {
    const pericia = listaDePericias.find(p => p.nome === nome);
    if (!pericia) return;

    // Perícias garantidas pela origem já vêm treinadas de graça e não podem ser alteradas aqui
    if (origemSelecionada && origemSelecionada.pericias.includes(nome)) return;

    const jaSelecionada = periciasSelecionadas.includes(nome);

    if (jaSelecionada) {
        periciasSelecionadas = periciasSelecionadas.filter(n => n !== nome);
    } else {
        if (periciasSelecionadas.length >= limitePericias()) {
            return;
        }
        periciasSelecionadas.push(nome);
    }

    mostrarPericias();
    salvarProgresso();
}

// Texto combinando as perícias grátis da origem com as escolhidas na etapa 5
function textoPericias() {
    const nomesOrigem = origemSelecionada ? origemSelecionada.pericias : [];
    const todas = [...new Set([...nomesOrigem, ...periciasSelecionadas])];

    if (todas.length === 0) {
        return "Nenhuma perícia treinada ainda.";
    }

    return todas.map(nome => {
        const pericia = listaDePericias.find(p => p.nome === nome);

        if (!pericia) return nome;

        const bonus = 5 + penalidadeArmaduraPesada(nome);

        return `${nome} (${abreviacaoAtributo[pericia.atributo]}, ${bonus >= 0 ? "+" : ""}${bonus})`;
    }).join(", ");
}

function mostrarPericias() {
    const resumo = document.getElementById("resumoPericias");
    const lista = document.getElementById("listaPericias");

    if (!lista) return;

    if (!categoriaSelecionada) {
        if (resumo) {
            resumo.innerHTML = `
                <p class="aviso-vazio">
                    Escolha uma classe antes de treinar perícias.
                </p>
            `;
        }

        lista.innerHTML = "";
        return;
    }

    // Perícias já garantidas de graça pela origem não devem ocupar uma vaga de escolha livre
    if (origemSelecionada) {
        periciasSelecionadas = periciasSelecionadas.filter(nome => !origemSelecionada.pericias.includes(nome));
    }

    const limite = limitePericias();

    if (resumo) {
        resumo.innerHTML = `
            <div class="pontos-box">
                <p>PERÍCIAS TREINADAS</p>
                <strong>${periciasSelecionadas.length} / ${limite}</strong>
                <small>${periciasSelecionadas.length >= limite ? "Limite atingido — desmarque uma perícia para trocar" : `Escolha até ${limite} perícias (${baseLimitePericiasCategoria(categoriaSelecionada)} + Intelecto${bonusPericiasDominioExpandido() > 0 ? " + Domínio Expandido" : ""})`}</small>
            </div>
        `;
    }

    const nomesAtributo = {
        agilidade: "Agilidade",
        forca: "Força",
        intelecto: "Intelecto",
        presenca: "Presença",
        vigor: "Vigor"
    };

    const ordemAtributos = ["agilidade", "forca", "intelecto", "presenca", "vigor"];

    const periciasDaOrigem = origemSelecionada ? origemSelecionada.pericias : [];

    lista.innerHTML = ordemAtributos.map(atributo => {
        const valorAtributo = atributos[atributo];

        const itensHTML = listaDePericias
            .filter(pericia => pericia.atributo === atributo)
            .map(pericia => {
                const deOrigem = periciasDaOrigem.includes(pericia.nome);
                const selecionada = deOrigem || periciasSelecionadas.includes(pericia.nome);
                const bonus = selecionada ? 5 + penalidadeArmaduraPesada(pericia.nome) : 0;
                const bloqueadaPorLimite = !selecionada && periciasSelecionadas.length >= limite;
                const desabilitado = deOrigem || bloqueadaPorLimite;

                return `
                    <label class="pericia-item ${selecionada ? "selecionada" : ""} ${bloqueadaPorLimite ? "bloqueada-limite" : ""} ${deOrigem ? "pericia-de-origem" : ""}">

                        <input type="checkbox"
                               ${selecionada ? "checked" : ""}
                               ${desabilitado ? "disabled" : ""}
                               onchange="togglePericia('${pericia.nome}')">

                        <span class="pericia-check"></span>

                        <span class="pericia-info">
                            <span class="pericia-nome">
                                ${pericia.nome}${pericia.somenteTreinada ? "*" : ""}
                                ${deOrigem ? `<span class="tag-pericia-origem">Origem</span>` : ""}
                            </span>
                        </span>

                        <span class="pericia-bonus">${bonus >= 0 ? "+" : ""}${bonus}</span>

                    </label>
                `;
            })
            .join("");

        return `
            <div class="grupo-pericias">

                <div class="grupo-pericias-header">
                    <h3>${nomesAtributo[atributo]} <span class="grupo-abrev">(${abreviacaoAtributo[atributo]})</span></h3>
                    <span class="grupo-contador">Atributo ${valorAtributo}</span>
                </div>

                <div class="grupo-pericias-lista">
                    ${itensHTML}
                </div>

            </div>
        `;
    }).join("");
}

// ============================================================
// ORIGENS
// ============================================================

const origens = [
    {
        nome: "Samurai",
        descricao: "Você nasceu em uma família de guerreiros e foi entregue ao treinamento ainda criança, aprendendo a manejar a espada antes mesmo de aprender a ler. Cresceu sob um código rígido de lealdade e honra, servindo a um senhor que jurou proteger com a própria vida. A disciplina marcial moldou seu corpo, mas foi o peso da obrigação que moldou quem você é hoje.",
        pericias: ["Luta", "Vontade"],
        habilidade: {
            nome: "Honra do Guerreiro",
            descricao: "Sua vida inteira foi construída em torno de um código que não permite recuar diante da vergonha. Quando falha em um teste de Vontade, você pode gastar 2 PE para invocar esse código e receber +5 nesse teste, recusando-se a ceder ao medo ou à dúvida."
        }
    },
    {
        nome: "Ronin",
        descricao: "Seu mestre morreu, foi deposto ou o abandonou — e com ele se foi o lugar que você ocupava no mundo. Você vagou entre vilas e províncias sem clã, sem bandeira e sem ninguém para responder além de si mesmo. Essa vida errante afiou seus instintos de sobrevivência tanto quanto sua lâmina.",
        pericias: ["Luta", "Sobrevivência"],
        habilidade: {
            nome: "Caminho Solitário",
            descricao: "Anos sem apoio de um clã ensinaram você a confiar apenas em si. Quando estiver sem aliados a até 9 metros de distância, você recebe +2 em testes de Sobrevivência, valendo-se da experiência de quem já enfrentou o mundo sozinho."
        }
    },
    {
        nome: "Camponês",
        descricao: "Você cresceu com terra sob as unhas e o peso da fome sempre à espreita. Cada colheita era uma vitória incerta contra a natureza, os impostos e os senhores que raramente enxergavam seu sofrimento. Esse cotidiano brutal transformou seu corpo em uma ferramenta de resistência.",
        pericias: ["Sobrevivência", "Atletismo"],
        habilidade: {
            nome: "Trabalho Árduo",
            descricao: "Décadas curvado sobre a terra deixaram marcas que se transformaram em força. Você pode gastar 2 PE para receber +5 em um teste envolvendo Força ou Vigor, puxando de dentro de si a resistência de quem nunca teve escolha além de continuar."
        }
    },
    {
        nome: "Ferreiro",
        descricao: "O calor da forja e o cheiro de metal quente são mais familiares para você do que o rosto de muitos parentes. Aprendeu, golpe a golpe, a transformar minério bruto em lâminas capazes de decidir batalhas e vidas capazes de proteger uma vila inteira.",
        pericias: ["Profissão", "Tecnologia"],
        habilidade: {
            nome: "Mãos do Artesão",
            descricao: "Seus dedos conhecem cada rachadura e cada encaixe de um bom equipamento. Você pode gastar 2 PE para reparar temporariamente um item danificado, restaurando parte de sua função com ferramentas improvisadas e conhecimento de ofício."
        }
    },
    {
        nome: "Caçador",
        descricao: "As florestas e montanhas foram sua verdadeira casa por anos, muito antes de qualquer telhado. Aprendeu a ler pegadas, galhos quebrados e o silêncio incomum de um bosque quando algo mais perigoso do que um veado se aproxima.",
        pericias: ["Sobrevivência", "Percepção"],
        habilidade: {
            nome: "Instinto do Caçador",
            descricao: "Você desenvolveu um sexto sentido para presas e predadores. Recebe +2 em testes para rastrear criaturas, seguindo trilhas que a maioria das pessoas sequer notaria existir."
        }
    },
    {
        nome: "Navegador",
        descricao: "Rios, correntes marítimas e as estrelas foram seus mapas por anos de viagem. Levou mercadorias, mensagens e segredos entre portos distantes, aprendendo que o oceano perdoa poucos erros e recompensa apenas quem sabe ler seus sinais.",
        pericias: ["Sobrevivência", "Profissão"],
        habilidade: {
            nome: "Conhecimento das Rotas",
            descricao: "Sua experiência em longas travessias deixou uma bússola interna afiada. Você recebe +5 em testes para encontrar caminhos ou evitar se perder, mesmo em território desconhecido ou sob condições adversas."
        }
    },
    {
        nome: "Mercador",
        descricao: "Você aprendeu cedo que uma boa negociação vale mais do que uma boa espada. Viajou entre cidades comprando, vendendo e avaliando pessoas tão rapidamente quanto avaliava mercadorias, construindo uma rede de contatos em cada lugar por onde passou.",
        pericias: ["Diplomacia", "Intuição"],
        habilidade: {
            nome: "Negociador",
            descricao: "Anos de barganha ensinaram você a encontrar o ângulo certo em qualquer conversa. Você pode gastar 2 PE para receber +5 em um teste de Diplomacia, usando de charme e conhecimento de mercado para virar a mesa a seu favor."
        }
    },
    {
        nome: "Escriba",
        descricao: "Enquanto outros aprendiam a lutar, você aprendia a preservar. Passou anos copiando registros, decretos e relatos antigos, e nesse processo absorveu fragmentos de conhecimento que a maioria das pessoas nunca teve acesso — alguns deles perturbadoramente estranhos.",
        pericias: ["Investigação", "Ciências"],
        habilidade: {
            nome: "Memória Treinada",
            descricao: "Sua mente foi treinada para reter detalhes que outros deixariam escapar. Uma vez por cena, você pode refazer um teste baseado em Intelecto, recorrendo a uma lembrança precisa de algo que já leu ou estudou."
        }
    },
    {
        nome: "Médico",
        descricao: "Você estudou o corpo humano com uma dedicação quase obsessiva, tratando ferimentos de guerra, doenças e males que os curandeiros populares não sabiam nomear. Viu a morte de perto tantas vezes que aprendeu a negociar com ela.",
        pericias: ["Medicina", "Ciências"],
        habilidade: {
            nome: "Primeiros Socorros",
            descricao: "Suas mãos sabem exatamente onde pressionar e o que fazer nos primeiros instantes críticos. Você pode gastar 2 PE para receber +5 em um teste de Medicina, estabilizando um ferimento que exigiria calma e precisão."
        }
    },
    {
        nome: "Sacerdote",
        descricao: "Você cresceu entre incensos, orações e cerimônias que conectam o mundo dos vivos ao dos espíritos. Aprendeu rituais transmitidos por gerações e, com eles, uma sensibilidade incômoda para perceber quando algo além do sagrado está por perto.",
        pericias: ["Religião", "Vontade"],
        habilidade: {
            nome: "Bênção Espiritual",
            descricao: "Sua fé foi forjada em anos de devoção e ritual. Você pode gastar 2 PE para receber +5 em um teste de Vontade, invocando a proteção espiritual que aprendeu a evocar em momentos de desespero."
        }
    },
    {
        nome: "Monge",
        descricao: "Você trocou o mundo exterior por anos de silêncio, meditação e treinamento físico dentro dos muros de um templo. Essa disciplina extrema fortaleceu não apenas seu corpo, mas uma mente capaz de permanecer serena diante do horror.",
        pericias: ["Vontade", "Atletismo"],
        habilidade: {
            nome: "Mente Serena",
            descricao: "A meditação constante blindou sua mente contra o pânico. Você recebe +2 em testes contra medo e efeitos mentais, mantendo a calma onde outros desmoronariam."
        }
    },
    {
        nome: "Contrabandista",
        descricao: "Você aprendeu a mover mercadorias — e às vezes pessoas — por rotas que os postos de fiscalização nunca encontram. Cresceu decorando atalhos, subornando os guardas certos e sabendo exatamente quando desaparecer antes que perguntas incômodas fossem feitas.",
        pericias: ["Furtividade", "Enganação"],
        habilidade: {
            nome: "Rota Alternativa",
            descricao: "Anos evitando postos de fiscalização deixaram você com um mapa mental de caminhos alternativos. Uma vez por sessão, você pode encontrar uma passagem discreta para atravessar uma área vigiada sem ser notado."
        }
    },
    {
        nome: "Ator de Kabuki",
        descricao: "Nos palcos, você aprendeu que uma máscara bem construída pode ser mais convincente que a verdade. Domina expressões, posturas e vozes que não são as suas, e sabe exatamente como fazer uma plateia — ou um interrogador — acreditar em qualquer coisa.",
        pericias: ["Enganação", "Diplomacia"],
        habilidade: {
            nome: "Grande Atuação",
            descricao: "Anos de palco ensinaram você a incorporar qualquer papel sob demanda. Você pode gastar 2 PE para receber +5 em um teste de Enganação, vestindo uma persona convincente o suficiente para enganar até quem desconfia."
        }
    },
    {
        nome: "Artista",
        descricao: "Pincéis, cinzéis ou tinta de caligrafia foram suas ferramentas por anos, transformando observação cuidadosa em obras que capturam detalhes que a maioria das pessoas passa despercebida. Esse olhar treinado se tornou parte de como você enxerga o mundo.",
        pericias: ["Artes", "Percepção"],
        habilidade: {
            nome: "Olhar Artístico",
            descricao: "Seu treinamento visual vai além da estética. Você recebe +2 em testes para perceber detalhes visuais importantes, notando padrões, assimetrias e anomalias que escapam ao olhar comum."
        }
    },
    {
        nome: "Músico",
        descricao: "Você aprendeu que uma melodia certa pode acalmar um coração partido ou incitar uma multidão à raiva. Viajou tocando em festivais, tavernas e cortes, e descobriu cedo o poder que a música exerce sobre as emoções alheias.",
        pericias: ["Artes", "Diplomacia"],
        habilidade: {
            nome: "Canção Inspiradora",
            descricao: "Sua música carrega um peso emocional genuíno. Você pode gastar 2 PE para conceder +2 em um teste realizado por um aliado, inspirando-o com uma melodia ou verso no momento certo."
        }
    },
    {
        nome: "Alquimista",
        descricao: "Você passou anos misturando substâncias, testando reações e registrando resultados que a maioria consideraria perigosos demais para repetir. Seu conhecimento de venenos, elixires e compostos instáveis é tão valioso quanto temido.",
        pericias: ["Ciências", "Profissão"],
        habilidade: {
            nome: "Mistura Improvisada",
            descricao: "Seu laboratório mental funciona mesmo sem equipamento formal. Você pode gastar 2 PE para criar uma substância simples e útil para a cena, combinando ingredientes disponíveis com conhecimento técnico."
        }
    },
    {
        nome: "Herbalista",
        descricao: "Você aprendeu com anciãos da vila, ou sozinho por tentativa e erro, a reconhecer plantas que curam e plantas que matam. Seu conhecimento de remédios naturais salvou vidas onde a medicina formal jamais chegou.",
        pericias: ["Ciências", "Medicina"],
        habilidade: {
            nome: "Remédio Natural",
            descricao: "Você conhece a floresta como uma farmácia viva. Recebe +5 em testes relacionados a ervas e tratamentos naturais, identificando e preparando remédios com o que a natureza oferece."
        }
    },
    {
        nome: "Guarda",
        descricao: "Portões, muralhas e patrulhas noturnas foram seu cotidiano por anos, protegendo pessoas e propriedades de ameaças comuns — até que algumas das ameaças que enfrentou deixaram de ser tão comuns assim.",
        pericias: ["Luta", "Percepção"],
        habilidade: {
            nome: "Sempre Vigilante",
            descricao: "Anos de vigília forjaram reflexos de alerta constante. Você recebe +2 em testes para perceber perigos e emboscadas, raramente sendo pego completamente de surpresa."
        }
    },
    {
        nome: "Assassino",
        descricao: "Você foi treinado para eliminar alvos com precisão silenciosa, aprendendo que um golpe bem colocado vale mais que dez apressados. Sua vida foi construída em torno de discrição, paciência e a capacidade de desaparecer sem deixar rastro.",
        pericias: ["Furtividade", "Luta"],
        habilidade: {
            nome: "Ataque das Sombras",
            descricao: "Seu treinamento prioriza o primeiro golpe acima de todos os outros. Quando atacar um inimigo desprevenido, você pode gastar 2 PE para receber +2 no ataque, aproveitando a vantagem da surpresa ao máximo."
        }
    },
    {
        nome: "Pescador",
        descricao: "Rios e o litoral moldaram sua rotina desde criança, ensinando paciência diante das marés e respeito por um mar que pode alimentar uma vila ou engolir um barco inteiro sem aviso.",
        pericias: ["Sobrevivência", "Atletismo"],
        habilidade: {
            nome: "Vida no Mar",
            descricao: "Você lê a água como outros leem um livro. Recebe +5 em testes relacionados à água e sobrevivência, adaptando-se a correntes, marés e condições que confundiriam qualquer forasteiro."
        }
    },
    {
        nome: "Artesão",
        descricao: "Você dedicou anos a criar objetos com as próprias mãos, do utensílio mais simples ao equipamento mais elaborado, e aprendeu que a diferença entre um trabalho medíocre e um excepcional está na atenção aos pequenos detalhes.",
        pericias: ["Profissão", "Artes"],
        habilidade: {
            nome: "Ferramenta Improvisada",
            descricao: "Sua criatividade prática não depende de um ateliê completo. Você pode improvisar ferramentas simples utilizando materiais disponíveis, resolvendo problemas com o que tiver em mãos."
        }
    },
    {
        nome: "Mensageiro",
        descricao: "Você percorreu estradas, montanhas e territórios hostis carregando informações urgentes demais para esperar. Aprendeu a correr por dias com pouco descanso, sabendo que atrasar uma mensagem podia custar vidas.",
        pericias: ["Atletismo", "Sobrevivência"],
        habilidade: {
            nome: "Passos Incansáveis",
            descricao: "Seu corpo foi condicionado a ignorar os próprios limites. Você pode gastar 2 PE para ignorar penalidades de cansaço durante uma cena, continuando em movimento quando outros já teriam parado."
        }
    },
    {
        nome: "Ermitão",
        descricao: "Você abandonou — ou foi expulso de — a vida em sociedade, vivendo isolado entre montanhas ou florestas densas. O silêncio prolongado trouxe clareza sobre si mesmo, mas também uma familiaridade desconfortável com pensamentos que a maioria evita encarar sozinha.",
        pericias: ["Sobrevivência", "Vontade"],
        habilidade: {
            nome: "Vida Solitária",
            descricao: "O isolamento fortaleceu sua mente de formas que a companhia jamais permitiria. Você recebe +2 em testes de Vontade quando estiver sozinho, confiando apenas na própria determinação."
        }
    },
    {
        nome: "Nobre",
        descricao: "Você cresceu cercado de poder, etiqueta e intrigas de corte, aprendendo desde cedo que uma palavra bem colocada pode valer mais que um exército. Por trás dos bons modos, absorveu os jogos políticos que decidem o destino de províncias inteiras.",
        pericias: ["Diplomacia", "Intuição"],
        habilidade: {
            nome: "Autoridade",
            descricao: "Seu nome ainda carrega peso, mesmo longe da corte. Você pode gastar 2 PE para receber +5 em um teste de Diplomacia, impondo respeito através de linhagem, postura e a certeza de quem está acostumado a ser ouvido."
        }
    },
    {
        nome: "Investigador",
        descricao: "Você passou a vida decifrando crimes e acontecimentos que não faziam sentido à primeira vista, unindo pistas onde outros só viam coincidências. Esse olhar analítico o levou a casos cada vez mais sombrios — alguns que desafiam qualquer explicação racional.",
        pericias: ["Investigação", "Percepção"],
        habilidade: {
            nome: "Olhar Investigativo",
            descricao: "Sua mente organiza detalhes automaticamente, revelando conexões escondidas. Uma vez por cena, você pode receber uma pista adicional ao investigar um local, notando algo que passaria despercebido."
        }
    },
    {
        nome: "Lenhador",
        descricao: "Você passou anos derrubando árvores e enfrentando terrenos traiçoeiros nas florestas e montanhas, construindo uma força física que veio de repetição exaustiva, não de treinamento formal.",
        pericias: ["Atletismo", "Sobrevivência"],
        habilidade: {
            nome: "Força de Trabalho",
            descricao: "Anos de trabalho braçal deixaram sua força além do comum. Você pode gastar 2 PE para receber +5 em um teste usando Força, extraindo potência de músculos acostumados ao esforço contínuo."
        }
    },
    {
        nome: "Funcionário do Daimyo",
        descricao: "Você trabalhou nos bastidores de um senhor feudal, lidando com terras, impostos e documentos que decidiam o destino de vilas inteiras. Aprendeu que o poder verdadeiro muitas vezes está escondido em pilhas de papel, não em espadas.",
        pericias: ["Diplomacia", "Investigação"],
        habilidade: {
            nome: "Conhecimento da Administração",
            descricao: "Seus anos lidando com burocracia oficial deixaram uma familiaridade rara com registros e protocolos. Você recebe +2 em testes envolvendo documentos e informações oficiais, sabendo exatamente onde e como procurar."
        }
    },
    {
        nome: "Criador de Cavalos",
        descricao: "Você dedicou a vida a criar e treinar animais, desenvolvendo uma paciência silenciosa e uma sensibilidade rara para entender criaturas que não falam a mesma língua que você.",
        pericias: ["Adestramento", "Sobrevivência"],
        habilidade: {
            nome: "Domador Experiente",
            descricao: "Sua conexão com animais vai além da técnica. Você recebe +5 em testes relacionados ao treinamento de animais, acalmando ou guiando até as criaturas mais nervosas."
        }
    },
    {
        nome: "Sobrevivente Paranormal",
        descricao: "Algo impossível aconteceu com você — algo que nenhuma explicação racional consegue justificar completamente. Desde então, sua vida se dividiu em um antes e um depois, e uma parte de você nunca mais deixou de olhar por cima do ombro.",
        pericias: ["Ocultismo", "Vontade"],
        habilidade: {
            nome: "Eu Já Vi o Impossível",
            descricao: "O que você presenciou tirou de você a capacidade de se assustar com o comum. Recebe +5 em testes para resistir a efeitos paranormais que causariam medo, porque o pior que podia acontecer, já aconteceu."
        }
    },
    {
        nome: "Cobaia",
        descricao: "Você passou por experimentos que ninguém deveria sobreviver, feitos por mãos que viam seu corpo como matéria-prima e não como uma vida. Algo em você foi reescrito no processo — uma parte do seu corpo não é mais inteiramente humana. Escolha abaixo qual foi a alteração.",
        pericias: ["Fortitude", "Ciências"],
        habilidade: {
            nome: "Corpo Alterado",
            descricao: "Escolha uma das mutações abaixo para definir a alteração física que os experimentos deixaram em você."
        }
    }
];

// ============================================================
// MUTAÇÕES DA ORIGEM "COBAIA"
// ============================================================
// Cada mutação altera uma parte do corpo, concedendo um benefício mecânico
// claro em troca de um custo de Sanidade sempre que esse benefício é usado.
const mutacoesCobaia = [
    { nome: "Garras de Lobo", descricao: "Suas unhas endureceram e se alongaram, podendo se retrair sob a pele quando não usadas.", beneficio: "Ataques desarmados feitos com as garras causam +1d6 de dano.", custo: "Sempre que ferir alguém com as garras, sofre +1 dado extra na perda de Sanidade daquele teste." },
    { nome: "Nadadeiras", descricao: "Entre seus dedos cresceram membranas finas e resistentes, e seus pés se alargaram como os de um nadador nato.", beneficio: "Nada sem penalidade e recebe +5 em testes de Atletismo na água.", custo: "Fora d'água por muito tempo, sofre +1 dado extra na perda de Sanidade em testes de Fortitude." },
    { nome: "Olhos de Gato", descricao: "Suas pupilas se tornaram verticais e refletem a luz no escuro, enxergando onde ninguém mais consegue.", beneficio: "Ignora penalidades de Percepção causadas por pouca luz ou escuridão.", custo: "Luz repentina e forte cega você por um turno e causa +1 dado extra na perda de Sanidade." },
    { nome: "Pele Escamosa", descricao: "Placas rígidas e ásperas substituíram parte da sua pele, como as de um réptil.", beneficio: "Recebe +1 de Defesa.", custo: "Sempre que alguém repara ou comenta sobre sua pele, sofre +1 dado extra na perda de Sanidade." },
    { nome: "Membrana Alar", descricao: "Uma fina membrana de pele se estende entre seus braços e o tronco, esticando-se ao abrir os braços.", beneficio: "Reduz à metade o dano de quedas e permite planar curtas distâncias.", custo: "Ao usar a membrana em público, sofre +1 dado extra na perda de Sanidade." },
    { nome: "Músculos Hipertrofiados", descricao: "Suas fibras musculares se multiplicaram muito além do normal, deformando visivelmente seus braços e ombros.", beneficio: "Em testes de Força, você conta com o dobro do seu Vigor, em vez de uma vez só.", custo: "Sempre que usar esse benefício, sofre +1 dado extra na perda de Sanidade." },
    { nome: "Sentidos de Cão", descricao: "Seu olfato e sua audição se tornaram absurdamente mais aguçados que os de qualquer humano.", beneficio: "Recebe +5 em testes de Percepção para rastrear por cheiro ou som.", custo: "Em ambientes barulhentos ou com cheiros fortes, sofre +1 dado extra na perda de Sanidade." },
    { nome: "Regeneração Acelerada", descricao: "Seus tecidos se recompõem visivelmente mais rápido que o normal, às vezes de forma perturbadora.", beneficio: "Recupera o dobro de Pontos de Vida ao descansar.", custo: "Ao sofrer um ferimento grave, testemunhar a própria regeneração causa +1 dado extra na perda de Sanidade." },
    { nome: "Carapaça Óssea", descricao: "Placas de osso cresceram sob a pele em pontos do seu corpo, endurecendo-o como uma armadura natural.", beneficio: "Recebe +2 de Defesa.", custo: "Sofre -1 em testes de Furtividade e +1 dado extra na perda de Sanidade sempre que é visto sem roupas que a cubram." },
    { nome: "Segunda Pálpebra", descricao: "Uma membrana transparente extra protege seus olhos, semelhante à de répteis e aves.", beneficio: "É imune a efeitos que cegam ou ofuscam a visão.", custo: "Sempre que alguém nota a membrana de perto, sofre +1 dado extra na perda de Sanidade." },
    { nome: "Veneno Sob a Pele", descricao: "Glândulas desconhecidas se formaram em sua boca ou mãos, produzindo uma secreção tóxica.", beneficio: "Um ataque corpo a corpo bem-sucedido por cena pode injetar o veneno, causando dano adicional ao longo do tempo.", custo: "Sempre que usar o veneno contra alguém, sofre +1 dado extra na perda de Sanidade." },
    { nome: "Cauda Preênsil", descricao: "Uma cauda flexível e forte cresceu na base da sua coluna, capaz de segurar objetos leves.", beneficio: "Recebe +2 em testes de Acrobacia envolvendo equilíbrio.", custo: "Esconder a cauda em público é desconfortável; ao ser descoberta, sofre +1 dado extra na perda de Sanidade." },
    { nome: "Pulmões Adaptados", descricao: "Sua capacidade pulmonar cresceu muito além do normal, e seu sangue resiste melhor a substâncias tóxicas.", beneficio: "Pode prender a respiração por até 20 minutos e recebe +5 para resistir a venenos e gases inalados.", custo: "Sempre que usa esse benefício, uma lembrança dos experimentos aflora, causando +1 dado extra na perda de Sanidade." },
    { nome: "Reflexos Turbinados", descricao: "Seu sistema nervoso foi acelerado, fazendo seu corpo reagir antes mesmo de você processar o perigo conscientemente.", beneficio: "Recebe +2 na Iniciativa.", custo: "Em combates longos ou muito caóticos, a sobrecarga sensorial causa +1 dado extra na perda de Sanidade." },
    { nome: "Ecolocalização", descricao: "Sua garganta foi alterada e agora você pode emitir estalos agudos, quase inaudíveis, que retornam como um mapa sonoro do ambiente.", beneficio: "Pode 'enxergar' por som em total escuridão, ignorando penalidades de Percepção nesses casos.", custo: "Usar essa habilidade perto de outras pessoas revela sua voz alterada; ao ser ouvido, sofre +1 dado extra na perda de Sanidade." }
];

// ============================================================
// CLASSES
// ============================================================

const classes = {
    combatente: [
        {
            nome: "Samurai", foco: "Katana, disciplina e honra.",
            descricao: "O Samurai é a lâmina viva de um juramento. Treinado desde a infância na arte da espada e no código de honra que rege sua existência, ele enfrenta o horror não apenas com aço, mas com uma disciplina inabalável que recusa a desonra da retirada. Onde outros hesitam, o Samurai avança — porque hesitar seria trair tudo o que jurou defender. Além de treinar o corpo para o combate direto, o combatente também aprende a liderar aliados em batalha e a manter seu equipamento sempre pronto para o confronto. Perícias treinadas: Luta ou Pontaria (uma das duas) e Fortitude ou Reflexos (uma das duas), mais uma quantidade de perícias à sua escolha igual a 1 + Intelecto. Figuras conhecidas dessa vocação: Isamu Takagawa, Kaito Onodera e Yuto Shibata.",
            pv: 20, pvNex: 4, pe: 2, peNex: 2, san: 12, sanNex: 3,
            proficiencias: "Armas simples, armas táticas e proteções leves.",
            habilidades: ["Honra de Aço", "Espada do Império", "Disciplina Suprema", "Corte Decisivo"],
            progressao: [
                { nex: 5, habilidade: "Ataque Especial (2 PE, +5)" },
                { nex: 10, habilidade: "Habilidade de Trilha" },
                { nex: 15, habilidade: "Poder de Combatente" },
                { nex: 20, habilidade: "Aumento de Atributo" },
                { nex: 25, habilidade: "Ataque Especial (3 PE, +10)" },
                { nex: 30, habilidade: "Poder de Combatente" },
                { nex: 35, habilidade: "Grau de Treinamento" },
                { nex: 40, habilidade: "Habilidade de Trilha" },
                { nex: 45, habilidade: "Poder de Combatente" },
                { nex: 50, habilidade: "Aumento de Atributo, Versatilidade" },
                { nex: 55, habilidade: "Ataque Especial (4 PE, +15)" },
                { nex: 60, habilidade: "Poder de Combatente" },
                { nex: 65, habilidade: "Habilidade de Trilha" },
                { nex: 70, habilidade: "Grau de Treinamento" },
                { nex: 75, habilidade: "Poder de Combatente" },
                { nex: 80, habilidade: "Aumento de Atributo" },
                { nex: 85, habilidade: "Ataque Especial (5 PE, +20)" },
                { nex: 90, habilidade: "Poder de Combatente" },
                { nex: 95, habilidade: "Aumento de Atributo" },
                { nex: 99, habilidade: "Habilidade de Trilha" }
            ]
        },
        {
            nome: "Ronin", foco: "Sobrevivência e combate independente.",
            descricao: "Sem clã, sem mestre e sem rede de apoio, o Ronin aprendeu a transformar o abandono em vantagem. Ele luta de forma imprevisível, adaptando-se ao inimigo à sua frente em vez de seguir uma escola rígida de combate, e sobrevive onde guerreiros mais tradicionais fracassariam por pura teimosia e instinto afiado. Além de treinar o corpo para o combate direto, o combatente também aprende a liderar aliados em batalha e a manter seu equipamento sempre pronto para o confronto. Perícias treinadas: Luta ou Pontaria (uma das duas) e Fortitude ou Reflexos (uma das duas), mais uma quantidade de perícias à sua escolha igual a 1 + Intelecto. Figuras conhecidas dessa vocação: Ren Takagawa, Goro Kuronuma e Haru Toyotomi Jr.",
            pv: 20, pvNex: 4, pe: 2, peNex: 2, san: 12, sanNex: 3,
            proficiencias: "Armas simples, armas táticas e proteções leves.",
            habilidades: ["Caminho Solitário", "Sobrevivente Errante", "Determinação Sem Mestre", "Golpe Adaptativo"],
            progressao: [
                { nex: 5, habilidade: "Ataque Especial (2 PE, +5)" },
                { nex: 10, habilidade: "Habilidade de Trilha" },
                { nex: 15, habilidade: "Poder de Combatente" },
                { nex: 20, habilidade: "Aumento de Atributo" },
                { nex: 25, habilidade: "Ataque Especial (3 PE, +10)" },
                { nex: 30, habilidade: "Poder de Combatente" },
                { nex: 35, habilidade: "Grau de Treinamento" },
                { nex: 40, habilidade: "Habilidade de Trilha" },
                { nex: 45, habilidade: "Poder de Combatente" },
                { nex: 50, habilidade: "Aumento de Atributo, Versatilidade" },
                { nex: 55, habilidade: "Ataque Especial (4 PE, +15)" },
                { nex: 60, habilidade: "Poder de Combatente" },
                { nex: 65, habilidade: "Habilidade de Trilha" },
                { nex: 70, habilidade: "Grau de Treinamento" },
                { nex: 75, habilidade: "Poder de Combatente" },
                { nex: 80, habilidade: "Aumento de Atributo" },
                { nex: 85, habilidade: "Ataque Especial (5 PE, +20)" },
                { nex: 90, habilidade: "Poder de Combatente" },
                { nex: 95, habilidade: "Aumento de Atributo" },
                { nex: 99, habilidade: "Habilidade de Trilha" }
            ]
        },
        {
            nome: "Ashigaru", foco: "Formação militar e resistência.",
            descricao: "O Ashigaru é o soldado forjado em campanhas, treinado para suportar o caos da guerra e lutar em formação ao lado de seus companheiros. Sua força não está em golpes espetaculares, mas na resistência bruta de quem já sobreviveu a batalhas que quebraram guerreiros mais talentosos. Além de treinar o corpo para o combate direto, o combatente também aprende a liderar aliados em batalha e a manter seu equipamento sempre pronto para o confronto. Perícias treinadas: Luta ou Pontaria (uma das duas) e Fortitude ou Reflexos (uma das duas), mais uma quantidade de perícias à sua escolha igual a 1 + Intelecto. Figuras conhecidas dessa vocação: Nozomi Kanzaki, Kaito Fujimori e Nao Shibata.",
            pv: 20, pvNex: 4, pe: 2, peNex: 2, san: 12, sanNex: 3,
            proficiencias: "Armas simples, armas táticas e proteções leves.",
            habilidades: ["Formação de Batalha", "Disciplina Militar", "Resistência de Campanha", "Linha de Frente"],
            progressao: [
                { nex: 5, habilidade: "Ataque Especial (2 PE, +5)" },
                { nex: 10, habilidade: "Habilidade de Trilha" },
                { nex: 15, habilidade: "Poder de Combatente" },
                { nex: 20, habilidade: "Aumento de Atributo" },
                { nex: 25, habilidade: "Ataque Especial (3 PE, +10)" },
                { nex: 30, habilidade: "Poder de Combatente" },
                { nex: 35, habilidade: "Grau de Treinamento" },
                { nex: 40, habilidade: "Habilidade de Trilha" },
                { nex: 45, habilidade: "Poder de Combatente" },
                { nex: 50, habilidade: "Aumento de Atributo, Versatilidade" },
                { nex: 55, habilidade: "Ataque Especial (4 PE, +15)" },
                { nex: 60, habilidade: "Poder de Combatente" },
                { nex: 65, habilidade: "Habilidade de Trilha" },
                { nex: 70, habilidade: "Grau de Treinamento" },
                { nex: 75, habilidade: "Poder de Combatente" },
                { nex: 80, habilidade: "Aumento de Atributo" },
                { nex: 85, habilidade: "Ataque Especial (5 PE, +20)" },
                { nex: 90, habilidade: "Poder de Combatente" },
                { nex: 95, habilidade: "Aumento de Atributo" },
                { nex: 99, habilidade: "Habilidade de Trilha" }
            ]
        },
        {
            nome: "Yari no Senshi", foco: "Alcance e controle.",
            descricao: "Mestre da lança, o Yari no Senshi domina o espaço ao seu redor como ninguém, mantendo inimigos à distância e ditando o ritmo do combate. Cada movimento é calculado para negar ao adversário a chance de se aproximar o suficiente para revidar. Além de treinar o corpo para o combate direto, o combatente também aprende a liderar aliados em batalha e a manter seu equipamento sempre pronto para o confronto. Perícias treinadas: Luta ou Pontaria (uma das duas) e Fortitude ou Reflexos (uma das duas), mais uma quantidade de perícias à sua escolha igual a 1 + Intelecto. Figuras conhecidas dessa vocação: Yui Sakaguchi, Kaito Kuronuma e Nao Kuronuma.",
            pv: 20, pvNex: 4, pe: 2, peNex: 2, san: 12, sanNex: 3,
            proficiencias: "Armas simples, armas táticas e proteções leves.",
            habilidades: ["Alcance Superior", "Parede de Lanças", "Controle de Distância", "Investida Certeira"],
            progressao: [
                { nex: 5, habilidade: "Ataque Especial (2 PE, +5)" },
                { nex: 10, habilidade: "Habilidade de Trilha" },
                { nex: 15, habilidade: "Poder de Combatente" },
                { nex: 20, habilidade: "Aumento de Atributo" },
                { nex: 25, habilidade: "Ataque Especial (3 PE, +10)" },
                { nex: 30, habilidade: "Poder de Combatente" },
                { nex: 35, habilidade: "Grau de Treinamento" },
                { nex: 40, habilidade: "Habilidade de Trilha" },
                { nex: 45, habilidade: "Poder de Combatente" },
                { nex: 50, habilidade: "Aumento de Atributo, Versatilidade" },
                { nex: 55, habilidade: "Ataque Especial (4 PE, +15)" },
                { nex: 60, habilidade: "Poder de Combatente" },
                { nex: 65, habilidade: "Habilidade de Trilha" },
                { nex: 70, habilidade: "Grau de Treinamento" },
                { nex: 75, habilidade: "Poder de Combatente" },
                { nex: 80, habilidade: "Aumento de Atributo" },
                { nex: 85, habilidade: "Ataque Especial (5 PE, +20)" },
                { nex: 90, habilidade: "Poder de Combatente" },
                { nex: 95, habilidade: "Aumento de Atributo" },
                { nex: 99, habilidade: "Habilidade de Trilha" }
            ]
        },
        {
            nome: "Kyudoka", foco: "Arco e precisão.",
            descricao: "O Kyudoka pratica o caminho do arco como uma forma de meditação letal, onde respiração, postura e foco se fundem em um único disparo perfeito. Ele prefere resolver o conflito antes que o inimigo sequer perceba seu risco, atingindo alvos que a maioria julgaria impossíveis. Além de treinar o corpo para o combate direto, o combatente também aprende a liderar aliados em batalha e a manter seu equipamento sempre pronto para o confronto. Perícias treinadas: Luta ou Pontaria (uma das duas) e Fortitude ou Reflexos (uma das duas), mais uma quantidade de perícias à sua escolha igual a 1 + Intelecto. Figuras conhecidas dessa vocação: Nozomi Shibata, Hana Toyotomi Jr. e Kenji Ibaraki.",
            pv: 20, pvNex: 4, pe: 2, peNex: 2, san: 12, sanNex: 3,
            proficiencias: "Armas simples, armas táticas e proteções leves.",
            habilidades: ["Olho do Arqueiro", "Disparo Preciso", "Respiração Controlada", "Flecha Fatal"],
            progressao: [
                { nex: 5, habilidade: "Ataque Especial (2 PE, +5)" },
                { nex: 10, habilidade: "Habilidade de Trilha" },
                { nex: 15, habilidade: "Poder de Combatente" },
                { nex: 20, habilidade: "Aumento de Atributo" },
                { nex: 25, habilidade: "Ataque Especial (3 PE, +10)" },
                { nex: 30, habilidade: "Poder de Combatente" },
                { nex: 35, habilidade: "Grau de Treinamento" },
                { nex: 40, habilidade: "Habilidade de Trilha" },
                { nex: 45, habilidade: "Poder de Combatente" },
                { nex: 50, habilidade: "Aumento de Atributo, Versatilidade" },
                { nex: 55, habilidade: "Ataque Especial (4 PE, +15)" },
                { nex: 60, habilidade: "Poder de Combatente" },
                { nex: 65, habilidade: "Habilidade de Trilha" },
                { nex: 70, habilidade: "Grau de Treinamento" },
                { nex: 75, habilidade: "Poder de Combatente" },
                { nex: 80, habilidade: "Aumento de Atributo" },
                { nex: 85, habilidade: "Ataque Especial (5 PE, +20)" },
                { nex: 90, habilidade: "Poder de Combatente" },
                { nex: 95, habilidade: "Aumento de Atributo" },
                { nex: 99, habilidade: "Habilidade de Trilha" }
            ]
        },
        {
            nome: "Sumo", foco: "Força e agarramento.",
            descricao: "Construído como uma muralha viva, o lutador Sumo usa peso, técnica e força bruta para dominar qualquer adversário no combate corpo a corpo. Poucas criaturas — humanas ou não — conseguem permanecer de pé depois de encará-lo diretamente. Além de treinar o corpo para o combate direto, o combatente também aprende a liderar aliados em batalha e a manter seu equipamento sempre pronto para o confronto. Perícias treinadas: Luta ou Pontaria (uma das duas) e Fortitude ou Reflexos (uma das duas), mais uma quantidade de perícias à sua escolha igual a 1 + Intelecto. Figuras conhecidas dessa vocação: Hiroshi Amano, Tetsu Kagemori e Suzu Onodera.",
            pv: 20, pvNex: 4, pe: 2, peNex: 2, san: 12, sanNex: 3,
            proficiencias: "Armas simples, armas táticas e proteções leves.",
            habilidades: ["Força Avassaladora", "Corpo Inabalável", "Agarramento Supremo", "Impacto Sísmico"],
            progressao: [
                { nex: 5, habilidade: "Ataque Especial (2 PE, +5)" },
                { nex: 10, habilidade: "Habilidade de Trilha" },
                { nex: 15, habilidade: "Poder de Combatente" },
                { nex: 20, habilidade: "Aumento de Atributo" },
                { nex: 25, habilidade: "Ataque Especial (3 PE, +10)" },
                { nex: 30, habilidade: "Poder de Combatente" },
                { nex: 35, habilidade: "Grau de Treinamento" },
                { nex: 40, habilidade: "Habilidade de Trilha" },
                { nex: 45, habilidade: "Poder de Combatente" },
                { nex: 50, habilidade: "Aumento de Atributo, Versatilidade" },
                { nex: 55, habilidade: "Ataque Especial (4 PE, +15)" },
                { nex: 60, habilidade: "Poder de Combatente" },
                { nex: 65, habilidade: "Habilidade de Trilha" },
                { nex: 70, habilidade: "Grau de Treinamento" },
                { nex: 75, habilidade: "Poder de Combatente" },
                { nex: 80, habilidade: "Aumento de Atributo" },
                { nex: 85, habilidade: "Ataque Especial (5 PE, +20)" },
                { nex: 90, habilidade: "Poder de Combatente" },
                { nex: 95, habilidade: "Aumento de Atributo" },
                { nex: 99, habilidade: "Habilidade de Trilha" }
            ]
        },
        {
            nome: "Sohei", foco: "Combate e espiritualidade.",
            descricao: "O Sohei é um monge guerreiro que uniu o treinamento marcial dos templos à disciplina espiritual mais rígida. Ele enfrenta ameaças paranormais com a mesma serenidade que aplica à meditação, tratando cada batalha como uma extensão de sua fé. Além de treinar o corpo para o combate direto, o combatente também aprende a liderar aliados em batalha e a manter seu equipamento sempre pronto para o confronto. Perícias treinadas: Luta ou Pontaria (uma das duas) e Fortitude ou Reflexos (uma das duas), mais uma quantidade de perícias à sua escolha igual a 1 + Intelecto. Figuras conhecidas dessa vocação: Ren Kurogane, Hiroshi Mizushima e Sora Fujimori.",
            pv: 20, pvNex: 4, pe: 2, peNex: 2, san: 12, sanNex: 3,
            proficiencias: "Armas simples, armas táticas e proteções leves.",
            habilidades: ["Disciplina do Templo", "Corpo e Espírito", "Golpe Sagrado", "Purificação em Combate"],
            progressao: [
                { nex: 5, habilidade: "Ataque Especial (2 PE, +5)" },
                { nex: 10, habilidade: "Habilidade de Trilha" },
                { nex: 15, habilidade: "Poder de Combatente" },
                { nex: 20, habilidade: "Aumento de Atributo" },
                { nex: 25, habilidade: "Ataque Especial (3 PE, +10)" },
                { nex: 30, habilidade: "Poder de Combatente" },
                { nex: 35, habilidade: "Grau de Treinamento" },
                { nex: 40, habilidade: "Habilidade de Trilha" },
                { nex: 45, habilidade: "Poder de Combatente" },
                { nex: 50, habilidade: "Aumento de Atributo, Versatilidade" },
                { nex: 55, habilidade: "Ataque Especial (4 PE, +15)" },
                { nex: 60, habilidade: "Poder de Combatente" },
                { nex: 65, habilidade: "Habilidade de Trilha" },
                { nex: 70, habilidade: "Grau de Treinamento" },
                { nex: 75, habilidade: "Poder de Combatente" },
                { nex: 80, habilidade: "Aumento de Atributo" },
                { nex: 85, habilidade: "Ataque Especial (5 PE, +20)" },
                { nex: 90, habilidade: "Poder de Combatente" },
                { nex: 95, habilidade: "Aumento de Atributo" },
                { nex: 99, habilidade: "Habilidade de Trilha" }
            ]
        },
        {
            nome: "Guarda Imperial", foco: "Defesa e proteção.",
            descricao: "Treinado para colocar o próprio corpo entre o perigo e aqueles que jurou proteger, o Guarda Imperial é a última linha de defesa de nobres, fortalezas e aliados em campo. Sua disciplina defensiva torna cada ataque contra seus protegidos uma tarefa quase impossível. Além de treinar o corpo para o combate direto, o combatente também aprende a liderar aliados em batalha e a manter seu equipamento sempre pronto para o confronto. Perícias treinadas: Luta ou Pontaria (uma das duas) e Fortitude ou Reflexos (uma das duas), mais uma quantidade de perícias à sua escolha igual a 1 + Intelecto. Figuras conhecidas dessa vocação: Rin Takagawa, Aiko Hasekura e Emi Onodera.",
            pv: 20, pvNex: 4, pe: 2, peNex: 2, san: 12, sanNex: 3,
            proficiencias: "Armas simples, armas táticas e proteções leves.",
            habilidades: ["Protetor", "Escudo Humano", "Defesa Inabalável", "Guardião Absoluto"],
            progressao: [
                { nex: 5, habilidade: "Ataque Especial (2 PE, +5)" },
                { nex: 10, habilidade: "Habilidade de Trilha" },
                { nex: 15, habilidade: "Poder de Combatente" },
                { nex: 20, habilidade: "Aumento de Atributo" },
                { nex: 25, habilidade: "Ataque Especial (3 PE, +10)" },
                { nex: 30, habilidade: "Poder de Combatente" },
                { nex: 35, habilidade: "Grau de Treinamento" },
                { nex: 40, habilidade: "Habilidade de Trilha" },
                { nex: 45, habilidade: "Poder de Combatente" },
                { nex: 50, habilidade: "Aumento de Atributo, Versatilidade" },
                { nex: 55, habilidade: "Ataque Especial (4 PE, +15)" },
                { nex: 60, habilidade: "Poder de Combatente" },
                { nex: 65, habilidade: "Habilidade de Trilha" },
                { nex: 70, habilidade: "Grau de Treinamento" },
                { nex: 75, habilidade: "Poder de Combatente" },
                { nex: 80, habilidade: "Aumento de Atributo" },
                { nex: 85, habilidade: "Ataque Especial (5 PE, +20)" },
                { nex: 90, habilidade: "Poder de Combatente" },
                { nex: 95, habilidade: "Aumento de Atributo" },
                { nex: 99, habilidade: "Habilidade de Trilha" }
            ]
        },
        {
            nome: "Duelista", foco: "Velocidade e precisão.",
            descricao: "O Duelista transformou o confronto individual em uma forma de arte, valorizando reflexos e precisão acima de força bruta. Cada troca de golpes é um diálogo silencioso entre lâminas, e ele raramente perde a última palavra. Além de treinar o corpo para o combate direto, o combatente também aprende a liderar aliados em batalha e a manter seu equipamento sempre pronto para o confronto. Perícias treinadas: Luta ou Pontaria (uma das duas) e Fortitude ou Reflexos (uma das duas), mais uma quantidade de perícias à sua escolha igual a 1 + Intelecto. Figuras conhecidas dessa vocação: Akira Kanzaki, Masaru Tsukino e Sakura Takagawa.",
            pv: 20, pvNex: 4, pe: 2, peNex: 2, san: 12, sanNex: 3,
            proficiencias: "Armas simples, armas táticas e proteções leves.",
            habilidades: ["Desafio", "Golpe Preciso", "Reflexos do Duelista", "Contra-Ataque"],
            progressao: [
                { nex: 5, habilidade: "Ataque Especial (2 PE, +5)" },
                { nex: 10, habilidade: "Habilidade de Trilha" },
                { nex: 15, habilidade: "Poder de Combatente" },
                { nex: 20, habilidade: "Aumento de Atributo" },
                { nex: 25, habilidade: "Ataque Especial (3 PE, +10)" },
                { nex: 30, habilidade: "Poder de Combatente" },
                { nex: 35, habilidade: "Grau de Treinamento" },
                { nex: 40, habilidade: "Habilidade de Trilha" },
                { nex: 45, habilidade: "Poder de Combatente" },
                { nex: 50, habilidade: "Aumento de Atributo, Versatilidade" },
                { nex: 55, habilidade: "Ataque Especial (4 PE, +15)" },
                { nex: 60, habilidade: "Poder de Combatente" },
                { nex: 65, habilidade: "Habilidade de Trilha" },
                { nex: 70, habilidade: "Grau de Treinamento" },
                { nex: 75, habilidade: "Poder de Combatente" },
                { nex: 80, habilidade: "Aumento de Atributo" },
                { nex: 85, habilidade: "Ataque Especial (5 PE, +20)" },
                { nex: 90, habilidade: "Poder de Combatente" },
                { nex: 95, habilidade: "Aumento de Atributo" },
                { nex: 99, habilidade: "Habilidade de Trilha" }
            ]
        },
        {
            nome: "Caçador de Demônios", foco: "Combate paranormal.",
            descricao: "Enquanto a maioria dos guerreiros treina para enfrentar outros humanos, o Caçador de Demônios prepara corpo e mente para lutar contra yokai, espíritos vingativos e horrores que desafiam a razão. Ele conhece as fraquezas do sobrenatural porque já perdeu companheiros aprendendo-as. Além de treinar o corpo para o combate direto, o combatente também aprende a liderar aliados em batalha e a manter seu equipamento sempre pronto para o confronto. Perícias treinadas: Luta ou Pontaria (uma das duas) e Fortitude ou Reflexos (uma das duas), mais uma quantidade de perícias à sua escolha igual a 1 + Intelecto. Figuras conhecidas dessa vocação: Ichiro Ryusaki, Haru Kuronuma e Toshi Sakaguchi.",
            pv: 20, pvNex: 4, pe: 2, peNex: 2, san: 12, sanNex: 3,
            proficiencias: "Armas simples, armas táticas e proteções leves.",
            habilidades: ["Conhecimento das Criaturas", "Golpe Purificador", "Caçada Paranormal", "Instinto de Predador"],
            progressao: [
                { nex: 5, habilidade: "Ataque Especial (2 PE, +5)" },
                { nex: 10, habilidade: "Habilidade de Trilha" },
                { nex: 15, habilidade: "Poder de Combatente" },
                { nex: 20, habilidade: "Aumento de Atributo" },
                { nex: 25, habilidade: "Ataque Especial (3 PE, +10)" },
                { nex: 30, habilidade: "Poder de Combatente" },
                { nex: 35, habilidade: "Grau de Treinamento" },
                { nex: 40, habilidade: "Habilidade de Trilha" },
                { nex: 45, habilidade: "Poder de Combatente" },
                { nex: 50, habilidade: "Aumento de Atributo, Versatilidade" },
                { nex: 55, habilidade: "Ataque Especial (4 PE, +15)" },
                { nex: 60, habilidade: "Poder de Combatente" },
                { nex: 65, habilidade: "Habilidade de Trilha" },
                { nex: 70, habilidade: "Grau de Treinamento" },
                { nex: 75, habilidade: "Poder de Combatente" },
                { nex: 80, habilidade: "Aumento de Atributo" },
                { nex: 85, habilidade: "Ataque Especial (5 PE, +20)" },
                { nex: 90, habilidade: "Poder de Combatente" },
                { nex: 95, habilidade: "Aumento de Atributo" },
                { nex: 99, habilidade: "Habilidade de Trilha" }
            ]
        }
    ],
    especialista: [
        {
            nome: "Shinobi", foco: "Furtividade e espionagem.",
            descricao: "Treinado nas sombras desde jovem, o Shinobi domina infiltração, disfarce e o silêncio absoluto. Ele entra e sai de lugares que deveriam ser impenetráveis, e quando é notado, geralmente já é tarde demais para impedi-lo. Além de acumular conhecimento amplo sobre diversas áreas, o especialista também desenvolve uma versatilidade rara, sendo capaz de improvisar soluções onde ninguém mais consegue. Perícias treinadas: Uma quantidade de perícias à sua escolha igual a 7 + Intelecto. Figuras conhecidas dessa vocação: Kotaro Hasekura, Kiyomi Kurogane e Tetsu Fujimori.",
            pv: 16, pvNex: 3, pe: 3, peNex: 3, san: 16, sanNex: 4,
            proficiencias: "Armas simples e proteções leves.",
            habilidades: ["Eclético", "Perito", "Infiltração das Sombras", "Desaparecimento"],
            progressao: [
                { nex: 5, habilidade: "Eclético" },
                { nex: 10, habilidade: "Perito" },
                { nex: 15, habilidade: "Poder de Especialista" },
                { nex: 20, habilidade: "Aumento de Atributo" },
                { nex: 25, habilidade: "Versatilidade (1 PE, +5 em perícia treinada)" },
                { nex: 30, habilidade: "Poder de Especialista" },
                { nex: 35, habilidade: "Grau de Perícia" },
                { nex: 40, habilidade: "Habilidade de Trilha" },
                { nex: 45, habilidade: "Poder de Especialista" },
                { nex: 50, habilidade: "Aumento de Atributo, Versatilidade" },
                { nex: 55, habilidade: "Versatilidade (2 PE, +10 em perícia treinada)" },
                { nex: 60, habilidade: "Poder de Especialista" },
                { nex: 65, habilidade: "Habilidade de Trilha" },
                { nex: 70, habilidade: "Grau de Perícia" },
                { nex: 75, habilidade: "Poder de Especialista" },
                { nex: 80, habilidade: "Aumento de Atributo" },
                { nex: 85, habilidade: "Versatilidade (3 PE, +15 em perícia treinada)" },
                { nex: 90, habilidade: "Poder de Especialista" },
                { nex: 95, habilidade: "Aumento de Atributo" },
                { nex: 99, habilidade: "Habilidade de Trilha" }
            ]
        },
        {
            nome: "Rastreador", foco: "Rastreamento e orientação.",
            descricao: "O Rastreador lê o terreno como um livro aberto, reconhecendo pegadas, cheiros e sinais que escapam a olhos destreinados. Contratado por senhores feudais e viajantes para localizar fugitivos, animais perigosos ou caminhos esquecidos, ele raramente perde uma trilha — mesmo quando ela leva a lugares que preferiria não encontrar. Além de acumular conhecimento amplo sobre diversas áreas, o especialista também desenvolve uma versatilidade rara, sendo capaz de improvisar soluções onde ninguém mais consegue. Perícias treinadas: Uma quantidade de perícias à sua escolha igual a 7 + Intelecto. Figuras conhecidas dessa vocação: Daigo Amano, Nao Kagemori e Emi Toyotomi Jr.",
            pv: 16, pvNex: 3, pe: 3, peNex: 3, san: 16, sanNex: 4,
            proficiencias: "Armas simples e proteções leves.",
            habilidades: ["Eclético", "Perito", "Faro para Trilhas", "Instinto de Rastreador"],
            progressao: [
                { nex: 5, habilidade: "Eclético" },
                { nex: 10, habilidade: "Perito" },
                { nex: 15, habilidade: "Poder de Especialista" },
                { nex: 20, habilidade: "Aumento de Atributo" },
                { nex: 25, habilidade: "Versatilidade (1 PE, +5 em perícia treinada)" },
                { nex: 30, habilidade: "Poder de Especialista" },
                { nex: 35, habilidade: "Grau de Perícia" },
                { nex: 40, habilidade: "Habilidade de Trilha" },
                { nex: 45, habilidade: "Poder de Especialista" },
                { nex: 50, habilidade: "Aumento de Atributo, Versatilidade" },
                { nex: 55, habilidade: "Versatilidade (2 PE, +10 em perícia treinada)" },
                { nex: 60, habilidade: "Poder de Especialista" },
                { nex: 65, habilidade: "Habilidade de Trilha" },
                { nex: 70, habilidade: "Grau de Perícia" },
                { nex: 75, habilidade: "Poder de Especialista" },
                { nex: 80, habilidade: "Aumento de Atributo" },
                { nex: 85, habilidade: "Versatilidade (3 PE, +15 em perícia treinada)" },
                { nex: 90, habilidade: "Poder de Especialista" },
                { nex: 95, habilidade: "Aumento de Atributo" },
                { nex: 99, habilidade: "Habilidade de Trilha" }
            ]
        },
        {
            nome: "Cartógrafo", foco: "Mapas, exploração e navegação.",
            descricao: "Enquanto guerreiros temem o desconhecido, o Cartógrafo o documenta. Percorreu regiões inóspitas registrando cada rio, vila e caminho, e aprendeu que um mapa preciso vale tanto quanto um exército — principalmente quando esse mapa marca lugares que ninguém mais ousou catalogar. Além de acumular conhecimento amplo sobre diversas áreas, o especialista também desenvolve uma versatilidade rara, sendo capaz de improvisar soluções onde ninguém mais consegue. Perícias treinadas: Uma quantidade de perícias à sua escolha igual a 7 + Intelecto. Figuras conhecidas dessa vocação: Ichiro Mizushima, Sakura Arakawa e Goro Kuronuma.",
            pv: 16, pvNex: 3, pe: 3, peNex: 3, san: 16, sanNex: 4,
            proficiencias: "Armas simples e proteções leves.",
            habilidades: ["Eclético", "Perito", "Leitura de Terreno", "Rota Conhecida"],
            progressao: [
                { nex: 5, habilidade: "Eclético" },
                { nex: 10, habilidade: "Perito" },
                { nex: 15, habilidade: "Poder de Especialista" },
                { nex: 20, habilidade: "Aumento de Atributo" },
                { nex: 25, habilidade: "Versatilidade (1 PE, +5 em perícia treinada)" },
                { nex: 30, habilidade: "Poder de Especialista" },
                { nex: 35, habilidade: "Grau de Perícia" },
                { nex: 40, habilidade: "Habilidade de Trilha" },
                { nex: 45, habilidade: "Poder de Especialista" },
                { nex: 50, habilidade: "Aumento de Atributo, Versatilidade" },
                { nex: 55, habilidade: "Versatilidade (2 PE, +10 em perícia treinada)" },
                { nex: 60, habilidade: "Poder de Especialista" },
                { nex: 65, habilidade: "Habilidade de Trilha" },
                { nex: 70, habilidade: "Grau de Perícia" },
                { nex: 75, habilidade: "Poder de Especialista" },
                { nex: 80, habilidade: "Aumento de Atributo" },
                { nex: 85, habilidade: "Versatilidade (3 PE, +15 em perícia treinada)" },
                { nex: 90, habilidade: "Poder de Especialista" },
                { nex: 95, habilidade: "Aumento de Atributo" },
                { nex: 99, habilidade: "Habilidade de Trilha" }
            ]
        },
        {
            nome: "Historiador", foco: "Memória viva de tradições e histórias.",
            descricao: "Guardião de histórias que não estão escritas em lugar nenhum, o Historiador viaja recolhendo lendas, canções e relatos transmitidos de geração em geração. Seu conhecimento oral preserva verdades que os registros oficiais convenientemente esqueceram — incluindo avisos antigos sobre o que ronda a escuridão. Além de acumular conhecimento amplo sobre diversas áreas, o especialista também desenvolve uma versatilidade rara, sendo capaz de improvisar soluções onde ninguém mais consegue. Perícias treinadas: Uma quantidade de perícias à sua escolha igual a 7 + Intelecto. Figuras conhecidas dessa vocação: Toshi Ryusaki, Mei Onodera e Jiro Hazuki.",
            pv: 16, pvNex: 3, pe: 3, peNex: 3, san: 16, sanNex: 4,
            proficiencias: "Armas simples e proteções leves.",
            habilidades: ["Eclético", "Perito", "Memória Oral", "Lenda Viva"],
            progressao: [
                { nex: 5, habilidade: "Eclético" },
                { nex: 10, habilidade: "Perito" },
                { nex: 15, habilidade: "Poder de Especialista" },
                { nex: 20, habilidade: "Aumento de Atributo" },
                { nex: 25, habilidade: "Versatilidade (1 PE, +5 em perícia treinada)" },
                { nex: 30, habilidade: "Poder de Especialista" },
                { nex: 35, habilidade: "Grau de Perícia" },
                { nex: 40, habilidade: "Habilidade de Trilha" },
                { nex: 45, habilidade: "Poder de Especialista" },
                { nex: 50, habilidade: "Aumento de Atributo, Versatilidade" },
                { nex: 55, habilidade: "Versatilidade (2 PE, +10 em perícia treinada)" },
                { nex: 60, habilidade: "Poder de Especialista" },
                { nex: 65, habilidade: "Habilidade de Trilha" },
                { nex: 70, habilidade: "Grau de Perícia" },
                { nex: 75, habilidade: "Poder de Especialista" },
                { nex: 80, habilidade: "Aumento de Atributo" },
                { nex: 85, habilidade: "Versatilidade (3 PE, +15 em perícia treinada)" },
                { nex: 90, habilidade: "Poder de Especialista" },
                { nex: 95, habilidade: "Aumento de Atributo" },
                { nex: 99, habilidade: "Habilidade de Trilha" }
            ]
        },
        {
            nome: "Onmyoji", foco: "Conhecimento paranormal.",
            descricao: "Estudioso de presságios, espíritos e do equilíbrio entre os elementos, o Onmyoji interpreta sinais que a maioria ignora por completo. Seu conhecimento acadêmico do oculto o torna capaz de prever perigos antes que se manifestem plenamente. Além de acumular conhecimento amplo sobre diversas áreas, o especialista também desenvolve uma versatilidade rara, sendo capaz de improvisar soluções onde ninguém mais consegue. Perícias treinadas: Uma quantidade de perícias à sua escolha igual a 7 + Intelecto. Figuras conhecidas dessa vocação: Susumu Takagawa, Rin Onodera e Hana Hasekura.",
            pv: 16, pvNex: 3, pe: 3, peNex: 3, san: 16, sanNex: 4,
            proficiencias: "Armas simples e proteções leves.",
            habilidades: ["Eclético", "Perito", "Leitura de Presságios", "Registro do Impossível"],
            progressao: [
                { nex: 5, habilidade: "Eclético" },
                { nex: 10, habilidade: "Perito" },
                { nex: 15, habilidade: "Poder de Especialista" },
                { nex: 20, habilidade: "Aumento de Atributo" },
                { nex: 25, habilidade: "Versatilidade (1 PE, +5 em perícia treinada)" },
                { nex: 30, habilidade: "Poder de Especialista" },
                { nex: 35, habilidade: "Grau de Perícia" },
                { nex: 40, habilidade: "Habilidade de Trilha" },
                { nex: 45, habilidade: "Poder de Especialista" },
                { nex: 50, habilidade: "Aumento de Atributo, Versatilidade" },
                { nex: 55, habilidade: "Versatilidade (2 PE, +10 em perícia treinada)" },
                { nex: 60, habilidade: "Poder de Especialista" },
                { nex: 65, habilidade: "Habilidade de Trilha" },
                { nex: 70, habilidade: "Grau de Perícia" },
                { nex: 75, habilidade: "Poder de Especialista" },
                { nex: 80, habilidade: "Aumento de Atributo" },
                { nex: 85, habilidade: "Versatilidade (3 PE, +15 em perícia treinada)" },
                { nex: 90, habilidade: "Poder de Especialista" },
                { nex: 95, habilidade: "Aumento de Atributo" },
                { nex: 99, habilidade: "Habilidade de Trilha" }
            ]
        },
        {
            nome: "Médico", foco: "Medicina e suporte.",
            descricao: "Treinado para manter aliados vivos mesmo nas piores circunstâncias, o Médico combina conhecimento técnico com uma calma cirúrgica diante do caos. Onde outros veem uma ferida fatal, ele vê um problema a ser resolvido com precisão. Além de acumular conhecimento amplo sobre diversas áreas, o especialista também desenvolve uma versatilidade rara, sendo capaz de improvisar soluções onde ninguém mais consegue. Perícias treinadas: Uma quantidade de perícias à sua escolha igual a 7 + Intelecto. Figuras conhecidas dessa vocação: Daigo Hasekura, Aiko Kurogane e Goro Onodera.",
            pv: 16, pvNex: 3, pe: 3, peNex: 3, san: 16, sanNex: 4,
            proficiencias: "Armas simples e proteções leves.",
            habilidades: ["Eclético", "Perito", "Cirurgia de Campo", "Mãos que Salvam"],
            progressao: [
                { nex: 5, habilidade: "Eclético" },
                { nex: 10, habilidade: "Perito" },
                { nex: 15, habilidade: "Poder de Especialista" },
                { nex: 20, habilidade: "Aumento de Atributo" },
                { nex: 25, habilidade: "Versatilidade (1 PE, +5 em perícia treinada)" },
                { nex: 30, habilidade: "Poder de Especialista" },
                { nex: 35, habilidade: "Grau de Perícia" },
                { nex: 40, habilidade: "Habilidade de Trilha" },
                { nex: 45, habilidade: "Poder de Especialista" },
                { nex: 50, habilidade: "Aumento de Atributo, Versatilidade" },
                { nex: 55, habilidade: "Versatilidade (2 PE, +10 em perícia treinada)" },
                { nex: 60, habilidade: "Poder de Especialista" },
                { nex: 65, habilidade: "Habilidade de Trilha" },
                { nex: 70, habilidade: "Grau de Perícia" },
                { nex: 75, habilidade: "Poder de Especialista" },
                { nex: 80, habilidade: "Aumento de Atributo" },
                { nex: 85, habilidade: "Versatilidade (3 PE, +15 em perícia treinada)" },
                { nex: 90, habilidade: "Poder de Especialista" },
                { nex: 95, habilidade: "Aumento de Atributo" },
                { nex: 99, habilidade: "Habilidade de Trilha" }
            ]
        },
        {
            nome: "Ferreiro", foco: "Artesanato e equipamentos.",
            descricao: "Especialista em armas, ferramentas e reparos, o Ferreiro entende cada engrenagem e cada fio de uma lâmina como uma extensão de suas próprias mãos. Onde um equipamento falha, ele encontra uma solução antes que a situação piore. Além de acumular conhecimento amplo sobre diversas áreas, o especialista também desenvolve uma versatilidade rara, sendo capaz de improvisar soluções onde ninguém mais consegue. Perícias treinadas: Uma quantidade de perícias à sua escolha igual a 7 + Intelecto. Figuras conhecidas dessa vocação: Emi Amano, Sakura Shibata e Daigo Tsukino.",
            pv: 16, pvNex: 3, pe: 3, peNex: 3, san: 16, sanNex: 4,
            proficiencias: "Armas simples e proteções leves.",
            habilidades: ["Eclético", "Perito", "Forja Improvisada", "Manutenção Rápida"],
            progressao: [
                { nex: 5, habilidade: "Eclético" },
                { nex: 10, habilidade: "Perito" },
                { nex: 15, habilidade: "Poder de Especialista" },
                { nex: 20, habilidade: "Aumento de Atributo" },
                { nex: 25, habilidade: "Versatilidade (1 PE, +5 em perícia treinada)" },
                { nex: 30, habilidade: "Poder de Especialista" },
                { nex: 35, habilidade: "Grau de Perícia" },
                { nex: 40, habilidade: "Habilidade de Trilha" },
                { nex: 45, habilidade: "Poder de Especialista" },
                { nex: 50, habilidade: "Aumento de Atributo, Versatilidade" },
                { nex: 55, habilidade: "Versatilidade (2 PE, +10 em perícia treinada)" },
                { nex: 60, habilidade: "Poder de Especialista" },
                { nex: 65, habilidade: "Habilidade de Trilha" },
                { nex: 70, habilidade: "Grau de Perícia" },
                { nex: 75, habilidade: "Poder de Especialista" },
                { nex: 80, habilidade: "Aumento de Atributo" },
                { nex: 85, habilidade: "Versatilidade (3 PE, +15 em perícia treinada)" },
                { nex: 90, habilidade: "Poder de Especialista" },
                { nex: 95, habilidade: "Aumento de Atributo" },
                { nex: 99, habilidade: "Habilidade de Trilha" }
            ]
        },
        {
            nome: "Inventor", foco: "Engenharia e criatividade.",
            descricao: "O Inventor enxerga mecanismos e soluções onde outros só veem problemas. Movido por curiosidade incansável, transforma peças soltas e ideias estranhas em engenhocas que, de alguma forma, sempre funcionam quando mais importa. Além de acumular conhecimento amplo sobre diversas áreas, o especialista também desenvolve uma versatilidade rara, sendo capaz de improvisar soluções onde ninguém mais consegue. Perícias treinadas: Uma quantidade de perícias à sua escolha igual a 7 + Intelecto. Figuras conhecidas dessa vocação: Ichiro Kuronuma, Yuto Mizushima e Jiro Kanzaki.",
            pv: 16, pvNex: 3, pe: 3, peNex: 3, san: 16, sanNex: 4,
            proficiencias: "Armas simples e proteções leves.",
            habilidades: ["Eclético", "Perito", "Engenhosidade", "Protótipo de Emergência"],
            progressao: [
                { nex: 5, habilidade: "Eclético" },
                { nex: 10, habilidade: "Perito" },
                { nex: 15, habilidade: "Poder de Especialista" },
                { nex: 20, habilidade: "Aumento de Atributo" },
                { nex: 25, habilidade: "Versatilidade (1 PE, +5 em perícia treinada)" },
                { nex: 30, habilidade: "Poder de Especialista" },
                { nex: 35, habilidade: "Grau de Perícia" },
                { nex: 40, habilidade: "Habilidade de Trilha" },
                { nex: 45, habilidade: "Poder de Especialista" },
                { nex: 50, habilidade: "Aumento de Atributo, Versatilidade" },
                { nex: 55, habilidade: "Versatilidade (2 PE, +10 em perícia treinada)" },
                { nex: 60, habilidade: "Poder de Especialista" },
                { nex: 65, habilidade: "Habilidade de Trilha" },
                { nex: 70, habilidade: "Grau de Perícia" },
                { nex: 75, habilidade: "Poder de Especialista" },
                { nex: 80, habilidade: "Aumento de Atributo" },
                { nex: 85, habilidade: "Versatilidade (3 PE, +15 em perícia treinada)" },
                { nex: 90, habilidade: "Poder de Especialista" },
                { nex: 95, habilidade: "Aumento de Atributo" },
                { nex: 99, habilidade: "Habilidade de Trilha" }
            ]
        },
        {
            nome: "Diplomata", foco: "Presença e negociação.",
            descricao: "Especialista em alianças, política e influência, o Diplomata sabe que palavras bem escolhidas evitam guerras que a espada jamais venceria. Sua presença impõe respeito mesmo em salões hostis, e ele raramente sai de uma negociação com as mãos vazias. Além de acumular conhecimento amplo sobre diversas áreas, o especialista também desenvolve uma versatilidade rara, sendo capaz de improvisar soluções onde ninguém mais consegue. Perícias treinadas: Uma quantidade de perícias à sua escolha igual a 7 + Intelecto. Figuras conhecidas dessa vocação: Yuto Kanzaki, Akira Mizushima e Haru Kurogane.",
            pv: 16, pvNex: 3, pe: 3, peNex: 3, san: 16, sanNex: 4,
            proficiencias: "Armas simples e proteções leves.",
            habilidades: ["Eclético", "Perito", "Negociador", "Presença Imponente"],
            progressao: [
                { nex: 5, habilidade: "Eclético" },
                { nex: 10, habilidade: "Perito" },
                { nex: 15, habilidade: "Poder de Especialista" },
                { nex: 20, habilidade: "Aumento de Atributo" },
                { nex: 25, habilidade: "Versatilidade (1 PE, +5 em perícia treinada)" },
                { nex: 30, habilidade: "Poder de Especialista" },
                { nex: 35, habilidade: "Grau de Perícia" },
                { nex: 40, habilidade: "Habilidade de Trilha" },
                { nex: 45, habilidade: "Poder de Especialista" },
                { nex: 50, habilidade: "Aumento de Atributo, Versatilidade" },
                { nex: 55, habilidade: "Versatilidade (2 PE, +10 em perícia treinada)" },
                { nex: 60, habilidade: "Poder de Especialista" },
                { nex: 65, habilidade: "Habilidade de Trilha" },
                { nex: 70, habilidade: "Grau de Perícia" },
                { nex: 75, habilidade: "Poder de Especialista" },
                { nex: 80, habilidade: "Aumento de Atributo" },
                { nex: 85, habilidade: "Versatilidade (3 PE, +15 em perícia treinada)" },
                { nex: 90, habilidade: "Poder de Especialista" },
                { nex: 95, habilidade: "Aumento de Atributo" },
                { nex: 99, habilidade: "Habilidade de Trilha" }
            ]
        },
        {
            nome: "Escriba", foco: "Conhecimento e investigação.",
            descricao: "Guardião de documentos e conhecimentos administrativos, o Escriba encontra informações onde ninguém mais procuraria. Sua memória meticulosa e paciência para vasculhar registros antigos já revelaram segredos que muitos preferiam manter enterrados. Além de acumular conhecimento amplo sobre diversas áreas, o especialista também desenvolve uma versatilidade rara, sendo capaz de improvisar soluções onde ninguém mais consegue. Perícias treinadas: Uma quantidade de perícias à sua escolha igual a 7 + Intelecto. Figuras conhecidas dessa vocação: Ichiro Toyotomi Jr., Kotaro Mizushima e Nao Arakawa.",
            pv: 16, pvNex: 3, pe: 3, peNex: 3, san: 16, sanNex: 4,
            proficiencias: "Armas simples e proteções leves.",
            habilidades: ["Eclético", "Perito", "Memória de Arquivo", "Conexão de Registros"],
            progressao: [
                { nex: 5, habilidade: "Eclético" },
                { nex: 10, habilidade: "Perito" },
                { nex: 15, habilidade: "Poder de Especialista" },
                { nex: 20, habilidade: "Aumento de Atributo" },
                { nex: 25, habilidade: "Versatilidade (1 PE, +5 em perícia treinada)" },
                { nex: 30, habilidade: "Poder de Especialista" },
                { nex: 35, habilidade: "Grau de Perícia" },
                { nex: 40, habilidade: "Habilidade de Trilha" },
                { nex: 45, habilidade: "Poder de Especialista" },
                { nex: 50, habilidade: "Aumento de Atributo, Versatilidade" },
                { nex: 55, habilidade: "Versatilidade (2 PE, +10 em perícia treinada)" },
                { nex: 60, habilidade: "Poder de Especialista" },
                { nex: 65, habilidade: "Habilidade de Trilha" },
                { nex: 70, habilidade: "Grau de Perícia" },
                { nex: 75, habilidade: "Poder de Especialista" },
                { nex: 80, habilidade: "Aumento de Atributo" },
                { nex: 85, habilidade: "Versatilidade (3 PE, +15 em perícia treinada)" },
                { nex: 90, habilidade: "Poder de Especialista" },
                { nex: 95, habilidade: "Aumento de Atributo" },
                { nex: 99, habilidade: "Habilidade de Trilha" }
            ]
        }
    ],
    ocultista: [
        {
            nome: "Miko", foco: "Ritual xintoísta e proteção espiritual.",
            descricao: "Servindo em um santuário desde jovem, a Miko aprendeu danças, orações e rituais de purificação destinados a manter espíritos malignos afastados. Quando esses rituais deixaram de ser suficientes, ela precisou aprender a enfrentar diretamente aquilo que antes apenas mantinha à distância. Além de estudar o Outro Lado, o ocultista aprende a canalizar pequenas frações desse poder em rituais controlados, sempre ciente do preço que esse conhecimento cobra. Perícias treinadas: Ocultismo e Vontade, mais uma quantidade de perícias à sua escolha igual a 3 + Intelecto. Figuras conhecidas dessa vocação: Rin Tsukino, Ren Onodera e Ren Shibata.",
            pv: 12, pvNex: 2, pe: 4, peNex: 4, san: 20, sanNex: 5,
            proficiencias: "Armas simples.",
            habilidades: ["Purificação", "Vínculo Espiritual", "Barreira Sagrada", "Chamado dos Kami"],
            progressao: [
                { nex: 5, habilidade: "Ritual Menor (2 PE)" },
                { nex: 10, habilidade: "Afinidade Paranormal" },
                { nex: 15, habilidade: "Poder de Ocultista" },
                { nex: 20, habilidade: "Aumento de Atributo" },
                { nex: 25, habilidade: "Ritual Menor (3 PE)" },
                { nex: 30, habilidade: "Poder de Ocultista" },
                { nex: 35, habilidade: "Grau de Afinidade" },
                { nex: 40, habilidade: "Habilidade de Trilha" },
                { nex: 45, habilidade: "Poder de Ocultista" },
                { nex: 50, habilidade: "Aumento de Atributo, Versatilidade" },
                { nex: 55, habilidade: "Ritual Menor (4 PE)" },
                { nex: 60, habilidade: "Poder de Ocultista" },
                { nex: 65, habilidade: "Habilidade de Trilha" },
                { nex: 70, habilidade: "Grau de Afinidade" },
                { nex: 75, habilidade: "Poder de Ocultista" },
                { nex: 80, habilidade: "Aumento de Atributo" },
                { nex: 85, habilidade: "Ritual Menor (5 PE)" },
                { nex: 90, habilidade: "Poder de Ocultista" },
                { nex: 95, habilidade: "Aumento de Atributo" },
                { nex: 99, habilidade: "Habilidade de Trilha" }
            ]
        },
        {
            nome: "Yamabushi", foco: "Ascetismo nas montanhas e poder elemental.",
            descricao: "O Yamabushi abandonou o conforto da vida em vilarejos para viver em retiro nas montanhas sagradas, submetendo o corpo a provações extremas em busca de poder espiritual. Esse ascetismo o deixou marcado por experiências que a maioria consideraria insanas — e perigosamente capaz de canalizar forças que não deveriam obedecer a um humano. Além de estudar o Outro Lado, o ocultista aprende a canalizar pequenas frações desse poder em rituais controlados, sempre ciente do preço que esse conhecimento cobra. Perícias treinadas: Ocultismo e Vontade, mais uma quantidade de perícias à sua escolha igual a 3 + Intelecto. Figuras conhecidas dessa vocação: Masaru Kuronuma, Sakura Onodera e Masaru Toyotomi Jr.",
            pv: 12, pvNex: 2, pe: 4, peNex: 4, san: 20, sanNex: 5,
            proficiencias: "Armas simples.",
            habilidades: ["Ascese", "Punho Elemental", "Resistência do Eremita", "Fúria da Montanha"],
            progressao: [
                { nex: 5, habilidade: "Ritual Menor (2 PE)" },
                { nex: 10, habilidade: "Afinidade Paranormal" },
                { nex: 15, habilidade: "Poder de Ocultista" },
                { nex: 20, habilidade: "Aumento de Atributo" },
                { nex: 25, habilidade: "Ritual Menor (3 PE)" },
                { nex: 30, habilidade: "Poder de Ocultista" },
                { nex: 35, habilidade: "Grau de Afinidade" },
                { nex: 40, habilidade: "Habilidade de Trilha" },
                { nex: 45, habilidade: "Poder de Ocultista" },
                { nex: 50, habilidade: "Aumento de Atributo, Versatilidade" },
                { nex: 55, habilidade: "Ritual Menor (4 PE)" },
                { nex: 60, habilidade: "Poder de Ocultista" },
                { nex: 65, habilidade: "Habilidade de Trilha" },
                { nex: 70, habilidade: "Grau de Afinidade" },
                { nex: 75, habilidade: "Poder de Ocultista" },
                { nex: 80, habilidade: "Aumento de Atributo" },
                { nex: 85, habilidade: "Ritual Menor (5 PE)" },
                { nex: 90, habilidade: "Poder de Ocultista" },
                { nex: 95, habilidade: "Aumento de Atributo" },
                { nex: 99, habilidade: "Habilidade de Trilha" }
            ]
        },
        {
            nome: "Exorcista", foco: "Confronto direto com entidades e possessões.",
            descricao: "Treinado especificamente para expulsar espíritos que tomaram corpos ou lugares à força, o Exorcista enfrenta possessões que a maioria dos religiosos comuns nem ousaria se aproximar. Ele já olhou nos olhos de algo que usava um rosto humano como máscara e sobreviveu para continuar fazendo isso. Além de estudar o Outro Lado, o ocultista aprende a canalizar pequenas frações desse poder em rituais controlados, sempre ciente do preço que esse conhecimento cobra. Perícias treinadas: Ocultismo e Vontade, mais uma quantidade de perícias à sua escolha igual a 3 + Intelecto. Figuras conhecidas dessa vocação: Nozomi Toyotomi Jr., Rin Hasekura e Yuto Shirasu.",
            pv: 12, pvNex: 2, pe: 4, peNex: 4, san: 20, sanNex: 5,
            proficiencias: "Armas simples.",
            habilidades: ["Rito de Expulsão", "Olhar que Reconhece", "Selo de Contenção", "Última Palavra"],
            progressao: [
                { nex: 5, habilidade: "Ritual Menor (2 PE)" },
                { nex: 10, habilidade: "Afinidade Paranormal" },
                { nex: 15, habilidade: "Poder de Ocultista" },
                { nex: 20, habilidade: "Aumento de Atributo" },
                { nex: 25, habilidade: "Ritual Menor (3 PE)" },
                { nex: 30, habilidade: "Poder de Ocultista" },
                { nex: 35, habilidade: "Grau de Afinidade" },
                { nex: 40, habilidade: "Habilidade de Trilha" },
                { nex: 45, habilidade: "Poder de Ocultista" },
                { nex: 50, habilidade: "Aumento de Atributo, Versatilidade" },
                { nex: 55, habilidade: "Ritual Menor (4 PE)" },
                { nex: 60, habilidade: "Poder de Ocultista" },
                { nex: 65, habilidade: "Habilidade de Trilha" },
                { nex: 70, habilidade: "Grau de Afinidade" },
                { nex: 75, habilidade: "Poder de Ocultista" },
                { nex: 80, habilidade: "Aumento de Atributo" },
                { nex: 85, habilidade: "Ritual Menor (5 PE)" },
                { nex: 90, habilidade: "Poder de Ocultista" },
                { nex: 95, habilidade: "Aumento de Atributo" },
                { nex: 99, habilidade: "Habilidade de Trilha" }
            ]
        },
        {
            nome: "Xamã", foco: "Comunhão com espíritos da natureza.",
            descricao: "Vivendo à margem das grandes vilas, o Xamã aprendeu tradições antigas de comunicação com espíritos de rios, florestas e montanhas. Ele não vê o paranormal como algo a ser combatido por padrão, mas como uma força a ser respeitada, negociada e, quando necessário, apaziguada. Além de estudar o Outro Lado, o ocultista aprende a canalizar pequenas frações desse poder em rituais controlados, sempre ciente do preço que esse conhecimento cobra. Perícias treinadas: Ocultismo e Vontade, mais uma quantidade de perícias à sua escolha igual a 3 + Intelecto. Figuras conhecidas dessa vocação: Yui Arakawa, Haru Kanzaki e Ren Amano.",
            pv: 12, pvNex: 2, pe: 4, peNex: 4, san: 20, sanNex: 5,
            proficiencias: "Armas simples.",
            habilidades: ["Voz dos Espíritos", "Pacto Natural", "Trance Xamânico", "Guardião Invocado"],
            progressao: [
                { nex: 5, habilidade: "Ritual Menor (2 PE)" },
                { nex: 10, habilidade: "Afinidade Paranormal" },
                { nex: 15, habilidade: "Poder de Ocultista" },
                { nex: 20, habilidade: "Aumento de Atributo" },
                { nex: 25, habilidade: "Ritual Menor (3 PE)" },
                { nex: 30, habilidade: "Poder de Ocultista" },
                { nex: 35, habilidade: "Grau de Afinidade" },
                { nex: 40, habilidade: "Habilidade de Trilha" },
                { nex: 45, habilidade: "Poder de Ocultista" },
                { nex: 50, habilidade: "Aumento de Atributo, Versatilidade" },
                { nex: 55, habilidade: "Ritual Menor (4 PE)" },
                { nex: 60, habilidade: "Poder de Ocultista" },
                { nex: 65, habilidade: "Habilidade de Trilha" },
                { nex: 70, habilidade: "Grau de Afinidade" },
                { nex: 75, habilidade: "Poder de Ocultista" },
                { nex: 80, habilidade: "Aumento de Atributo" },
                { nex: 85, habilidade: "Ritual Menor (5 PE)" },
                { nex: 90, habilidade: "Poder de Ocultista" },
                { nex: 95, habilidade: "Aumento de Atributo" },
                { nex: 99, habilidade: "Habilidade de Trilha" }
            ]
        },
        {
            nome: "Estudioso do Vazio", foco: "Pesquisa acadêmica do proibido.",
            descricao: "Ao contrário do Onmyoji, que trata o oculto com tradição e ritual, o Estudioso do Vazio o encara como um campo de pesquisa perigoso e obsessivo. Ele devora textos proibidos e relatos descartados por outros acadêmicos, pagando o preço mental por um conhecimento que poucos deveriam buscar. Além de estudar o Outro Lado, o ocultista aprende a canalizar pequenas frações desse poder em rituais controlados, sempre ciente do preço que esse conhecimento cobra. Perícias treinadas: Ocultismo e Vontade, mais uma quantidade de perícias à sua escolha igual a 3 + Intelecto. Figuras conhecidas dessa vocação: Akira Kagemori, Emi Fujimori e Rin Ryusaki.",
            pv: 12, pvNex: 2, pe: 4, peNex: 4, san: 20, sanNex: 5,
            proficiencias: "Armas simples.",
            habilidades: ["Conhecimento Proibido", "Fragmento de Verdade", "Mente Expandida", "Compreensão Perigosa"],
            progressao: [
                { nex: 5, habilidade: "Ritual Menor (2 PE)" },
                { nex: 10, habilidade: "Afinidade Paranormal" },
                { nex: 15, habilidade: "Poder de Ocultista" },
                { nex: 20, habilidade: "Aumento de Atributo" },
                { nex: 25, habilidade: "Ritual Menor (3 PE)" },
                { nex: 30, habilidade: "Poder de Ocultista" },
                { nex: 35, habilidade: "Grau de Afinidade" },
                { nex: 40, habilidade: "Habilidade de Trilha" },
                { nex: 45, habilidade: "Poder de Ocultista" },
                { nex: 50, habilidade: "Aumento de Atributo, Versatilidade" },
                { nex: 55, habilidade: "Ritual Menor (4 PE)" },
                { nex: 60, habilidade: "Poder de Ocultista" },
                { nex: 65, habilidade: "Habilidade de Trilha" },
                { nex: 70, habilidade: "Grau de Afinidade" },
                { nex: 75, habilidade: "Poder de Ocultista" },
                { nex: 80, habilidade: "Aumento de Atributo" },
                { nex: 85, habilidade: "Ritual Menor (5 PE)" },
                { nex: 90, habilidade: "Poder de Ocultista" },
                { nex: 95, habilidade: "Aumento de Atributo" },
                { nex: 99, habilidade: "Habilidade de Trilha" }
            ]
        },
        {
            nome: "Necromante Ancestral", foco: "Contato com os mortos e espíritos vingativos.",
            descricao: "Rejeitado por templos formais por lidar com práticas consideradas profanas, o Necromante Ancestral aprendeu a se comunicar com os mortos e a negociar com espíritos que se recusam a partir. Caminha em um território moralmente incerto, onde cada resposta obtida dos mortos tem um preço. Além de estudar o Outro Lado, o ocultista aprende a canalizar pequenas frações desse poder em rituais controlados, sempre ciente do preço que esse conhecimento cobra. Perícias treinadas: Ocultismo e Vontade, mais uma quantidade de perícias à sua escolha igual a 3 + Intelecto. Figuras conhecidas dessa vocação: Emi Tsukino, Yui Onodera e Sakura Ibaraki.",
            pv: 12, pvNex: 2, pe: 4, peNex: 4, san: 20, sanNex: 5,
            proficiencias: "Armas simples.",
            habilidades: ["Sussurro dos Mortos", "Vínculo Póstumo", "Toque Gélido", "Convocação Ancestral"],
            progressao: [
                { nex: 5, habilidade: "Ritual Menor (2 PE)" },
                { nex: 10, habilidade: "Afinidade Paranormal" },
                { nex: 15, habilidade: "Poder de Ocultista" },
                { nex: 20, habilidade: "Aumento de Atributo" },
                { nex: 25, habilidade: "Ritual Menor (3 PE)" },
                { nex: 30, habilidade: "Poder de Ocultista" },
                { nex: 35, habilidade: "Grau de Afinidade" },
                { nex: 40, habilidade: "Habilidade de Trilha" },
                { nex: 45, habilidade: "Poder de Ocultista" },
                { nex: 50, habilidade: "Aumento de Atributo, Versatilidade" },
                { nex: 55, habilidade: "Ritual Menor (4 PE)" },
                { nex: 60, habilidade: "Poder de Ocultista" },
                { nex: 65, habilidade: "Habilidade de Trilha" },
                { nex: 70, habilidade: "Grau de Afinidade" },
                { nex: 75, habilidade: "Poder de Ocultista" },
                { nex: 80, habilidade: "Aumento de Atributo" },
                { nex: 85, habilidade: "Ritual Menor (5 PE)" },
                { nex: 90, habilidade: "Poder de Ocultista" },
                { nex: 95, habilidade: "Aumento de Atributo" },
                { nex: 99, habilidade: "Habilidade de Trilha" }
            ]
        },
        {
            nome: "Guardião de Selos", foco: "Contenção e proteção contra incursões paranormais.",
            descricao: "Descendente de uma linhagem responsável por manter selos antigos intactos, o Guardião de Selos dedica a vida a impedir que coisas que não deveriam voltar consigam atravessar. Ele conhece o peso literal de manter uma porta fechada quando algo do outro lado está sempre empurrando. Além de estudar o Outro Lado, o ocultista aprende a canalizar pequenas frações desse poder em rituais controlados, sempre ciente do preço que esse conhecimento cobra. Perícias treinadas: Ocultismo e Vontade, mais uma quantidade de perícias à sua escolha igual a 3 + Intelecto. Figuras conhecidas dessa vocação: Goro Takagawa, Hiroshi Onodera e Sora Yagami.",
            pv: 12, pvNex: 2, pe: 4, peNex: 4, san: 20, sanNex: 5,
            proficiencias: "Armas simples.",
            habilidades: ["Selo Menor", "Vigília Eterna", "Barreira de Contenção", "Fechadura Definitiva"],
            progressao: [
                { nex: 5, habilidade: "Ritual Menor (2 PE)" },
                { nex: 10, habilidade: "Afinidade Paranormal" },
                { nex: 15, habilidade: "Poder de Ocultista" },
                { nex: 20, habilidade: "Aumento de Atributo" },
                { nex: 25, habilidade: "Ritual Menor (3 PE)" },
                { nex: 30, habilidade: "Poder de Ocultista" },
                { nex: 35, habilidade: "Grau de Afinidade" },
                { nex: 40, habilidade: "Habilidade de Trilha" },
                { nex: 45, habilidade: "Poder de Ocultista" },
                { nex: 50, habilidade: "Aumento de Atributo, Versatilidade" },
                { nex: 55, habilidade: "Ritual Menor (4 PE)" },
                { nex: 60, habilidade: "Poder de Ocultista" },
                { nex: 65, habilidade: "Habilidade de Trilha" },
                { nex: 70, habilidade: "Grau de Afinidade" },
                { nex: 75, habilidade: "Poder de Ocultista" },
                { nex: 80, habilidade: "Aumento de Atributo" },
                { nex: 85, habilidade: "Ritual Menor (5 PE)" },
                { nex: 90, habilidade: "Poder de Ocultista" },
                { nex: 95, habilidade: "Aumento de Atributo" },
                { nex: 99, habilidade: "Habilidade de Trilha" }
            ]
        },
        {
            nome: "Adivinho", foco: "Presságios, sorte e manipulação do destino.",
            descricao: "Lendo ossos, cartas ou os padrões da fumaça de incenso, o Adivinho enxerga fragmentos do que está por vir — nem sempre com clareza, e nem sempre com conforto. Ele aprendeu que prever o futuro é mais fácil do que convencer alguém a acreditar nele a tempo. Além de estudar o Outro Lado, o ocultista aprende a canalizar pequenas frações desse poder em rituais controlados, sempre ciente do preço que esse conhecimento cobra. Perícias treinadas: Ocultismo e Vontade, mais uma quantidade de perícias à sua escolha igual a 3 + Intelecto. Figuras conhecidas dessa vocação: Nozomi Amano, Hana Ibaraki e Masaru Onodera.",
            pv: 12, pvNex: 2, pe: 4, peNex: 4, san: 20, sanNex: 5,
            proficiencias: "Armas simples.",
            habilidades: ["Vislumbre do Destino", "Sorte Torta", "Presságio Sombrio", "Ecoar o Amanhã"],
            progressao: [
                { nex: 5, habilidade: "Ritual Menor (2 PE)" },
                { nex: 10, habilidade: "Afinidade Paranormal" },
                { nex: 15, habilidade: "Poder de Ocultista" },
                { nex: 20, habilidade: "Aumento de Atributo" },
                { nex: 25, habilidade: "Ritual Menor (3 PE)" },
                { nex: 30, habilidade: "Poder de Ocultista" },
                { nex: 35, habilidade: "Grau de Afinidade" },
                { nex: 40, habilidade: "Habilidade de Trilha" },
                { nex: 45, habilidade: "Poder de Ocultista" },
                { nex: 50, habilidade: "Aumento de Atributo, Versatilidade" },
                { nex: 55, habilidade: "Ritual Menor (4 PE)" },
                { nex: 60, habilidade: "Poder de Ocultista" },
                { nex: 65, habilidade: "Habilidade de Trilha" },
                { nex: 70, habilidade: "Grau de Afinidade" },
                { nex: 75, habilidade: "Poder de Ocultista" },
                { nex: 80, habilidade: "Aumento de Atributo" },
                { nex: 85, habilidade: "Ritual Menor (5 PE)" },
                { nex: 90, habilidade: "Poder de Ocultista" },
                { nex: 95, habilidade: "Aumento de Atributo" },
                { nex: 99, habilidade: "Habilidade de Trilha" }
            ]
        },
        {
            nome: "Curandeiro Espiritual", foco: "Cura através de rituais e energia espiritual.",
            descricao: "Onde a medicina comum falha, o Curandeiro Espiritual recorre a cerimônias antigas para tratar males que não têm origem no corpo. Aprendeu que algumas feridas sangram alma, não sangue, e que curá-las exige tanto conhecimento ritual quanto compaixão. Além de estudar o Outro Lado, o ocultista aprende a canalizar pequenas frações desse poder em rituais controlados, sempre ciente do preço que esse conhecimento cobra. Perícias treinadas: Ocultismo e Vontade, mais uma quantidade de perícias à sua escolha igual a 3 + Intelecto. Figuras conhecidas dessa vocação: Kenji Shirasu, Aiko Kanzaki e Isamu Hazuki.",
            pv: 12, pvNex: 2, pe: 4, peNex: 4, san: 20, sanNex: 5,
            proficiencias: "Armas simples.",
            habilidades: ["Toque Curativo", "Purificação do Espírito", "Ritual de Restauração", "Vínculo Vital"],
            progressao: [
                { nex: 5, habilidade: "Ritual Menor (2 PE)" },
                { nex: 10, habilidade: "Afinidade Paranormal" },
                { nex: 15, habilidade: "Poder de Ocultista" },
                { nex: 20, habilidade: "Aumento de Atributo" },
                { nex: 25, habilidade: "Ritual Menor (3 PE)" },
                { nex: 30, habilidade: "Poder de Ocultista" },
                { nex: 35, habilidade: "Grau de Afinidade" },
                { nex: 40, habilidade: "Habilidade de Trilha" },
                { nex: 45, habilidade: "Poder de Ocultista" },
                { nex: 50, habilidade: "Aumento de Atributo, Versatilidade" },
                { nex: 55, habilidade: "Ritual Menor (4 PE)" },
                { nex: 60, habilidade: "Poder de Ocultista" },
                { nex: 65, habilidade: "Habilidade de Trilha" },
                { nex: 70, habilidade: "Grau de Afinidade" },
                { nex: 75, habilidade: "Poder de Ocultista" },
                { nex: 80, habilidade: "Aumento de Atributo" },
                { nex: 85, habilidade: "Ritual Menor (5 PE)" },
                { nex: 90, habilidade: "Poder de Ocultista" },
                { nex: 95, habilidade: "Aumento de Atributo" },
                { nex: 99, habilidade: "Habilidade de Trilha" }
            ]
        },
        {
            nome: "Quebrador de Maldições", foco: "Identificação e remoção de maldições.",
            descricao: "Especialista em reconhecer os sinais sutis de uma maldição — um azar persistente demais, uma doença que não responde a tratamento, um objeto que traz desgraça a quem o possui — o Quebrador de Maldições dedica a vida a desfazer amarras que a maioria nem percebe existir. Além de estudar o Outro Lado, o ocultista aprende a canalizar pequenas frações desse poder em rituais controlados, sempre ciente do preço que esse conhecimento cobra. Perícias treinadas: Ocultismo e Vontade, mais uma quantidade de perícias à sua escolha igual a 3 + Intelecto. Figuras conhecidas dessa vocação: Ren Kagemori, Yui Tsukino e Akira Mizushima.",
            pv: 12, pvNex: 2, pe: 4, peNex: 4, san: 20, sanNex: 5,
            proficiencias: "Armas simples.",
            habilidades: ["Olhar Amaldiçoado", "Desfazer o Nó", "Rito de Quebra", "Última Maldição"],
            progressao: [
                { nex: 5, habilidade: "Ritual Menor (2 PE)" },
                { nex: 10, habilidade: "Afinidade Paranormal" },
                { nex: 15, habilidade: "Poder de Ocultista" },
                { nex: 20, habilidade: "Aumento de Atributo" },
                { nex: 25, habilidade: "Ritual Menor (3 PE)" },
                { nex: 30, habilidade: "Poder de Ocultista" },
                { nex: 35, habilidade: "Grau de Afinidade" },
                { nex: 40, habilidade: "Habilidade de Trilha" },
                { nex: 45, habilidade: "Poder de Ocultista" },
                { nex: 50, habilidade: "Aumento de Atributo, Versatilidade" },
                { nex: 55, habilidade: "Ritual Menor (4 PE)" },
                { nex: 60, habilidade: "Poder de Ocultista" },
                { nex: 65, habilidade: "Habilidade de Trilha" },
                { nex: 70, habilidade: "Grau de Afinidade" },
                { nex: 75, habilidade: "Poder de Ocultista" },
                { nex: 80, habilidade: "Aumento de Atributo" },
                { nex: 85, habilidade: "Ritual Menor (5 PE)" },
                { nex: 90, habilidade: "Poder de Ocultista" },
                { nex: 95, habilidade: "Aumento de Atributo" },
                { nex: 99, habilidade: "Habilidade de Trilha" }
            ]
        }
    ]
};

// ============================================================
// TALENTOS (escolhíveis nos slots "Poder de Combatente/Especialista/Ocultista")
// ============================================================
const talentos = {
    combatente: [
        { nome: `Golpe Pesado`, desc: `gasta 1 PE para adicionar seu Vigor como dano extra em um ataque corpo a corpo.` },
        { nome: `Mira Firme`, desc: `ganha +2 em testes de Pontaria a até médio alcance.` },
        { nome: `Fôlego de Guerra`, desc: `recupera 1d6 PV ao início do combate, uma vez por cena.` },
        { nome: `Passo de Combate`, desc: `pode se mover metade do deslocamento como ação livre uma vez por rodada.` },
        { nome: `Guarda Alta`, desc: `enquanto usa arma e escudo, ganha +1 na Defesa.` },
        { nome: `Golpe Duplo`, desc: `uma vez por cena, pode atacar duas vezes com uma ação padrão (segundo ataque com -5).` },
        { nome: `Sangue Frio`, desc: `ganha resistência a efeitos de medo em combate.` },
        { nome: `Marca do Caçador`, desc: `o primeiro ataque contra um alvo específico na cena ganha +1d6 de dano.` },
        { nome: `Domínio Expandido`, desc: `Escolha 2 perícias adicionais para se tornar treinado. Pode escolher este talento mais de uma vez.`, repetivel: true },
    ],
    especialista: [
        { nome: `Leitura Rápida`, desc: `reduz pela metade o tempo de pesquisas e investigações.` },
        { nome: `Mãos Habilidosas`, desc: `ganha +2 em testes para consertar ou construir objetos.` },
        { nome: `Fala Convincente`, desc: `ganha +2 em testes de Diplomacia ou Enganação.` },
        { nome: `Memória de Ferro`, desc: `nunca esquece algo que já leu ou ouviu com atenção.` },
        { nome: `Primeiros Socorros`, desc: `pode gastar 1 PE e uma ação padrão para curar 1d8 PV de um aliado adjacente.` },
        { nome: `Olhar Atento`, desc: `ganha +2 em testes de Percepção e Investigação.` },
        { nome: `Contato Local`, desc: `uma vez por sessão, conhece alguém útil em qualquer vila já visitada.` },
        { nome: `Mente Rápida`, desc: `ganha +2 em testes de Iniciativa.` },
        { nome: `Domínio Expandido`, desc: `Escolha 2 perícias adicionais para se tornar treinado. Pode escolher este talento mais de uma vez.`, repetivel: true },
    ],
    ocultista: [
        { nome: `Sentir o Invisível`, desc: `uma vez por cena, percebe a presença de algo sobrenatural nas proximidades.` },
        { nome: `Amuleto Pessoal`, desc: `cria um amuleto simples que concede +1 em testes de resistência sobrenatural.` },
        { nome: `Fôlego Espiritual`, desc: `recupera 1d6 PE ao início do combate, uma vez por cena.` },
        { nome: `Palavra de Contenção`, desc: `gasta PE para impedir a passagem de uma entidade menor por 1 rodada.` },
        { nome: `Visão Parcial`, desc: `pode enxergar entidades invisíveis/etéreas por alguns instantes, uma vez por cena.` },
        { nome: `Resistência ao Horror`, desc: `ganha +2 em testes de resistência contra perda de Sanidade.` },
        { nome: `Segundo Fôlego`, desc: `uma vez por dia, recupera PE igual à metade do seu Intelecto.` },
        { nome: `Marca Ritualística`, desc: `ganha +1 em testes para realizar rituais.` },
        { nome: `Domínio Expandido`, desc: `Escolha 2 perícias adicionais para se tornar treinado. Pode escolher este talento mais de uma vez.`, repetivel: true },
    ],
};

// ============================================================
// TRILHAS (escolhíveis nos slots "Habilidade de Trilha", poderes em NEX 10/40/65/99)
// ============================================================
const trilhas = {
    combatente: [
        {
            nome: `Espadachim`,
            flavor: `Combate corpo a corpo com uma única arma, priorizando velocidade e precisão sobre força bruta.`,
            poderes: [
                { nex: 10, titulo: `Corte Certeiro`, efeito: `Uma vez por rodada, gaste 1 PE para adicionar +1d6 de dano a um ataque corpo a corpo com arma leve.` },
                { nex: 40, titulo: `Reflexo de Lâmina`, efeito: `Pode usar uma reação para se esquivar automaticamente de um ataque corpo a corpo, uma vez por cena.` },
                { nex: 65, titulo: `Golpe Decisivo`, efeito: `Contra um alvo com menos da metade do PV máximo, seus ataques corpo a corpo causam +2d6 de dano.` },
                { nex: 99, titulo: `Um Só Corte`, efeito: `Uma vez por dia, declare um ataque corpo a corpo como automaticamente certeiro (role apenas o dano).` },
            ]
        },
        {
            nome: `Sentinela`,
            flavor: `Protetores de portões, vilas e senhores, treinados para aguentar o que os outros não suportariam.`,
            poderes: [
                { nex: 10, titulo: `Postura Firme`, efeito: `Enquanto usa armadura pesada, ganha +1 na Defesa e RD 1 contra armas físicas.` },
                { nex: 40, titulo: `Escudo Vivo`, efeito: `Uma vez por rodada, pode gastar uma reação para sofrer o dano de um ataque destinado a um aliado adjacente.` },
                { nex: 65, titulo: `Muralha`, efeito: `Não pode ser movido à força e ganha RD adicional de 2 contra dano físico.` },
                { nex: 99, titulo: `Não Vou Cair`, efeito: `Uma vez por sessão, ignora um ataque que o reduziria a 0 PV.` },
            ]
        },
        {
            nome: `Atirador`,
            flavor: `Especialista em arcos, fundas e armas de longo alcance — vence a batalha antes que o inimigo chegue perto.`,
            poderes: [
                { nex: 10, titulo: `Tiro Preciso`, efeito: `Gaste 1 PE para ignorar penalidades de alcance longo em um ataque à distância.` },
                { nex: 40, titulo: `Tiro Duplo`, efeito: `Uma vez por cena, pode disparar duas flechas/projéteis em uma única ação padrão contra o mesmo alvo.` },
                { nex: 65, titulo: `Olho de Falcão`, efeito: `Ataques à distância contra alvos surpreendidos causam +2d6 de dano.` },
                { nex: 99, titulo: `Flecha que Não Erra`, efeito: `Uma vez por dia, um ataque à distância acerta automaticamente e causa dano máximo.` },
            ]
        },
        {
            nome: `Lutador`,
            flavor: `Combate desarmado, aprendido em treinos duros ou nas ruas — o corpo é a única arma que nunca pode ser tomada.`,
            poderes: [
                { nex: 10, titulo: `Punho de Ferro`, efeito: `Ataques desarmados causam 1d8 de dano e contam como armas leves.` },
                { nex: 40, titulo: `Contra-Golpe`, efeito: `Uma vez por rodada, se for atacado corpo a corpo e errarem, pode gastar 1 PE para atacar de volta imediatamente.` },
                { nex: 65, titulo: `Ruptura`, efeito: `Seus ataques desarmados ignoram metade da RD do alvo.` },
                { nex: 99, titulo: `Golpe que Quebra Ossos`, efeito: `Uma vez por dia, um ataque desarmado bem-sucedido derruba e atordoa o alvo por 1 rodada.` },
            ]
        },
        {
            nome: `Vanguarda`,
            flavor: `Mestres da lança e da alabarda, controlam a distância do combate mantendo os inimigos longe do próprio corpo.`,
            poderes: [
                { nex: 10, titulo: `Alcance Superior`, efeito: `Armas de haste longa ganham 1,5m adicional de alcance sem penalidade.` },
                { nex: 40, titulo: `Investida`, efeito: `Ao se mover em linha reta antes de atacar, ganha +1d6 de dano no ataque.` },
                { nex: 65, titulo: `Guarda de Lança`, efeito: `Uma vez por rodada, pode atacar automaticamente um inimigo que entre em seu alcance.` },
                { nex: 99, titulo: `Lança que Atravessa`, efeito: `Uma vez por dia, um ataque bem-sucedido atinge também um segundo alvo alinhado atrás do primeiro.` },
            ]
        },
    ],
    especialista: [
        {
            nome: `Copista`,
            flavor: `Guardam registros que o poder tentou apagar — sabem nomes, datas e segredos que ninguém mais lembra.`,
            poderes: [
                { nex: 10, titulo: `Registro Vivo`, efeito: `Uma vez por sessão, "lembra" de uma informação histórica relevante à cena (fornecida pelo mestre).` },
                { nex: 40, titulo: `Arquivo Mental`, efeito: `Gaste 1 PE para automaticamente ter sucesso em um teste de conhecimento de dificuldade fácil ou média.` },
                { nex: 65, titulo: `Segredo Exposto`, efeito: `Uma vez por sessão, revela uma fraqueza oculta de um NPC ou criatura relevante.` },
                { nex: 99, titulo: `Biblioteca Viva`, efeito: `Nunca precisa de teste para lembrar informações já reveladas na campanha, e fica imune a efeitos de esquecimento.` },
            ]
        },
        {
            nome: `Batedor`,
            flavor: `Espiões e mensageiros que se movem sem serem vistos entre feudos rivais.`,
            poderes: [
                { nex: 10, titulo: `Passo Leve`, efeito: `Ganha +2 em testes de Furtividade.` },
                { nex: 40, titulo: `Golpe Surpresa`, efeito: `Ataques contra alvos desprevenidos causam +2d6 de dano.` },
                { nex: 65, titulo: `Fuga Perfeita`, efeito: `Uma vez por cena, pode sair de um combate sem provocar ataques de oportunidade e sem ser detectado.` },
                { nex: 99, titulo: `Sombra`, efeito: `Uma vez por sessão, torna-se indetectável (visão, audição, rastreamento) por 1 minuto.` },
            ]
        },
        {
            nome: `Socorrista`,
            flavor: `Treinados em tratar ferimentos no meio do caos, valiosos em qualquer grupo que enfrente o perigo.`,
            poderes: [
                { nex: 10, titulo: `Atendimento Rápido`, efeito: `Gaste uma ação padrão e 2 PE para curar 2d10 PV de si ou de um aliado adjacente.` },
                { nex: 40, titulo: `Tratamento Avançado`, efeito: `Gaste uma ação padrão e 2 PE para remover uma condição negativa (exceto morrendo) de um aliado adjacente.` },
                { nex: 65, titulo: `Resgate`, efeito: `Uma vez por rodada, pode se mover até um aliado ferido usando uma ação livre.` },
                { nex: 99, titulo: `Reanimação`, efeito: `Uma vez por cena, gaste uma ação completa e 10 PE para trazer de volta um personagem morto na mesma cena. Ressuscitar cobra um preço alto: você envelhece 2 anos automaticamente ao usar este poder.` },
            ]
        },
        {
            nome: `Negociador`,
            flavor: `Negociadores hábeis, capazes de resolver com palavras o que outros só resolveriam com lâminas.`,
            poderes: [
                { nex: 10, titulo: `Palavra Certa`, efeito: `Gaste uma ação completa e 1 PE para tentar acalmar ou persuadir um alvo em alcance curto (teste de Diplomacia contra Vontade).` },
                { nex: 40, titulo: `Discurso`, efeito: `Gaste uma ação padrão e 4 PE para inspirar aliados em alcance curto, concedendo +2 em testes de perícia até o fim da cena.` },
                { nex: 65, titulo: `Contatos Úteis`, efeito: `Uma vez por missão, ativa sua rede de contatos para conseguir um favor (equipamento, informação, abrigo).` },
                { nex: 99, titulo: `Mestre da Palavra`, efeito: `Gaste 5 PE para simular uma habilidade que viu um aliado usar durante a cena.` },
            ]
        },
        {
            nome: `Artesão`,
            flavor: `Cuidam do equipamento do grupo e sabem improvisar ferramentas com o que tiverem em mãos.`,
            poderes: [
                { nex: 10, titulo: `Inventário Eficiente`, efeito: `Soma Intelecto à Força para calcular sua capacidade de carga.` },
                { nex: 40, titulo: `Reparo Rápido`, efeito: `Gaste uma ação completa e 1 PE para remover a condição "quebrado" de um equipamento.` },
                { nex: 65, titulo: `Improviso`, efeito: `Gaste uma ação completa e PE para criar uma versão funcional temporária de um equipamento geral.` },
                { nex: 99, titulo: `Sempre Preparado`, efeito: `Gaste uma ação de movimento e PE para "lembrar" que carregava um item não-arma necessário no momento.` },
            ]
        },
    ],
    ocultista: [
        {
            nome: `Purificador`,
            flavor: `Servem a manter o equilíbrio entre o mundo visível e o que espreita por trás dele.`,
            poderes: [
                { nex: 10, titulo: `Selo Simples`, efeito: `Gaste PE para criar uma barreira que impede a passagem de uma entidade menor por 1 rodada.` },
                { nex: 40, titulo: `Purificação`, efeito: `Gaste PE para curar 1d8 de dano de Sanidade em si mesmo ou aliado, uma vez por cena.` },
                { nex: 65, titulo: `Exorcismo`, efeito: `Gaste PE para forçar uma entidade menor ou média a recuar por uma cena inteira.` },
                { nex: 99, titulo: `Selo Absoluto`, efeito: `Uma vez por sessão, sela completamente uma entidade por um tempo prolongado.` },
            ]
        },
        {
            nome: `Eremita`,
            flavor: `Vivem isolados, falando com espíritos da natureza que os homens da cidade esqueceram como ouvir.`,
            poderes: [
                { nex: 10, titulo: `Voz da Mata`, efeito: `Pode se comunicar de forma básica com espíritos da natureza próximos.` },
                { nex: 40, titulo: `Toque Curativo`, efeito: `Gaste PE para curar 2d6 PV de si mesmo ou de um aliado, uma vez por cena.` },
                { nex: 65, titulo: `Fúria da Terra`, efeito: `Uma vez por dia, canaliza dano extra igual ao seu Vigor em um ataque corpo a corpo.` },
                { nex: 99, titulo: `Um com a Montanha`, efeito: `Uma vez por sessão, regenera todo o PV e PE perdidos instantaneamente.` },
            ]
        },
        {
            nome: `Sensitivo`,
            flavor: `Enxergam fragmentos do que foi e do que será — um dom tão útil quanto perigoso para a própria mente.`,
            poderes: [
                { nex: 10, titulo: `Vislumbre`, efeito: `Uma vez por cena, gaste PE para receber uma pista visual breve sobre o que está por vir na cena atual.` },
                { nex: 40, titulo: `Leitura de Objeto`, efeito: `Ao tocar um objeto significativo, pode gastar PE para receber uma impressão de seu passado recente.` },
                { nex: 65, titulo: `Presságio`, efeito: `Uma vez por sessão, prevê um evento próximo relevante à trama (a critério do mestre).` },
                { nex: 99, titulo: `Olhos Além do Tempo`, efeito: `Uma vez por sessão, pode repetir um teste de qualquer personagem na cena, escolhendo o melhor resultado.` },
            ]
        },
        {
            nome: `Médium`,
            flavor: `Conversam com os mortos — e, às vezes, os mortos respondem coisas que não deveriam ser ouvidas.`,
            poderes: [
                { nex: 10, titulo: `Sussurro dos Mortos`, efeito: `Uma vez por cena, gaste PE para fazer uma pergunta simples a um espírito próximo ao local de sua morte.` },
                { nex: 40, titulo: `Corpo Emprestado`, efeito: `Gaste PE para permitir que um espírito aliado se comunique brevemente através de você.` },
                { nex: 65, titulo: `Proteção dos Ancestrais`, efeito: `Uma vez por cena, gaste PE para ganhar RD 3 contra um único ataque sobrenatural.` },
                { nex: 99, titulo: `Ponte Entre Mundos`, efeito: `Uma vez por sessão, pode trazer um espírito para lutar ao seu lado por uma cena.` },
            ]
        },
        {
            nome: `Vinculador`,
            flavor: `Especialistas em conter, prender e neutralizar o que é perigoso demais para ser destruído.`,
            poderes: [
                { nex: 10, titulo: `Marca de Contenção`, efeito: `Gaste PE para marcar um alvo; enquanto marcado, ele sofre penalidade em testes para escapar de prisões ou selos.` },
                { nex: 40, titulo: `Corrente Espiritual`, efeito: `Gaste PE para imobilizar uma entidade menor por 1 rodada.` },
                { nex: 65, titulo: `Prisão Ritual`, efeito: `Gaste PE e uma ação completa para prender uma entidade média em um objeto próximo por uma cena.` },
                { nex: 99, titulo: `Selo Eterno`, efeito: `Uma vez por sessão, prende permanentemente uma entidade derrotada, impedindo seu retorno.` },
            ]
        },
    ],
};

// ============================================================
// RITUAIS (organizados por elemento — Terra, Água, Fogo, Vento, Vazio)
// ============================================================
const rituais = {
    terra: [
        {
            nome: `Abrigo de Pedra`,
            circulo: 1,
            detalhes: `Execução: padrão • Alcance: curto • Efeito: abrigo de 3m de diâmetro • Duração: cena`,
            descricao: `Você ergue um pequeno abrigo de pedra e terra compactada, resistente a impactos e intempéries. Tem RD 5 e 20 PV, e protege quem está dentro de vento, chuva e detritos.`,
            consagracao: `+3 PE: o abrigo dobra de tamanho e a RD aumenta para 8. Requer 2º círculo.`,
            colateral: null
        },
        {
            nome: `Amarras da Terra`,
            circulo: 1,
            detalhes: `Execução: padrão • Alcance: curto • Alvo: 1 ser • Duração: 1 rodada • Resistência: Reflexos evita`,
            descricao: `Raízes e pedras emergem do chão e prendem os pés do alvo, que fica com deslocamento 0 até se soltar (ação padrão + teste de Força ou Atletismo).`,
            consagracao: `+2 PE: afeta até 3 seres em área curta. Requer 2º círculo.`,
            colateral: null
        },
        {
            nome: `Muralha de Argila`,
            circulo: 2,
            detalhes: `Execução: padrão • Alcance: curto • Efeito: parede de 6m de comprimento, 3m de altura • Duração: cena`,
            descricao: `Uma parede de terra endurecida se ergue do chão, bloqueando passagem e linha de visão. Tem RD 6 e 40 PV.`,
            consagracao: `+3 PE: a parede dobra de tamanho e ganha RD 10. Requer 3º círculo.`,
            colateral: null
        },
        {
            nome: `Tremor`,
            circulo: 2,
            detalhes: `Execução: padrão • Alcance: médio • Área: esfera de 6m de raio • Duração: instantânea • Resistência: Reflexos reduz à metade`,
            descricao: `O chão sacode violentamente. Seres na área sofrem 4d8 de dano de impacto e caem prostrados se falharem no teste.`,
            consagracao: `+4 PE: aumenta o dano para 6d8 e a área para 9m de raio. Requer 3º círculo.`,
            colateral: null
        },
        {
            nome: `Armadura de Pedra`,
            circulo: 3,
            detalhes: `Execução: padrão • Alcance: pessoal • Duração: cena`,
            descricao: `Placas de pedra brotam sobre seu corpo, formando uma armadura natural. Você ganha RD 8 contra dano físico e +2 na Defesa, mas seu deslocamento é reduzido em 3m enquanto durar.`,
            consagracao: `+6 PE: a RD aumenta para 12 e você ganha 20 PV temporários. Requer 4º círculo.`,
            colateral: `seus músculos ficam rígidos após o esforço: -2 em testes de Acrobacia até o final do próximo turno.`
        },
        {
            nome: `Túmulo Vivo`,
            circulo: 4,
            detalhes: `Execução: padrão • Alcance: curto • Alvo: 1 ser • Duração: sustentada • Resistência: Fortitude parcial`,
            descricao: `A terra se abre e engole o alvo até o pescoço. Se falhar na resistência, fica completamente imóvel e enterrado, sofrendo 2d8 de dano de impacto por rodada; se passar, fica apenas preso (desloc. 0), sem dano contínuo.`,
            consagracao: `+7 PE: o alvo é puxado inteiramente para dentro da terra, sufocando (regras de sufocamento) até se libertar com um teste de Fortitude no seu turno. Requer afinidade.`,
            colateral: `canalizar tanta terra de uma vez deixa você Fatigado até o final da cena. Se o alvo resistir por completo, você sofre 1d8 de dano de impacto e fica preso (desloc. 0) por 1 rodada.`
        },
        {
            nome: `Espinhos do Chão`,
            circulo: 1,
            detalhes: `Execução: padrão • Alcance: curto • Alvo: 1 ser • Duração: instantânea • Resistência: Reflexos evita metade`,
            descricao: `Pontas de pedra brotam sob os pés do alvo, causando 2d8 de dano de impacto e perfuração. Se falhar, também fica preso (desloc. 0) até se soltar com uma ação padrão e teste de Força ou Atletismo.`,
            consagracao: `+3 PE: dano aumenta para 4d8. Requer 2º círculo.`,
            colateral: null
        },
        {
            nome: `Fôlego da Terra`,
            circulo: 1,
            detalhes: `Execução: padrão • Alcance: toque • Alvo: 1 ser • Duração: 3 rodadas (máximo por conjuração)`,
            descricao: `Enquanto em contato com o solo, o alvo recupera 1d6 PV no início de cada um dos seus turnos, até o limite de 3 rodadas.`,
            consagracao: `+3 PE: cura aumenta para 2d6 PV/turno. Requer 2º círculo.`,
            colateral: null
        },
        {
            nome: `Enxame Subterrâneo`,
            circulo: 2,
            detalhes: `Execução: padrão • Alcance: médio • Área: esfera de 6m • Duração: cena`,
            descricao: `Formas de terra emergem e tentam agarrar quem estiver na área (teste de Ocultismo vs. cada alvo, no início dos seus turnos).`,
            consagracao: `+4 PE: área aumenta para 9m e alvos agarrados sofrem 1d6 de dano por rodada. Requer 3º círculo.`,
            colateral: null
        },
        {
            nome: `Peso da Montanha`,
            circulo: 2,
            detalhes: `Execução: padrão • Alcance: curto • Alvo: 1 ser • Duração: cena • Resistência: Fortitude evita`,
            descricao: `O corpo do alvo fica pesado como pedra: deslocamento reduzido pela metade, não pode voar ou levitar.`,
            consagracao: `+3 PE: também zera natação e escalada; resistência passa a ser parcial. Requer 3º círculo.`,
            colateral: null
        },
        {
            nome: `Decomposição`,
            circulo: 3,
            detalhes: `Execução: padrão • Alcance: médio • Área: esfera de 9m • Duração: instantânea`,
            descricao: `Vegetação e matéria orgânica apodrecem e o solo vira lama (terreno difícil pelo resto da cena).`,
            consagracao: `+5 PE: também causa 3d8 de dano de Morte a seres vivos na área (Fortitude reduz à metade). Requer 4º círculo.`,
            colateral: `o cheiro de podridão o deixa enjoado por 1 rodada: -2 em testes baseados em Percepção.`
        },
        {
            nome: `Sepultamento Total`,
            circulo: 4,
            detalhes: `Execução: completa • Alcance: médio • Área: esfera de 9m • Duração: sustentada • Resistência: Fortitude parcial`,
            descricao: `Versão em área do Túmulo Vivo — quem falhar na resistência fica enterrado e imóvel (2d8 de dano por rodada); quem passar fica só preso.`,
            consagracao: `+8 PE: enterrados também começam a sufocar (regras de sufocamento). Requer afinidade.`,
            colateral: `controlar tanta terra de uma vez esgota você por completo: fica Exausto até o final da cena. Alvos que resistirem por completo causam o mesmo contra você: 1d8 de dano e preso por 1 rodada.`
        },
    ],
    agua: [
        {
            nome: `Orvalho Curativo`,
            circulo: 1,
            detalhes: `Execução: padrão • Alcance: toque • Alvo: 1 ser • Duração: instantânea`,
            descricao: `Gotas de água luminosa escorrem sobre o alvo, fechando ferimentos. Cura 2d6 PV.`,
            consagracao: `+2 PE: cura 4d6 PV, mas o alvo envelhece 1 mês automaticamente. Requer 2º círculo.`,
            colateral: null
        },
        {
            nome: `Purificador do Ar`,
            circulo: 1,
            detalhes: `Execução: padrão • Alcance: curto • Área: esfera de 6m de raio • Duração: cena`,
            descricao: `Uma névoa de água pura se espalha pela área, neutralizando fumaça, gases tóxicos e odores nocivos, tornando o ar seguro para respirar.`,
            consagracao: `+2 PE: também cura 1d8 de dano por rodada a quem permanecer respirando o ar purificado. Requer 2º círculo.`,
            colateral: null
        },
        {
            nome: `Véu de Neblina`,
            circulo: 2,
            detalhes: `Execução: padrão • Alcance: médio • Área: nuvem de 9m de raio • Duração: cena`,
            descricao: `Uma névoa densa e fria cobre a área. Seres dentro dela têm camuflagem leve contra ataques vindos de fora.`,
            consagracao: `+3 PE: a névoa se torna espessa, concedendo camuflagem total, e reduz o deslocamento de quem não a conhece pela metade. Requer 3º círculo.`,
            colateral: null
        },
        {
            nome: `Sangue Diluído`,
            circulo: 1,
            detalhes: `Execução: reação • Alcance: pessoal ou toque • Alvo: você ou 1 aliado • Duração: instantânea`,
            descricao: `Ao ser atingido, seu corpo dilui parte do dano em água. Reduz o dano de um único ataque em 15 pontos.`,
            consagracao: `+3 PE: reduz o dano em 30 pontos. Requer 3º círculo.`,
            colateral: null
        },
        {
            nome: `Maré Purificadora`,
            circulo: 3,
            detalhes: `Execução: padrão • Alcance: curto • Área: esfera de 6m de raio • Duração: instantânea`,
            descricao: `Uma onda de água pura varre a área. Aliados na área curam 2d8 PV.`,
            consagracao: `+5 PE: cura aumenta para 4d8 PV e remove uma condição negativa à escolha, mas cada aliado curado envelhece 6 meses automaticamente. Requer 4º círculo.`,
            colateral: `canalizar a onda drena você também: -2 em testes até o final do seu próximo turno.`
        },
        {
            nome: `Abismo Líquido`,
            circulo: 4,
            detalhes: `Execução: padrão • Alcance: médio • Área: círculo de 6m de raio • Duração: sustentada • Resistência: Fortitude parcial`,
            descricao: `Um vórtice de água surge no chão, puxando tudo ao redor para dentro. Seres na área devem ser bem-sucedidos em um teste de Fortitude ou ficam agarrados e começam a se afogar; mesmo passando, sofrem 4d10 de dano de água por rodada dentro do vórtice.`,
            consagracao: `+7 PE: o vórtice dobra de área e o dano aumenta para 6d10. Requer afinidade.`,
            colateral: `você sofre 1d10 de dano de água ao conjurar — parte da força do vórtice passa pelo seu próprio corpo. Se o alvo resistir com sucesso, você também sofre 2d10 de dano e fica agarrado por 1 rodada.`
        },
        {
            nome: `Espelho Líquido`,
            circulo: 1,
            detalhes: `Execução: completa • Alcance: pessoal • Efeito: poça de até 1m² • Duração: cena`,
            descricao: `Cria uma superfície que mostra um local já visitado por você (só imagem, sem som).`,
            consagracao: `+3 PE: também transmite som, e não exige mais que você já tenha visitado o local. Requer 2º círculo.`,
            colateral: null
        },
        {
            nome: `Laço de Sangue e Água`,
            circulo: 2,
            detalhes: `Execução: padrão • Alcance: curto • Alvo: 2 seres • Duração: cena • Resistência: Vontade anula (se involuntário)`,
            descricao: `Vincula dois seres: o dano sofrido por um deles é dividido meio a meio com o outro pelo resto da duração.`,
            consagracao: `+4 PE: você pode encerrar o vínculo a qualquer momento; a duração passa a "até ser encerrado". Requer 3º círculo.`,
            colateral: null
        },
        {
            nome: `Disfarce das Marés`,
            circulo: 2,
            detalhes: `Execução: padrão • Alcance: pessoal • Duração: cena • Resistência: Vontade desacredita`,
            descricao: `Seu corpo muda de forma como água corrente. Recebe +5 em testes de Enganação para manter um disfarce genérico.`,
            consagracao: `+3 PE: pode imitar uma pessoa específica já observada; o bônus aumenta para +10. Requer 3º círculo.`,
            colateral: null
        },
        {
            nome: `Dreno Vital`,
            circulo: 2,
            detalhes: `Execução: padrão • Alcance: toque • Alvo: 1 ser • Duração: instantânea • Resistência: Fortitude reduz à metade`,
            descricao: `Causa 4d8 de dano de água ao alvo e você recupera PV igual à metade do dano causado.`,
            consagracao: `+4 PE: o dano aumenta para 6d8. Requer 3º círculo.`,
            colateral: null
        },
        {
            nome: `Maré Congelante`,
            circulo: 3,
            detalhes: `Execução: padrão • Alcance: médio • Área: esfera de 9m • Duração: cena`,
            descricao: `Toda água na área congela instantaneamente; o chão fica escorregadio (terreno difícil) e quem estava nadando fica preso no gelo.`,
            consagracao: `+5 PE: também causa 4d8 de dano a quem ficou preso no momento da conjuração. Requer 4º círculo.`,
            colateral: `o frio também alcança você: seu deslocamento é reduzido em 1,5m até o final da cena.`
        },
        {
            nome: `Dilúvio`,
            circulo: 4,
            detalhes: `Execução: completa • Alcance: longo • Área: esfera de 18m • Duração: sustentada • Resistência: Fortitude parcial`,
            descricao: `Uma onda empurra tudo 9m na direção escolhida e causa 6d10 de dano (metade se passar na resistência); quem falhar começa a se afogar nas rodadas seguintes.`,
            consagracao: `+10 PE: o raio aumenta para 27m e o dano para 9d10. Requer afinidade.`,
            colateral: `mover tamanha quantidade de água drena sua força vital: sofre 10 PV de dano, sem teste de resistência. Se o alvo resistir, você também sofre 3d10 de dano de água (metade do dano base).`
        },
    ],
    fogo: [
        {
            nome: `Fagulha`,
            circulo: 1,
            detalhes: `Execução: padrão • Alcance: toque • Alvo: 1 arma corpo a corpo • Duração: cena`,
            descricao: `Você imbui uma arma com chamas. Ela passa a causar +1d6 de dano de fogo.`,
            consagracao: `+2 PE: o bônus aumenta para +2d6. Requer 2º círculo.`,
            colateral: null
        },
        {
            nome: `Brasas Vivas`,
            circulo: 1,
            detalhes: `Execução: padrão • Alcance: curto • Alvo: 1 ser • Duração: cena • Resistência: Reflexos evita`,
            descricao: `Pequenas brasas se agarram ao corpo do alvo, causando 1d8 de dano de fogo no início de cada um de seus turnos.`,
            consagracao: `+2 PE: o dano aumenta para 2d8. Requer 2º círculo.`,
            colateral: null
        },
        {
            nome: `Explosão Contida`,
            circulo: 2,
            detalhes: `Execução: padrão • Alcance: médio • Área: esfera de 6m de raio • Duração: instantânea • Resistência: Reflexos reduz à metade`,
            descricao: `Uma bola de fogo se forma e explode, causando 5d8 de dano de fogo a todos na área.`,
            consagracao: `+4 PE: o dano aumenta para 8d8. Requer 3º círculo.`,
            colateral: null
        },
        {
            nome: `Lâmina Incandescente`,
            circulo: 2,
            detalhes: `Execução: padrão • Alcance: toque • Alvo: 1 arma corpo a corpo • Duração: cena`,
            descricao: `A arma do alvo se torna incandescente, ganhando +3 em testes de dano e ignorando metade da RD contra dano de fogo.`,
            consagracao: `+3 PE: ignora toda a RD contra dano de fogo. Requer 3º círculo.`,
            colateral: null
        },
        {
            nome: `Fúria das Chamas`,
            circulo: 3,
            detalhes: `Execução: padrão • Alcance: médio • Área: cone de 9m • Duração: instantânea • Resistência: Reflexos reduz à metade`,
            descricao: `Um jato de fogo intenso varre a área em cone, causando 8d10 de dano de fogo e ignorando metade da RD dos alvos.`,
            consagracao: `+6 PE: o dano aumenta para 12d10 e ignora toda a RD. Requer 4º círculo.`,
            colateral: `o calor do próprio jato o atinge de volta: -2 em testes de Reflexos até o final do seu próximo turno.`
        },
        {
            nome: `Cinzas do Fim`,
            circulo: 4,
            detalhes: `Execução: completa • Alcance: longo • Área: esfera de 12m de raio • Duração: instantânea • Resistência: Fortitude reduz à metade`,
            descricao: `Uma coluna de fogo desce sobre a área, incinerando tudo. Causa 15d10 de dano de fogo e destrói objetos inflamáveis automaticamente.`,
            consagracao: `+9 PE: o dano aumenta para 20d10. Alvos reduzidos a 0 PV por este dano são reduzidos a cinzas. Requer afinidade.`,
            colateral: `o calor da coluna de fogo atinge até você: sofre metade do dano do ritual automaticamente, sem direito a teste de resistência.`
        },
        {
            nome: `Marca Incandescente`,
            circulo: 1,
            detalhes: `Execução: padrão • Alcance: toque • Alvo: 1 ser • Duração: cena • Resistência: Reflexos evita`,
            descricao: `Uma marca em brasa causa 1d6 de dano de fogo no início de cada turno do alvo.`,
            consagracao: `+2 PE: o dano aumenta para 2d6. Requer 2º círculo.`,
            colateral: null
        },
        {
            nome: `Fôlego de Brasa`,
            circulo: 1,
            detalhes: `Execução: padrão • Alcance: curto • Área: cone de 4,5m • Duração: instantânea • Resistência: Reflexos reduz à metade`,
            descricao: `Uma rajada de fogo em cone causa 3d8 de dano.`,
            consagracao: `+3 PE: o dano aumenta para 5d8. Requer 2º círculo.`,
            colateral: null
        },
        {
            nome: `Cortina de Fumaça`,
            circulo: 2,
            detalhes: `Execução: padrão • Alcance: curto • Área: nuvem de 6m • Duração: cena`,
            descricao: `Uma fumaça densa concede camuflagem total contra ataques vindos de fora da área.`,
            consagracao: `+3 PE: também causa 1d6 de dano por rodada a quem respirar a fumaça sem proteção. Requer 3º círculo.`,
            colateral: null
        },
        {
            nome: `Fúria Ardente`,
            circulo: 2,
            detalhes: `Execução: padrão • Alcance: pessoal • Duração: cena`,
            descricao: `Você ganha +2 em dano corpo a corpo e resistência a fogo 5, mas deve atacar o inimigo mais próximo em cada um dos seus turnos.`,
            consagracao: `+4 PE: o bônus de dano vira +5 e a resistência vira 10. Requer 3º círculo.`,
            colateral: null
        },
        {
            nome: `Forma de Cinzas`,
            circulo: 3,
            detalhes: `Execução: padrão • Alcance: pessoal • Duração: 3 rodadas`,
            descricao: `Seu corpo se transforma em uma nuvem de cinzas: fica imune a dano físico, mas não pode atacar nem conjurar rituais enquanto durar.`,
            consagracao: `+5 PE: a duração aumenta para 5 rodadas e você pode realizar um ataque por rodada. Requer 4º círculo.`,
            colateral: `voltar a ter um corpo sólido desorienta: -2 em testes de ataque até o final do seu próximo turno.`
        },
        {
            nome: `Sol Interior`,
            circulo: 4,
            detalhes: `Execução: completa • Alcance: pessoal • Área: esfera de 12m centrada em você • Duração: instantânea • Resistência: Reflexos reduz à metade`,
            descricao: `Uma explosão de calor intenso: 10d10 de dano a todos na área, incluindo você (que pode optar por sofrer automaticamente metade do dano, sem precisar de teste).`,
            consagracao: `+9 PE: o dano aumenta para 14d10 e você se torna automaticamente imune. Requer afinidade.`,
            colateral: `sua pele fica queimada e sensível: você fica Vulnerável a dano de fogo até o final da próxima cena.`
        },
    ],
    vento: [
        {
            nome: `Passo do Vento`,
            circulo: 1,
            detalhes: `Execução: livre • Alcance: pessoal • Duração: cena`,
            descricao: `O vento sopra a seu favor. Seu deslocamento aumenta em 3m.`,
            consagracao: `+2 PE: o aumento passa para 6m e você ignora penalidades de terreno difícil. Requer 2º círculo.`,
            colateral: null
        },
        {
            nome: `Lâmina de Vento`,
            circulo: 1,
            detalhes: `Execução: padrão • Alcance: pessoal • Duração: cena`,
            descricao: `Você condensa uma lâmina de ar comprimido nas mãos, funcionando como uma arma corpo a corpo leve que causa 1d8 de dano de corte.`,
            consagracao: `+2 PE: o dano aumenta para 2d8 e a lâmina ganha alcance curto, permitindo ataques à distância. Requer 2º círculo.`,
            colateral: null
        },
        {
            nome: `Sopro Rastreador`,
            circulo: 2,
            detalhes: `Execução: padrão • Alcance: pessoal • Área: esfera de 18m de raio • Duração: cena`,
            descricao: `Você sente cada perturbação no ar ao seu redor. Ganha percepção automática da posição aproximada de qualquer ser que se mova dentro da área, mesmo sem linha de visão ou através de paredes finas.`,
            consagracao: `+4 PE: a área aumenta para 30m de raio e você também percebe a direção e velocidade do movimento de cada ser detectado. Requer 3º círculo.`,
            colateral: null
        },
        {
            nome: `Voo Breve`,
            circulo: 2,
            detalhes: `Execução: padrão • Alcance: pessoal • Duração: 3 rodadas`,
            descricao: `Você é envolto por correntes de ar e ganha deslocamento de voo de 9m durante a duração.`,
            consagracao: `+3 PE: a duração aumenta para cena inteira. Requer 3º círculo.`,
            colateral: null
        },
        {
            nome: `Tempestade Cortante`,
            circulo: 3,
            detalhes: `Execução: padrão • Alcance: médio • Área: esfera de 9m de raio • Duração: instantânea • Resistência: Reflexos reduz à metade`,
            descricao: `Lâminas de vento cortam tudo na área, causando 8d8 de dano de corte.`,
            consagracao: `+5 PE: o dano aumenta para 12d8. Requer 4º círculo.`,
            colateral: `as lâminas também arranham você de raspão: sofre 1d6 de dano de corte.`
        },
        {
            nome: `Vendaval Absoluto`,
            circulo: 4,
            detalhes: `Execução: completa • Alcance: longo • Área: esfera de 18m de raio • Duração: sustentada • Resistência: Fortitude parcial`,
            descricao: `Você invoca uma tempestade violenta. Seres na área sofrem 6d10 de dano de vento por rodada e devem ser bem-sucedidos em um teste de Fortitude ou são derrubados e desarmados.`,
            consagracao: `+8 PE: o raio aumenta para 27m e o dano para 8d10. Requer afinidade.`,
            colateral: `quando a tempestade se dissipa, o esforço cobra o preço: você fica Atordoado por 1 rodada. Alvos que resistirem por completo (sem serem derrubados/desarmados) causam 3d10 de dano de vento contra você (metade do dano base).`
        },
        {
            nome: `Sussurro Levado pelo Vento`,
            circulo: 1,
            detalhes: `Execução: padrão • Alcance: ilimitado (mesma região) • Alvo: 1 pessoa conhecida • Duração: instantânea`,
            descricao: `O vento leva uma mensagem curta até o alvo, não importa a distância entre vocês, desde que estejam na mesma região.`,
            consagracao: `+3 PE: permite uma resposta do alvo, criando uma troca de mensagens curtas por 1 minuto. Requer 2º círculo.`,
            colateral: null
        },
        {
            nome: `Passo Fantasma`,
            circulo: 1,
            detalhes: `Execução: reação • Alcance: pessoal • Duração: instantânea`,
            descricao: `Ao ser atacado, você se dissolve brevemente em vento e reaparece em um espaço adjacente, ganhando +5 na Defesa contra o ataque que o disparou.`,
            consagracao: `+2 PE: o bônus na Defesa aumenta para +10. Requer 2º círculo.`,
            colateral: null
        },
        {
            nome: `Coro Falso`,
            circulo: 2,
            detalhes: `Execução: padrão • Alcance: médio • Área: esfera de 9m • Duração: cena • Resistência: Vontade desacredita`,
            descricao: `Cria sons ilusórios simples (vozes, passos, batidas) vindos de qualquer ponto dentro da área.`,
            consagracao: `+3 PE: os sons podem formar uma cena convincente e coordenada, como uma conversa ou uma perseguição. Requer 3º círculo.`,
            colateral: null
        },
        {
            nome: `Queda Suave`,
            circulo: 2,
            detalhes: `Execução: reação • Alcance: curto • Alvo: 1 ser em queda • Duração: instantânea`,
            descricao: `Anula todo o dano de queda do alvo.`,
            consagracao: `+3 PE: protege até 3 seres em queda ao mesmo tempo. Requer 3º círculo.`,
            colateral: null
        },
        {
            nome: `Fúria da Tempestade`,
            circulo: 3,
            detalhes: `Execução: padrão • Alcance: médio • Área: esfera de 9m • Duração: instantânea • Resistência: Reflexos reduz à metade`,
            descricao: `Raios cortam a área, causando 6d10 de dano; quem falhar na resistência também fica atordoado por 1 rodada.`,
            consagracao: `+6 PE: o dano aumenta para 9d10. Requer 4º círculo.`,
            colateral: `a energia residual causa leve dormência: -2 em testes de Agilidade até o final do seu próximo turno.`
        },
        {
            nome: `Olho do Ciclone`,
            circulo: 4,
            detalhes: `Execução: completa • Alcance: pessoal • Área: esfera de 18m, você no centro • Duração: sustentada • Resistência: Reflexos parcial`,
            descricao: `Você e até 4 aliados ficam em uma zona de calmaria imune aos efeitos; inimigos dentro da tempestade ao redor sofrem 4d10 de dano por rodada e têm o deslocamento reduzido pela metade.`,
            consagracao: `+9 PE: o raio aumenta para 27m e o dano para 6d10. Requer afinidade.`,
            colateral: `você não pode se afastar do centro da tempestade enquanto o efeito durar; se for forçado a sair, o ritual termina imediatamente e você sofre 2d10 de dano.`
        },
    ],
    vazio: [
        {
            nome: `Sussurro do Vazio`,
            circulo: 1,
            detalhes: `Execução: completa • Alcance: pessoal • Duração: instantânea`,
            descricao: `Você escuta ecos do Vazio sobre algo que está prestes a acontecer nesta cena. Recebe uma pista breve do mestre sobre o próximo evento relevante.`,
            consagracao: `+3 PE: a pista se torna mais clara e detalhada. Requer 2º círculo.`,
            colateral: null
        },
        {
            nome: `Toque Entorpecente`,
            circulo: 1,
            detalhes: `Execução: padrão • Alcance: toque • Alvo: 1 ser • Duração: 1 rodada • Resistência: Vontade evita`,
            descricao: `O alvo sente sua mente esvaziar-se por um instante, sofrendo -5 no próximo teste que fizer.`,
            consagracao: `+2 PE: a penalidade aumenta para -10. Requer 2º círculo.`,
            colateral: null
        },
        {
            nome: `Domínio Mental`,
            circulo: 2,
            detalhes: `Execução: padrão • Alcance: médio • Alvo: 1 ser • Duração: 1 rodada • Resistência: Vontade evita`,
            descricao: `Você impõe sua vontade sobre a mente do alvo, forçando-o a obedecer a um comando simples e não hostil (mover-se, largar um item, ficar parado) em seu próximo turno.`,
            consagracao: `+4 PE: a duração aumenta para 3 rodadas e você pode incluir um comando que implique risco moderado ao alvo. Requer 3º círculo.`,
            colateral: null
        },
        {
            nome: `Silêncio Absoluto`,
            circulo: 2,
            detalhes: `Execução: padrão • Alcance: médio • Área: esfera de 6m de raio • Duração: cena`,
            descricao: `Nenhum som sai ou entra da área. Rituais que exigem palavras não podem ser conjurados dentro dela.`,
            consagracao: `+3 PE: também impede qualquer forma de comunicação, incluindo telepática. Requer 3º círculo.`,
            colateral: null
        },
        {
            nome: `Fenda do Nada`,
            circulo: 3,
            detalhes: `Execução: padrão • Alcance: pessoal • Duração: instantânea`,
            descricao: `Você rasga o espaço por um instante e se teleporta até 18m para um local que possa ver.`,
            consagracao: `+5 PE: o alcance aumenta para 60m e não exige linha de visão, apenas conhecimento do local. Requer 4º círculo.`,
            colateral: `atravessar o espaço desorienta os sentidos: fica Vulnerável até o início do seu próximo turno.`
        },
        {
            nome: `Consumir Existência`,
            circulo: 4,
            detalhes: `Execução: padrão • Alcance: toque • Alvo: 1 ser • Duração: instantânea • Resistência: Vontade parcial`,
            descricao: `Você toca o alvo com o Vazio absoluto. Se falhar na resistência, sofre 12d10 de dano direto à sua essência (ignora RD); se passar, sofre metade do dano.`,
            consagracao: `+8 PE: o dano aumenta para 18d10 e, se isso reduzir o alvo a 0 PV, ele desaparece sem deixar vestígios. Requer afinidade.`,
            colateral: `tocar o Vazio corrói sua própria mente: perde 1d4 pontos de Sanidade permanentemente, mesmo se o alvo resistir. Se o alvo passar na resistência, você também sofre 6d10 de dano à sua essência (metade do dano base).`
        },
        {
            nome: `Presságio Sombrio`,
            circulo: 1,
            detalhes: `Execução: livre • Alcance: pessoal • Duração: instantânea`,
            descricao: `Você sabe que algo ruim está prestes a acontecer nesta cena, sem detalhes específicos.`,
            consagracao: `+3 PE: também ganha +5 em testes de Iniciativa e Percepção pelo resto da cena. Requer 2º círculo.`,
            colateral: null
        },
        {
            nome: `Encantar`,
            circulo: 2,
            detalhes: `Execução: padrão • Alcance: curto • Alvo: 1 pessoa • Duração: cena • Resistência: Vontade anula`,
            descricao: `O alvo passa a interpretar suas palavras e ações da forma mais favorável possível. Você ganha +10 em testes de Diplomacia contra ele. Qualquer ação hostil sua encerra o efeito.`,
            consagracao: `+4 PE: o bônus aumenta para +15 e a duração passa a 1 dia. Requer 3º círculo.`,
            colateral: null
        },
        {
            nome: `Terceiro Olho`,
            circulo: 2,
            detalhes: `Execução: padrão • Alcance: pessoal • Duração: cena`,
            descricao: `Seus olhos passam a enxergar auras paranormais em alcance médio — rituais ativos, itens amaldiçoados e criaturas sobrenaturais.`,
            consagracao: `+3 PE: também enxerga através de ilusões e disfarces de origem sobrenatural. Requer 3º círculo.`,
            colateral: null
        },
        {
            nome: `Pesadelo Acordado`,
            circulo: 3,
            detalhes: `Execução: padrão • Alcance: médio • Alvo: 1 ser • Duração: 1 rodada • Resistência: Vontade reduz à metade`,
            descricao: `Uma alucinação aterrorizante toma conta do alvo, causando 6d8 de dano mental e deixando-o apavorado por 1 rodada; se passar na resistência, sofre apenas metade do dano e não fica apavorado.`,
            consagracao: `+5 PE: o dano aumenta para 9d8 e o medo passa a durar 3 rodadas. Requer 4º círculo.`,
            colateral: `compartilhar o pesadelo tem um custo: -2 em testes de Vontade até o final da cena.`
        },
        {
            nome: `Possuir`,
            circulo: 4,
            detalhes: `Execução: padrão • Alcance: curto • Alvo: 1 pessoa • Duração: cena • Resistência: Vontade anula`,
            descricao: `Você projeta sua consciência para o corpo do alvo e passa a controlá-lo, usando os atributos físicos dele. Se o alvo resistir com sucesso, fica imune a este ritual por 1 dia e sabe que a tentativa ocorreu.`,
            consagracao: `+6 PE: a duração aumenta para 1 dia. Requer afinidade.`,
            colateral: `invadir a mente de outra pessoa desgasta a sua: perde 1 ponto de Sanidade permanentemente a cada uso. Se o alvo resistir, o contragolpe da tentativa o deixa Atordoado por 1 rodada (metade do que seria ficar sem controle do próprio corpo).`
        },
        {
            nome: `Apagar`,
            circulo: 4,
            detalhes: `Execução: padrão • Alcance: toque • Alvo: 1 ser • Duração: instantânea • Resistência: Vontade parcial`,
            descricao: `Você toca o alvo tentando apagá-lo da realidade. Causa 10d10 de dano direto à sua essência (ignora RD) se falhar na resistência; metade do dano se passar.`,
            consagracao: `+10 PE: o dano aumenta para 15d10 e, se isso reduzir o alvo a 0 PV, ele desaparece completamente, sem deixar vestígios. Requer afinidade.`,
            colateral: `tentar apagar alguém da existência deixa cicatrizes na sua mente: perde 1d6 pontos de Sanidade permanentemente. Se o alvo resistir, você também sofre 5d10 de dano à sua própria essência (metade do dano base).`
        },
    ],
};
// ============================================================
// PROGRESSO
// ============================================================

function atualizarProgresso() {
    const barra = document.getElementById("barraProgresso");
    const texto = document.getElementById("textoProgresso");

    const totalEtapas = 9;

    if (barra) {
        barra.style.width = ((etapaAtual / totalEtapas) * 100) + "%";
    }

    if (texto) {
        texto.textContent = "ETAPA " + etapaAtual + " DE " + totalEtapas;
    }
}

// ============================================================
// ATRIBUTOS
// ============================================================

function alterarAtributo(nome, valor) {
    if (!(nome in atributos)) return;

    if (valor > 0 && pontosDisponiveis <= 0) {
        alert("Você não possui mais pontos disponíveis.");
        return;
    }

    if (valor < 0 && atributos[nome] <= 1) {
        return;
    }

    atributos[nome] += valor;
    pontosDisponiveis -= valor;

    const campo = document.getElementById(nome);

    if (campo) {
        campo.textContent = atributos[nome];
    }

    const pontos = document.getElementById("pontosDisponiveis");

    if (pontos) {
        pontos.textContent = pontosDisponiveis;
    }

    atualizarEfeitosDeAtributo();
    atualizarCaracteristicas();
    salvarProgresso();
}

// Atualiza os textos "PV +N", "PE +N" e "+N perícia(s)" nos cards de atributo
function atualizarEfeitosDeAtributo() {
    const vigorEfeito = document.getElementById("vigorEfeito");
    if (vigorEfeito) {
        vigorEfeito.textContent = `PV +${atributos.vigor}`;
    }

    const presencaEfeito = document.getElementById("presencaEfeito");
    if (presencaEfeito) {
        presencaEfeito.textContent = `PE +${atributos.presenca}`;
    }

    const intelectoEfeito = document.getElementById("intelectoEfeito");
    if (intelectoEfeito) {
        const plural = atributos.intelecto === 1 ? "perícia treinável" : "perícias treináveis";
        intelectoEfeito.textContent = `+${atributos.intelecto} ${plural}`;
    }
}

// ============================================================
// ORIGENS
// ============================================================

function mostrarOrigens() {
    const container = document.getElementById("listaOrigens");

    if (!container) return;

    container.innerHTML = "";

    origens.forEach(origem => {
        const card = document.createElement("button");

        card.type = "button";
        card.className = "card-origem";

        if (
            origemSelecionada &&
            origemSelecionada.nome === origem.nome
        ) {
            card.classList.add("selecionada");
        }

        card.innerHTML = `
            <h3>${origem.nome}</h3>
            <p>${origem.pericias.join(" • ")}</p>
        `;

        card.onclick = () => selecionarOrigem(origem, card);

        container.appendChild(card);
    });

    if (origemSelecionada) renderDetalhesOrigem();
}

const LIMITE_MUTACOES_COBAIA = 2;

function selecionarOrigem(origem, elemento) {
    if (!origemSelecionada || origemSelecionada.nome !== origem.nome) {
        mutacoesCobaiaSelecionadas = []; // trocar de origem reseta as mutações escolhidas
    }

    origemSelecionada = origem;

    document.querySelectorAll(".card-origem").forEach(card => {
        card.classList.remove("selecionada");
    });

    if (elemento) {
        elemento.classList.add("selecionada");
    }

    renderDetalhesOrigem();
    atualizarCaracteristicas();
    salvarProgresso();
}

function renderDetalhesOrigem() {
    const detalhes = document.getElementById("detalhesOrigem");

    if (!detalhes || !origemSelecionada) return;

    detalhes.innerHTML = `
        <h2>${origemSelecionada.nome}</h2>

        <p class="descricao-origem">
            ${origemSelecionada.descricao}
        </p>

        <h3>HABILIDADE DE ORIGEM</h3>

        <h4>${origemSelecionada.habilidade.nome}</h4>

        <p>${origemSelecionada.habilidade.descricao}</p>

        ${origemSelecionada.nome === "Cobaia" ? renderSeletorMutacaoCobaia() : ""}
    `;
}

// Penalidade permanente de Sanidade máxima por causa das mutações da Cobaia:
// 1 mutação escolhida = perde 2/3 da Sanidade base (arredondando para cima);
// 2 mutações escolhidas = perde metade da Sanidade base (arredondando para cima).
function penalidadeSanidadeCobaia() {
    if (!origemSelecionada || origemSelecionada.nome !== "Cobaia" || !classeSelecionada) return 0;

    const qtd = mutacoesCobaiaSelecionadas.length;
    const sanBase = classeSelecionada.san;

    if (qtd === 1) return Math.ceil(sanBase * (2 / 3));
    if (qtd >= 2) return Math.ceil(sanBase / 2);
    return 0;
}

// Monta a grade de escolha das mutações da origem "Cobaia" — até 2 ao mesmo tempo
function renderSeletorMutacaoCobaia() {
    const qtd = mutacoesCobaiaSelecionadas.length;
    const limiteAtingido = qtd >= LIMITE_MUTACOES_COBAIA;

    const cartoes = mutacoesCobaia.map(m => {
        const selecionada = mutacoesCobaiaSelecionadas.includes(m.nome);
        const desabilitado = !selecionada && limiteAtingido;
        return `
        <button type="button"
                class="card-mutacao ${selecionada ? "selecionada" : ""} ${desabilitado ? "desabilitada" : ""}"
                ${desabilitado ? "disabled" : ""}
                onclick="toggleMutacaoCobaia('${m.nome.replace(/'/g, "\\'")}')">
            <div class="mutacao-cabecalho">
                <h4>${m.nome}</h4>
                ${selecionada ? `<span class="tag-mutacao-selecionada">Escolhida</span>` : ""}
            </div>
            <p class="mutacao-descricao">${m.descricao}</p>
            <div class="mutacao-linha mutacao-linha-beneficio">
                <span class="mutacao-rotulo">Benefício</span>
                <span class="mutacao-texto">${m.beneficio}</span>
            </div>
            <div class="mutacao-linha mutacao-linha-custo">
                <span class="mutacao-rotulo">Custo</span>
                <span class="mutacao-texto">${m.custo}</span>
            </div>
        </button>
        `;
    }).join("");

    const penalidade = penalidadeSanidadeCobaia();
    const textoPenalidade = qtd === 1
        ? `1 mutação escolhida — perde ${penalidade} de Sanidade máxima permanentemente (2/3 da Sanidade base, arredondado para cima).`
        : qtd >= 2
            ? `2 mutações escolhidas — perde ${penalidade} de Sanidade máxima permanentemente (metade da Sanidade base, arredondado para cima).`
            : `Nenhuma mutação escolhida ainda.`;

    return `
        <div class="cabecalho-secao-mutacoes">
            <h3>ESCOLHA AS MUTAÇÕES (até ${LIMITE_MUTACOES_COBAIA})</h3>
            <p class="subtitulo-secao-mutacoes">
                ${qtd}/${LIMITE_MUTACOES_COBAIA} escolhidas${mutacoesCobaiaSelecionadas.length ? ` — <strong>${mutacoesCobaiaSelecionadas.join(", ")}</strong>` : ""}.
            </p>
            <p class="aviso-penalidade-cobaia">${textoPenalidade}</p>
        </div>
        <div class="grade-mutacoes">${cartoes}</div>
    `;
}

function toggleMutacaoCobaia(nomeMutacao) {
    const idx = mutacoesCobaiaSelecionadas.indexOf(nomeMutacao);

    if (idx >= 0) {
        mutacoesCobaiaSelecionadas.splice(idx, 1);
    } else if (mutacoesCobaiaSelecionadas.length < LIMITE_MUTACOES_COBAIA) {
        mutacoesCobaiaSelecionadas.push(nomeMutacao);
    }

    renderDetalhesOrigem();
    atualizarCaracteristicas();
    salvarProgresso();
}

// Retorna {nome, descricao} da habilidade de origem a ser exibida na ficha/PDF —
// para a Cobaia, mescla as mutações escolhidas e a penalidade de Sanidade; para as demais, é a habilidade fixa.
function habilidadeOrigemAtual() {
    if (!origemSelecionada) return { nome: "", descricao: "" };

    if (origemSelecionada.nome === "Cobaia") {
        const mutacoes = mutacoesCobaiaSelecionadas
            .map(nome => mutacoesCobaia.find(m => m.nome === nome))
            .filter(Boolean);

        if (mutacoes.length === 0) {
            return { nome: origemSelecionada.habilidade.nome, descricao: origemSelecionada.habilidade.descricao };
        }

        const penalidade = penalidadeSanidadeCobaia();
        const descricao = mutacoes
            .map(m => `${m.nome}: ${m.descricao} Benefício: ${m.beneficio} Custo: ${m.custo}`)
            .join(" | ") + ` Perda permanente de Sanidade máxima por causa das mutações: ${penalidade}.`;

        return {
            nome: `Corpo Alterado — ${mutacoes.map(m => m.nome).join(" + ")}`,
            descricao
        };
    }

    return origemSelecionada.habilidade;
}

// ============================================================
// CATEGORIAS
// ============================================================

function mostrarCategoria(categoria) {
    if (!classes[categoria]) return;

    categoriaSelecionada = categoria;

    const lista = document.getElementById("listaClasses");

    if (!lista) return;

    lista.innerHTML = "";

    if (classes[categoria].length === 0) {
        lista.innerHTML = `<p class="aviso-vazio">Nenhuma classe cadastrada nesta categoria ainda.</p>`;
        return;
    }

    classes[categoria].forEach(classe => {
        const botao = document.createElement("button");

        botao.type = "button";
        botao.className = "card-classe";

        if (
            classeSelecionada &&
            classeSelecionada.nome === classe.nome
        ) {
            botao.classList.add("selecionada");
        }

        botao.innerHTML = `
            <h3>${classe.nome}</h3>
            <p>${classe.foco}</p>
        `;

        botao.onclick = () => selecionarClasse(classe, botao);

        lista.appendChild(botao);
    });
}

// ============================================================
// SELECIONAR CLASSE
// ============================================================

function selecionarClasse(classe, elemento) {
    classeSelecionada = classe;

    document.querySelectorAll(".card-classe").forEach(card => {
        card.classList.remove("selecionada");
    });

    if (elemento) {
        elemento.classList.add("selecionada");
    }

    mostrarDetalhesClasse(classe);
    atualizarCaracteristicas();
    salvarProgresso();
}

// ============================================================
// DETALHES DA CLASSE
// ============================================================

// Monta o bloco de Habilidade Base + Escolha de Trilha + Tabela de Progressão interativa.
// Reaproveitado tanto na etapa 03 (Classe) quanto na etapa 06 (Características).
function renderProgressaoInterativaHTML(classe) {
    const temProgressao = Array.isArray(classe.progressao) && classe.progressao.length > 0;

    const progressaoHTML = temProgressao
        ? classe.progressao.map(progresso => {
            const tipo = tipoLinhaProgressao(progresso.habilidade);
            return `
                <div class="linha-nex tipo-${tipo}">
                    <div class="linha-nex-badge">${progresso.nex}%</div>
                    <div class="linha-nex-conteudo">${celulaProgressao(progresso)}</div>
                </div>
            `;
        }).join("")
        : "";

    const trilhasDaCategoria = trilhas[categoriaSelecionada] || [];
    const trilhaAtual = trilhaSelecionada[categoriaSelecionada];
    const baseCategoria = habilidadeBaseCategoria[categoriaSelecionada];

    const habilidadeBaseHTML = baseCategoria ? `
        <div class="classe-secao">
            <h3>HABILIDADE BASE DA CATEGORIA</h3>
            <div class="habilidade-item habilidade-base">
                <h4>${baseCategoria.nome}</h4>
                <p>${baseCategoria.desc}</p>
            </div>
        </div>
    ` : "";

    const trilhasHTML = trilhasDaCategoria.length > 0 ? `
        <div class="classe-secao">
            <h3>ESCOLHA SUA TRILHA</h3>
            <p class="aviso-vazio">Vale para toda a categoria (${categoriaSelecionada}), não só para esta classe.</p>
            <div class="lista-trilhas">
                ${trilhasDaCategoria.map(t => `
                    <button type="button"
                            class="card-trilha ${trilhaAtual && trilhaAtual.nome === t.nome ? "selecionada" : ""}"
                            onclick="selecionarTrilha('${categoriaSelecionada}', '${t.nome.replace(/'/g, "\\'")}')">
                        <h4>${t.nome}</h4>
                        <p>${t.flavor}</p>
                    </button>
                `).join("")}
            </div>
            ${trilhaAtual ? `
                <div class="painel-poderes-trilha">
                    <h4>PODERES DE ${trilhaAtual.nome.toUpperCase()}</h4>
                    <div class="grade-poderes-trilha">
                        ${trilhaAtual.poderes.map(p => `
                            <div class="poder-trilha-item">
                                <span class="poder-trilha-nex">NEX ${p.nex}%</span>
                                <strong>${p.titulo}</strong>
                                <p>${p.efeito}</p>
                            </div>
                        `).join("")}
                    </div>
                </div>
            ` : ""}
        </div>
    ` : "";

    return `
        ${habilidadeBaseHTML}

        ${trilhasHTML}

        ${temProgressao ? `
        <div class="classe-secao">
            <h3>PROGRESSÃO NEX — TRILHA E TALENTOS</h3>
            <p class="aviso-vazio">Nos slots de Trilha e Talento, escolha diretamente na lista abaixo.</p>

            <div class="lista-progressao-nex">
                ${progressaoHTML}
            </div>
        </div>
        ` : ""}
    `;
}

function mostrarDetalhesClasse(classe) {
    const detalhes = document.getElementById("detalhesClasse");

    if (!detalhes) return;

    const habilidadesHTML = classe.habilidades
        .map(habilidade => `<div class="habilidade-item"><h4>${habilidade}</h4></div>`)
        .join("");

    detalhes.innerHTML = `
        <div class="classe-detalhe-header">
            <h2>${classe.nome}</h2>
            <p class="foco-classe">${classe.foco}</p>
        </div>

        <p class="descricao-classe">
            ${classe.descricao}
        </p>

        <div class="classe-estatisticas">

            <div class="estatistica">
                <span>PV INICIAL</span>
                <strong>${classe.pv} + VIGOR</strong>
                <small>
                    A cada novo nível de exposição:
                    ${classe.pvNex} PV (+Vig)
                </small>
            </div>

            <div class="estatistica">
                <span>PE INICIAL</span>
                <strong>${classe.pe} + PRESENÇA</strong>
                <small>
                    A cada novo nível de exposição:
                    ${classe.peNex} PE (+Pre)
                </small>
            </div>

            <div class="estatistica">
                <span>SANIDADE INICIAL</span>
                <strong>${classe.san}</strong>
                <small>
                    A cada novo nível de exposição:
                    ${classe.sanNex} SAN
                </small>
            </div>

        </div>

        <div class="classe-secao">
            <h3>PROFICIÊNCIAS</h3>
            <p>${classe.proficiencias}</p>
        </div>

        <div class="classe-secao">
            <h3>HABILIDADES DA CLASSE</h3>
            <div class="habilidades-lista">
                ${habilidadesHTML}
            </div>
        </div>

        ${renderProgressaoInterativaHTML(classe)}
    `;
}

// Decide o que mostrar em cada linha da tabela de progressão:
// texto fixo, poder de trilha resolvido, ou seletor de talento
// Classifica o tipo de linha da progressão pra estilização (fixo / trilha / talento)
function tipoLinhaProgressao(habilidade) {
    if (habilidade === "Habilidade de Trilha") return "trilha";
    if (habilidade.startsWith("Poder de ")) return "talento";
    return "fixo";
}

// Verdadeiro quando o personagem já alcançou este nível de NEX
function nexAtingido(nex) {
    return nexPersonagem >= nex;
}

function celulaProgressao(progresso) {
    const conteudo = conteudoProgressao(progresso);

    if (!nexAtingido(progresso.nex)) {
        return `
            <div class="conteudo-bloqueado" aria-disabled="true">
                ${conteudo}
            </div>
            <em class="linha-nex-bloqueada-aviso">Bloqueado até NEX ${progresso.nex}%</em>
        `;
    }

    return conteudo;
}

// Monta o conteúdo normal de uma linha de progressão, independente de o NEX já ter sido alcançado.
// Quando o nível ainda não foi alcançado, celulaProgressao() envolve este mesmo conteúdo
// em um contêiner "apenas inacessível" (visível, porém desabilitado), em vez de escondê-lo.
function conteudoProgressao(progresso) {
    let base;

    if (progresso.habilidade === "Habilidade de Trilha") {
        const trilha = trilhaSelecionada[categoriaSelecionada];
        const poder = poderTrilhaParaNex(categoriaSelecionada, progresso.nex);

        if (!trilha) {
            base = `<em class="linha-nex-vazia">Escolha uma trilha abaixo</em>`;
        } else if (!poder) {
            base = `<em class="linha-nex-vazia">${trilha.nome}: esta classe não recebe poder de trilha neste NEX</em>`;
        } else {
            base = `
                <div class="poder-resolvido">
                    <strong>${poder.titulo}</strong>
                    <span class="tag-trilha">${trilha.nome}</span>
                </div>
                <p class="poder-resolvido-efeito">${poder.efeito}</p>
            `;
        }
    } else if (progresso.habilidade.startsWith("Poder de ")) {
        base = renderSelectTalento(categoriaSelecionada, progresso.nex);
    } else {
        base = `<span class="linha-nex-fixa">${progresso.habilidade}</span>`;
    }

    // Em TODO nível de NEX (5, 10, 15...), Combatente/Especialista escolhem entre Sanidade ou Ritual.
    return base + renderEscolhaSanidadeRitual(categoriaSelecionada, progresso.nex);
}

// Escolha "Sanidade ou Ritual" — aparece em TODO nível de NEX para Combatente/Especialista.
// O círculo do ritual disponível cresce com o NEX atual do personagem, igual ao Ocultista.
function renderEscolhaSanidadeRitual(categoria, nex) {
    if (categoria === "ocultista" || !classeSelecionada) return "";

    const optouRitual = !!(escolhasNexRitual[categoria] && escolhasNexRitual[categoria][nex]);
    const circuloMaximo = circuloMaximoPorNex(nexPersonagem);
    const ganhaAutomatico = nex % 15 === 0;

    return `
        <div class="escolha-nex-sanidade-ritual">
            <label class="rotulo-escolha-nex">Sanidade ou Ritual (NEX ${nex}%)</label>
            <div class="escolha-nex-botoes">
                <button type="button"
                        class="botao-escolha-nex ${!optouRitual ? "ativa" : ""}"
                        onclick="escolherSanidadeOuRitualNex('${categoria}', ${nex}, false)">
                    +${classeSelecionada.sanNex} Sanidade
                </button>
                <button type="button"
                        class="botao-escolha-nex ${optouRitual ? "ativa" : ""}"
                        onclick="escolherSanidadeOuRitualNex('${categoria}', ${nex}, true)">
                    1 Ritual (até ${circuloMaximo}º círculo)
                </button>
            </div>
            ${ganhaAutomatico ? `<p class="talento-descricao">Além da escolha acima, este NEX concede 1 ritual automático de graça.</p>` : ""}
            ${optouRitual ? `<p class="talento-descricao">Vaga liberada — escolha o ritual na Etapa de Rituais.</p>` : ""}
        </div>
    `;
}

// Retorna o poder da trilha escolhida correspondente a um NEX específico (10/40/65/99)
function poderTrilhaParaNex(categoria, nex) {
    const trilha = trilhaSelecionada[categoria];
    if (!trilha) return null;
    return trilha.poderes.find(p => p.nex === nex) || null;
}

// Monta o <select> de talento para um slot "Poder de X" em um NEX específico
function renderSelectTalento(categoria, nex) {
    const lista = talentos[categoria] || [];
    const atual = (talentosEscolhidos[categoria] && talentosEscolhidos[categoria][nex]) || "";
    const talentoObj = lista.find(t => t.nome === atual);
    const idDropdown = `dropdown-talento-${categoria}-${nex}`;

    const opcoes = lista.map(t => `
        <button type="button"
                class="dropdown-talento-opcao ${t.nome === atual ? "ativa" : ""}"
                onclick="escolherTalento('${categoria}', ${nex}, '${t.nome.replace(/'/g, "\\'")}')">
            ${t.nome}${t.repetivel ? ` <span class="tag-repetivel">repetível</span>` : ""}
        </button>
    `).join("");

    return `
        <div class="dropdown-talento" id="${idDropdown}">
            <button type="button"
                    class="dropdown-talento-toggle"
                    onclick="toggleDropdownTalento(event, '${idDropdown}')">
                <span>${atual || "— escolher talento —"}</span>
                <span class="dropdown-talento-seta">▾</span>
            </button>
            <div class="dropdown-talento-lista" hidden>
                <button type="button"
                        class="dropdown-talento-opcao ${atual === "" ? "ativa" : ""}"
                        onclick="escolherTalento('${categoria}', ${nex}, '')">
                    — escolher talento —
                </button>
                ${opcoes}
            </div>
        </div>
        ${talentoObj ? `<p class="talento-descricao">${talentoObj.desc}</p>` : ""}
    `;
}

// Abre/fecha o dropdown customizado de talento, fechando qualquer outro que esteja aberto
function toggleDropdownTalento(evento, idDropdown) {
    evento.stopPropagation();

    const dropdown = document.getElementById(idDropdown);
    if (!dropdown) return;

    const lista = dropdown.querySelector(".dropdown-talento-lista");
    const jaAberto = !lista.hidden;

    document.querySelectorAll(".dropdown-talento-lista").forEach(el => { el.hidden = true; });
    document.querySelectorAll(".dropdown-talento.aberto").forEach(el => el.classList.remove("aberto"));

    if (!jaAberto) {
        lista.hidden = false;
        dropdown.classList.add("aberto");
    }
}

// Fecha qualquer dropdown de talento aberto ao clicar fora dele
document.addEventListener("click", () => {
    document.querySelectorAll(".dropdown-talento-lista").forEach(el => { el.hidden = true; });
    document.querySelectorAll(".dropdown-talento.aberto").forEach(el => el.classList.remove("aberto"));
});

// Salva a escolha de talento para um slot de NEX específico dentro da categoria
function escolherTalento(categoria, nex, nomeTalento) {
    if (!nexAtingido(nex)) return; // trava de segurança — o NEX ainda não foi alcançado

    if (!talentosEscolhidos[categoria]) talentosEscolhidos[categoria] = {};
    talentosEscolhidos[categoria][nex] = nomeTalento;

    atualizarPaineisDeProgressao();
    salvarProgresso();
}

// Salva a escolha de Sanidade OU Ritual para um nível de NEX específico (Combatente/Especialista)
// quiserRitual = false → +Sanidade neste NEX; true → libera 1 vaga de ritual (escolhida na Etapa de Rituais)
function escolherSanidadeOuRitualNex(categoria, nex, quiserRitual) {
    if (!nexAtingido(nex)) return; // trava de segurança — o NEX ainda não foi alcançado

    if (!escolhasNexRitual[categoria]) escolhasNexRitual[categoria] = {};

    if (quiserRitual) {
        escolhasNexRitual[categoria][nex] = true;
    } else {
        delete escolhasNexRitual[categoria][nex];
    }

    atualizarPaineisDeProgressao();
    atualizarPainelRituais();
    salvarProgresso();
}

// Define a trilha escolhida para toda a categoria (Combatente/Especialista/Ocultista)
function selecionarTrilha(categoria, nomeTrilha) {
    const lista = trilhas[categoria] || [];
    trilhaSelecionada[categoria] = lista.find(t => t.nome === nomeTrilha) || null;

    atualizarPaineisDeProgressao();
    salvarProgresso();
}

// Atualiza todos os painéis que exibem a tabela de progressão (Classe e Características),
// já que a escolha de trilha/talento é a mesma nos dois lugares
function atualizarPaineisDeProgressao() {
    if (!classeSelecionada) return;

    if (document.getElementById("detalhesClasse")) {
        mostrarDetalhesClasse(classeSelecionada);
    }

    if (document.getElementById("painelCaracteristicas")) {
        atualizarCaracteristicas();
    }
}

// ============================================================
// RITUAIS
// ============================================================

const nomeElementoRitual = {
    terra: "Terra",
    agua: "Água",
    fogo: "Fogo",
    vento: "Vento",
    vazio: "Vazio"
};

function atualizarPainelRituais() {
    const botoes = document.getElementById("elementosRituais");

    if (botoes) {
        botoes.innerHTML = Object.keys(rituais).map(el => `
            <button type="button"
                    class="botao-elemento elemento-${el} ${elementoRitualAtivo === el ? "ativo" : ""}"
                    onclick="selecionarElementoRitual('${el}')">
                ${nomeElementoRitual[el]}
            </button>
        `).join("");
    }

    renderizarResumoRituais();
    renderizarListaRituaisElemento();
}

function selecionarElementoRitual(elemento) {
    elementoRitualAtivo = elemento;
    atualizarPainelRituais();
}

// Rituais conhecidos considerando a categoria: Ocultista escolhe livremente
// (dentro do limite); Combatente/Especialista só conhecem o que vier da escolha de NEX
function todosRituaisConhecidos() {
    return rituaisConhecidos;
}

function ritualConhecido(elemento, nome) {
    return rituaisConhecidos.some(r => r.elemento === elemento && r.nome === nome);
}

function toggleRitualConhecido(elemento, nome) {
    const idx = rituaisConhecidos.findIndex(r => r.elemento === elemento && r.nome === nome);

    if (idx >= 0) {
        rituaisConhecidos.splice(idx, 1);
    } else {
        if (rituaisConhecidos.length >= limiteRituais()) {
            return;
        }
        const ritual = (rituais[elemento] || []).find(r => r.nome === nome);
        if (!ritual || ritual.circulo > circuloMaximoRitualAtual()) {
            return;
        }
        rituaisConhecidos.push({ ...ritual, elemento });
    }

    atualizarPainelRituais();
    salvarProgresso();
}

function renderizarListaRituaisElemento() {
    const cont = document.getElementById("listaRituaisElemento");

    if (!cont) return;

    if (!elementoRitualAtivo) {
        cont.innerHTML = `<p class="aviso-vazio">Selecione um elemento acima para ver os rituais disponíveis.</p>`;
        return;
    }

    const lista = [...(rituais[elementoRitualAtivo] || [])].sort((a, b) => a.circulo - b.circulo);
    const circuloMaximo = circuloMaximoRitualAtual();
    const limite = limiteRituais();

    const grupos = [1, 2, 3, 4].map(circulo => ({
        circulo,
        itens: lista.filter(r => r.circulo === circulo)
    })).filter(grupo => grupo.itens.length > 0);

    cont.innerHTML = grupos.map(grupo => `
        <div class="grupo-rituais">
            <div class="grupo-rituais-header">
                <span class="grupo-rituais-linha"></span>
                <h3>${grupo.circulo}º CÍRCULO</h3>
                <span class="grupo-rituais-linha"></span>
            </div>

            <div class="grade-rituais">
                ${grupo.itens.map(r => {
                    const conhecido = ritualConhecido(elementoRitualAtivo, r.nome);
                    const acimaDoCirculo = r.circulo > circuloMaximo;
                    const semVaga = rituaisConhecidos.length >= limite;
                    const bloqueado = !conhecido && (semVaga || acimaDoCirculo);

                    return `
                    <div class="card-ritual elemento-${elementoRitualAtivo} ${conhecido ? "conhecido" : ""} ${bloqueado ? "bloqueado-limite" : ""}">
                        <div class="card-ritual-topo">
                            <h4>${r.nome}</h4>
                            <label class="checkbox-ritual">
                                <input type="checkbox"
                                       ${conhecido ? "checked" : ""}
                                       ${bloqueado ? "disabled" : ""}
                                       onchange="toggleRitualConhecido('${elementoRitualAtivo}', '${r.nome.replace(/'/g, "\\'")}')">
                                <span class="checkbox-ritual-caixa"></span>
                                Conhece
                            </label>
                        </div>

                        ${acimaDoCirculo && !conhecido ? `<p class="aviso-vazio">Requer NEX mais alto para lançar círculos maiores.</p>` : ""}
                        ${!acimaDoCirculo && semVaga && !conhecido ? `<p class="aviso-vazio">Sem vaga de ritual disponível — libere mais uma (Ocultista sobe de NEX; Combatente/Especialista troca Sanidade por Ritual num Poder de Classe).</p>` : ""}

                        <p class="ritual-tag">${r.detalhes}</p>
                        <p class="ritual-descricao">${r.descricao}</p>

                        ${r.consagracao ? `
                            <div class="ritual-caixa ritual-caixa-consagracao">
                                <span class="ritual-caixa-rotulo">Consagração</span>
                                <p>${r.consagracao}</p>
                            </div>
                        ` : ""}

                        ${r.colateral ? `
                            <div class="ritual-caixa ritual-caixa-colateral">
                                <span class="ritual-caixa-rotulo">Efeito Colateral</span>
                                <p>${r.colateral}</p>
                            </div>
                        ` : ""}
                    </div>
                `;
                }).join("")}
            </div>
        </div>
    `).join("");
}

function renderizarResumoRituais() {
    const cont = document.getElementById("resumoRituaisConhecidos");

    if (!cont) return;

    if (!categoriaSelecionada) {
        cont.innerHTML = `<p class="aviso-vazio">Escolha uma classe antes de ver os rituais.</p>`;
        return;
    }

    const conhecidos = rituaisConhecidos;
    const limite = limiteRituais();
    const dt = dtResistenciaRitual();

    const explicacao = categoriaSelecionada === "ocultista"
        ? `Vagas ganhas automaticamente com o NEX (3 iniciais + 1 por nível).`
        : `Vagas ganhas trocando "Sanidade" por "1 Ritual" em qualquer NEX, na tela de Classe, mais 1 ritual automático a cada 15% de NEX. O círculo disponível sobe com o NEX.`;

    const caixaDT = `
        <div class="caixa-dt-ritual">
            <span class="rotulo-dt-ritual">DT de resistência dos seus rituais</span>
            <strong class="valor-dt-ritual">${dt}</strong>
            <span class="formula-dt-ritual">(10 + Presença ${atributos.presenca} + ${incrementosNex()} por NEX)</span>
        </div>
    `;

    if (conhecidos.length === 0) {
        cont.innerHTML = `
            ${caixaDT}
            <p class="aviso-vazio">Nenhum ritual conhecido ainda (limite atual: ${limite}). ${explicacao}</p>
        `;
        return;
    }

    cont.innerHTML = `
        ${caixaDT}
        <h3>RITUAIS CONHECIDOS (${conhecidos.length} / ${limite})</h3>
        <div class="chips-rituais">
            ${conhecidos.map(r => `<span class="chip-ritual">${r.nome} <small>(${r.circulo}º círculo)</small></span>`).join("")}
        </div>
        <p class="aviso-vazio">${explicacao}</p>
        ${conhecidos.length >= limite ? `<p class="aviso-vazio">Limite de rituais atingido — desmarque um ritual para trocar.</p>` : ""}
    `;
}

// Usado na Ficha Final e no Modo de Jogo
function gerarRituaisConhecidosHTML() {
    const conhecidos = todosRituaisConhecidos();
    const caixaDT = `<p class="ficha-dt-ritual"><strong>DT de resistência dos rituais:</strong> ${dtResistenciaRitual()} (10 + Presença ${atributos.presenca} + ${incrementosNex()} por NEX)</p>`;

    if (conhecidos.length === 0) {
        return caixaDT + "<p>Nenhum ritual conhecido.</p>";
    }

    return caixaDT + conhecidos.map(r => `
        <div class="ficha-ritual-item">
            <h4>${r.nome} <span class="circulo-ritual">Círculo ${r.circulo}</span></h4>
            <p class="ritual-tag">${r.detalhes}</p>
            <p>${r.descricao}</p>
            ${r.consagracao ? `<p class="ritual-consagracao"><strong>Consagração:</strong> ${r.consagracao}</p>` : ""}
            ${r.colateral ? `<p class="ritual-colateral"><strong>Efeito Colateral:</strong> ${r.colateral}</p>` : ""}
        </div>
    `).join("");
}

// ============================================================
// CARACTERÍSTICAS
// ============================================================

function atualizarCaracteristicas() {
    const painel = document.getElementById("painelCaracteristicas");

    if (!painel) return;

    if (!classeSelecionada) {
        painel.innerHTML = `
            <div class="aviso-caracteristicas">
                <h3>NENHUMA CLASSE SELECIONADA</h3>
                <p>
                    Escolha uma classe para visualizar
                    as características do personagem.
                </p>
            </div>
        `;

        return;
    }

    const incrementos = incrementosNex();
    const pvSugerido = classeSelecionada.pv + atributos.vigor + incrementos * (classeSelecionada.pvNex + atributos.vigor);
    const peSugerido = classeSelecionada.pe + atributos.presenca + incrementos * (classeSelecionada.peNex + atributos.presenca);
    const sanSugerido = classeSelecionada.san + sanidadeGanhaPorNex() - penalidadeSanidadeCobaia();
    const protecaoSugerida = protecaoEquipadaTexto();
    const defesaSugerida = sugestaoDefesa();
    const esquivaSugerida = sugestaoEsquiva();
    const bloqueioSugerido = sugestaoBloqueio();
    const contraAtaqueSugerido = sugestaoContraAtaque();
    const dtSugerida = dtResistenciaRitual();

    const valorPV = statsManuais.pv !== null ? statsManuais.pv : pvSugerido;
    const valorPE = statsManuais.pe !== null ? statsManuais.pe : peSugerido;
    const valorProtecao = statsManuais.protecao !== null ? statsManuais.protecao : protecaoSugerida;
    const valorSAN = statsManuais.san !== null ? statsManuais.san : sanSugerido;
    const valorDefesa = statsManuais.defesa !== null ? statsManuais.defesa : defesaSugerida;
    const valorEsquiva = statsManuais.esquiva !== null ? statsManuais.esquiva : esquivaSugerida;
    const valorBloqueio = statsManuais.bloqueio !== null ? statsManuais.bloqueio : bloqueioSugerido;
    const valorContraAtaque = statsManuais.contraAtaque !== null ? statsManuais.contraAtaque : contraAtaqueSugerido;
    const valorDT = statsManuais.dt !== null ? statsManuais.dt : dtSugerida;

    painel.innerHTML = `
        <div class="titulo-caracteristicas">
            <h2>
                CARACTERÍSTICAS DE
                ${classeSelecionada.nome.toUpperCase()}
            </h2>
            <p class="aviso-vazio">
                Valores sugeridos automaticamente — apague e digite o que quiser em qualquer campo.
            </p>
        </div>

        <div class="resumo-caracteristicas">

            <div class="caracteristica">
                <span>PONTOS DE VIDA</span>
                <input type="text" class="campo-stat" value="${valorPV}"
                       oninput="statManualAlterado('pv', this.value)">
                <small>Sugestão: ${pvSugerido} (base ${classeSelecionada.pv} + Vigor ${atributos.vigor}${incrementos > 0 ? ` + ${incrementos}x NEX (${classeSelecionada.pvNex}+Vig cada)` : ""})</small>
            </div>

            <div class="caracteristica">
                <span>PONTOS DE ESFORÇO</span>
                <input type="text" class="campo-stat" value="${valorPE}"
                       oninput="statManualAlterado('pe', this.value)">
                <small>Sugestão: ${peSugerido} (base ${classeSelecionada.pe} + Presença ${atributos.presenca}${incrementos > 0 ? ` + ${incrementos}x NEX (${classeSelecionada.peNex}+Pre cada)` : ""})</small>
            </div>

            <div class="caracteristica">
                <span>PROTEÇÃO</span>
                <input type="text" class="campo-stat" value="${valorProtecao}"
                       oninput="statManualAlterado('protecao', this.value)">
                <small>Sugestão: ${protecaoSugerida} (${protecaoSelecionada ? protecaoSelecionada.nome : "nenhuma proteção equipada"}${escudoEquipado ? " + Escudo" : ""})</small>
            </div>

            <div class="caracteristica">
                <span>SANIDADE</span>
                <input type="text" class="campo-stat" value="${valorSAN}"
                       oninput="statManualAlterado('san', this.value)">
                <small>Sugestão: ${sanSugerido} (sanidade inicial + progressão de NEX${categoriaSelecionada !== "ocultista" && contarEscolhasRitualNex(categoriaSelecionada) > 0 ? `, descontando ${contarEscolhasRitualNex(categoriaSelecionada)}x NEX trocado por ritual` : ""}${penalidadeSanidadeCobaia() > 0 ? `, -${penalidadeSanidadeCobaia()} pelas mutações da Cobaia` : ""})</small>
            </div>

            <div class="caracteristica">
                <span>DEFESA</span>
                <input type="text" class="campo-stat" value="${valorDefesa}"
                       oninput="statManualAlterado('defesa', this.value)">
                <small>Sugestão: ${defesaSugerida} (10 + Agilidade ${atributos.agilidade})</small>
            </div>

            <div class="caracteristica">
                <span>ESQUIVA</span>
                <input type="text" class="campo-stat" value="${valorEsquiva}"
                       oninput="statManualAlterado('esquiva', this.value)">
                <small>Sugestão: ${esquivaSugerida} (Defesa ${defesaSugerida} ${estaTreinado("Reflexos") ? "+ Reflexos 5" : "— treine Reflexos para bonificar"})</small>
            </div>

            <div class="caracteristica">
                <span>BLOQUEIO (RD)</span>
                <input type="text" class="campo-stat" value="${valorBloqueio}"
                       oninput="statManualAlterado('bloqueio', this.value)">
                <small>Sugestão: ${bloqueioSugerido} ${estaTreinado("Fortitude") ? "(bônus de Fortitude)" : "(precisa de Fortitude treinada para bloquear)"}</small>
            </div>

            <div class="caracteristica">
                <span>CONTRA-ATAQUE</span>
                <input type="text" class="campo-stat" value="${valorContraAtaque}"
                       oninput="statManualAlterado('contraAtaque', this.value)">
                <small>Sugestão: ${contraAtaqueSugerido} (= Defesa) ${estaTreinado("Luta") ? "— disponível (Luta treinada)" : "— precisa de Luta treinada"}</small>
            </div>

            <div class="caracteristica">
                <span>DT</span>
                <input type="text" class="campo-stat" value="${valorDT}"
                       oninput="statManualAlterado('dt', this.value)">
                <small>Sugestão: ${dtSugerida} (10 + Presença ${atributos.presenca} + ${incrementos}x NEX)</small>
            </div>

        </div>

        <div class="detalhe-caracteristicas">
            <h3>CLASSE</h3>
            <p><strong>${classeSelecionada.nome}</strong></p>

            <h3>DESCRIÇÃO</h3>
            <p>${classeSelecionada.descricao}</p>

            <h3>PROFICIÊNCIAS</h3>
            <p>${classeSelecionada.proficiencias}</p>

            <h3>PERÍCIAS TREINADAS</h3>
            <p>${textoPericias()}</p>
        </div>

        ${origemSelecionada ? `
            <div class="detalhe-caracteristicas">

                <h3>ORIGEM</h3>
                <p><strong>${origemSelecionada.nome}</strong></p>

                <p>${origemSelecionada.descricao}</p>

                <h3>HABILIDADE DE ORIGEM</h3>

                <p>
                    <strong>
                        ${habilidadeOrigemAtual().nome}
                    </strong>
                </p>

                <p>
                    ${habilidadeOrigemAtual().descricao}
                </p>

            </div>
        ` : ""}

        <div class="detalhe-caracteristicas">
            <h3>ATRIBUTOS</h3>

            <div class="atributos-resumo">

                <div>
                    <span>AGILIDADE</span>
                    <strong>${atributos.agilidade}</strong>
                </div>

                <div>
                    <span>FORÇA</span>
                    <strong>${atributos.forca}</strong>
                </div>

                <div>
                    <span>INTELECTO</span>
                    <strong>${atributos.intelecto}</strong>
                </div>

                <div>
                    <span>PRESENÇA</span>
                    <strong>${atributos.presenca}</strong>
                </div>

                <div>
                    <span>VIGOR</span>
                    <strong>${atributos.vigor}</strong>
                </div>

            </div>
        </div>

        <div class="detalhe-caracteristicas">
            ${renderProgressaoInterativaHTML(classeSelecionada)}
        </div>
    `;
}

// ============================================================
// RESPOSTA SOBRE ELE
// ============================================================

function responderEle(resposta) {
    const campo = document.getElementById("respostaEle");

    if (!campo) return;

    let mensagem = "";

    if (resposta === "SIM") {
        mensagem = "VOCÊ ACREDITA. TALVEZ ELE TAMBÉM ACREDITE EM VOCÊ.";
    } else if (resposta === "NÃO") {
        mensagem = "VOCÊ NÃO ACREDITA. MAS ISSO NÃO SIGNIFICA QUE ELE NÃO EXISTA.";
    } else {
        mensagem = "VOCÊ NÃO SABE. TALVEZ NINGUÉM DEVERIA SABER.";
    }

    campo.textContent = mensagem;
    campo.dataset.resposta = resposta;
}

// ============================================================
// FOTO DO PERSONAGEM
// ============================================================

function atualizarFotoPersonagem() {
    const imagens = [
        document.getElementById("fotoPreview"),
        document.getElementById("fichaFoto"),
        document.getElementById("jogoFoto")
    ];

    imagens.forEach(imagem => {
        if (!imagem) return;

        imagem.src = fotoPersonagem || "";
        imagem.hidden = !fotoPersonagem;
    });

    const placeholder = document.getElementById("fotoPreviewPlaceholder");
    if (placeholder) {
        placeholder.hidden = !!fotoPersonagem;
    }
}

function processarFotoPersonagem(evento) {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;

    if (!arquivo.type.startsWith("image/")) {
        alert("Escolha um arquivo de imagem válido.");
        evento.target.value = "";
        return;
    }

    const leitor = new FileReader();

    leitor.onload = eventoLeitura => {
        const imagem = new Image();

        imagem.onload = () => {
            const tamanhoMaximo = 900;
            const escala = Math.min(
                1,
                tamanhoMaximo / imagem.width,
                tamanhoMaximo / imagem.height
            );

            const canvas = document.createElement("canvas");
            canvas.width = Math.round(imagem.width * escala);
            canvas.height = Math.round(imagem.height * escala);

            const contexto = canvas.getContext("2d");
            contexto.drawImage(
                imagem,
                0,
                0,
                canvas.width,
                canvas.height
            );

            fotoPersonagem = canvas.toDataURL("image/jpeg", 0.84);
            atualizarFotoPersonagem();
            salvarProgresso();
        };

        imagem.src = eventoLeitura.target.result;
    };

    leitor.readAsDataURL(arquivo);
}

function removerFotoPersonagem() {
    fotoPersonagem = "";

    const input = document.getElementById("fotoPersonagemInput");
    if (input) input.value = "";

    atualizarFotoPersonagem();
    salvarProgresso();
}

function alterarNivelNoModo(valor) {
    const campo = document.getElementById("nivelPersonagem");
    if (!campo) return;

    campo.value = valor;
    alterarNivelPersonagem();
    preencherModoJogo(obterPersonagem());
}

function alterarNexNoModo(valor) {
    const campo = document.getElementById("nexPersonagem");
    if (!campo) return;

    campo.value = valor;
    alterarNex();
    preencherModoJogo(obterPersonagem());
}

// ============================================================
// OBTER PERSONAGEM
// ============================================================

function obterPersonagem() {
    const respostaEle = document.getElementById("respostaEle");

    return {
        personagem: document.getElementById("personagem")?.value || "Sem nome",
        jogador: document.getElementById("jogador")?.value || "Não informado",
        foto: fotoPersonagem,
        nivel: nivelPersonagem,
        aparencia: document.getElementById("aparencia")?.value || "Não informado",
        personalidade: document.getElementById("personalidade")?.value || "Não informado",
        historico: document.getElementById("historico")?.value || "Não informado",
        objetivo: document.getElementById("objetivo")?.value || "Não informado",

        categoria: categoriaSelecionada || "Não selecionada",

        classe: classeSelecionada
            ? classeSelecionada.nome
            : "Não selecionada",

        origem: origemSelecionada
            ? origemSelecionada.nome
            : "Não selecionada",

        atributos: {
            ...atributos
        },

        pv: statsManuais.pv !== null
            ? statsManuais.pv
            : (classeSelecionada ? classeSelecionada.pv + atributos.vigor + incrementosNex() * (classeSelecionada.pvNex + atributos.vigor) : 0),

        pe: statsManuais.pe !== null
            ? statsManuais.pe
            : (classeSelecionada ? classeSelecionada.pe + atributos.presenca + incrementosNex() * (classeSelecionada.peNex + atributos.presenca) : 0),

        protecao: statsManuais.protecao !== null
            ? statsManuais.protecao
            : protecaoEquipadaTexto(),

        san: statsManuais.san !== null
            ? statsManuais.san
            : (classeSelecionada ? classeSelecionada.san + sanidadeGanhaPorNex() - penalidadeSanidadeCobaia() : 0),

        nex: nexPersonagem,

        defesa: statsManuais.defesa !== null
            ? statsManuais.defesa
            : sugestaoDefesa(),

        esquiva: statsManuais.esquiva !== null
            ? statsManuais.esquiva
            : sugestaoEsquiva(),

        bloqueio: statsManuais.bloqueio !== null
            ? statsManuais.bloqueio
            : sugestaoBloqueio(),

        contraAtaque: statsManuais.contraAtaque !== null
            ? statsManuais.contraAtaque
            : sugestaoContraAtaque(),

        dt: statsManuais.dt !== null
            ? statsManuais.dt
            : dtResistenciaRitual(),

        pericias: textoPericias(),

        arma: armasSelecionadas.length > 0
            ? armasSelecionadas
                .map(a => `${a.nome} — Categoria ${a.nivel} · ${a.categoria} · ${a.proficiencia} · dano ${calcularDano(a)} · teste de ${a.pericia} · alcance ${a.alcance} · ${a.maos} · peso ${a.peso} · tamanho ${a.tamanho} · ${a.espaco} slot${a.espaco === 1 ? "" : "s"} — ${a.especial}`)
                .join(" | ")
            : "Nenhuma arma escolhida.",

        equipamentosEspeciais: { ...equipamentosEspeciais },
        espacoOcupadoCavalo,
        consumiveisSelecionados: JSON.parse(JSON.stringify(consumiveisSelecionados)),

        respostaParanormal:
            respostaEle?.dataset.resposta || "Não respondido",

        dataCriacao: new Date().toLocaleString("pt-BR")
    };
}

// ============================================================
// FINALIZAR FICHA
// ============================================================

function finalizarFicha() {
    if (!classeSelecionada) {
        alert("Você precisa escolher uma classe antes de finalizar.");
        return;
    }

    if (!origemSelecionada) {
        alert("Você precisa escolher uma origem antes de finalizar.");
        return;
    }

    const personagem = obterPersonagem();

    mostrarTela("fichaFinal");

    preencherFicha(personagem);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// ============================================================
// PREENCHER FICHA
// ============================================================

// Extrai uma estimativa de Proteção a partir do texto de proficiências da classe
// Sugestão de referência para Defesa (totalmente editável)
function sugestaoDefesa() {
    const bonusProtecao = protecaoSelecionada ? protecaoSelecionada.bonusDefesa : 0;
    const bonusEscudo = escudoEquipado ? escudo.bonusDefesa : 0;

    return 10 + atributos.agilidade + bonusProtecao + bonusEscudo;
}

// Esquiva: Defesa + bônus de Reflexos (se treinado). Funciona contra ataques
// corpo a corpo e à distância, desde que você consiga ver o atacante.
function sugestaoEsquiva() {
    const bonusReflexos = estaTreinado("Reflexos") ? 5 : 0;
    return sugestaoDefesa() + bonusReflexos;
}

// Bloqueio: Resistência a Dano (RD) igual ao bônus de Fortitude, usada como
// reação ao receber um ataque. Sem Fortitude treinada, não é possível bloquear.
function sugestaoBloqueio() {
    return estaTreinado("Fortitude") ? 5 : 0;
}

// Contra-ataque: mesmo valor da Defesa, mas só é possível usá-lo com Luta treinada.
function sugestaoContraAtaque() {
    return sugestaoDefesa();
}

// Monta a lista de equipamento inicial combinando armas, proteção e itens temáticos
function gerarEquipamento(personagem) {
    const itens = [];

    armasSelecionadas.forEach((arma, indice) => {
        itens.push(`${arma.nome}${indice === 0 ? " (arma principal)" : ""}`);
    });

    if (protecaoSelecionada) {
        itens.push(`${protecaoSelecionada.nome} (+${protecaoSelecionada.bonusDefesa} Defesa)`);
    }

    if (escudoEquipado) {
        itens.push(`${escudo.nome} (+${escudo.bonusDefesa} Defesa se empunhado)`);
    }

    if (equipamentosEspeciais.mochilaTatica) {
        itens.push("Mochila Tática (+2 no espaço total do personagem)");
    }

    if (equipamentosEspeciais.cavalo) {
        itens.push(`Cavalo (${Math.max(0, capacidadeCavalo() - espacoUsadoCavalo())} espaço(s) restante(s))`);
    }

    listaDeConsumiveis.forEach(item => {
        const estado = consumiveisSelecionados[item.nome];
        if (estado.personagem > 0) {
            itens.push(`${item.nome} x${estado.personagem} (personagem)`);
        }
        if (equipamentosEspeciais.cavalo && estado.cavalo > 0) {
            itens.push(`${item.nome} x${estado.cavalo} (cavalo)`);
        }
    });

    if (origemSelecionada) {
        itens.push(`Item pessoal ligado à origem de ${origemSelecionada.nome}`);
    }

    itens.push("Kit de sobrevivência básico (rações, corda, isqueiro)");
    itens.push("Bolsa de utilidades");

    return itens;
}

// Monta as linhas da tabela de Habilidades & Rituais a partir da progressão de NEX da classe
function gerarTabelaHabilidades() {
    if (!classeSelecionada || !Array.isArray(classeSelecionada.progressao)) {
        return "";
    }

    return classeSelecionada.progressao.map(passo => {
        let texto = passo.habilidade;

        if (passo.habilidade === "Habilidade de Trilha") {
            const trilha = trilhaSelecionada[categoriaSelecionada];
            const poder = poderTrilhaParaNex(categoriaSelecionada, passo.nex);
            texto = poder
                ? `${poder.titulo} (Trilha: ${trilha.nome})`
                : "Habilidade de Trilha (não escolhida)";
        } else if (passo.habilidade.startsWith("Poder de ")) {
            const nomeTalento = talentosEscolhidos[categoriaSelecionada] && talentosEscolhidos[categoriaSelecionada][passo.nex];
            texto = nomeTalento ? `Talento: ${nomeTalento}` : `${passo.habilidade} (não escolhido)`;
        }

        return `
            <tr>
                <td>${texto}</td>
                <td>${passo.nex}%</td>
            </tr>
        `;
    }).join("");
}

// Monta o bloco estruturado da arma principal (a primeira escolhida) e lista as demais
function renderArmaDetalhe() {
    if (armasSelecionadas.length === 0) {
        return "<p>Nenhuma arma escolhida.</p>";
    }

    const a = armasSelecionadas[0];

    let html = `
        <p class="ficha-arma-linha"><strong>Nome:</strong> ${a.nome}</p>
        <p class="ficha-arma-linha"><strong>Categoria:</strong> ${a.nivel} · ${a.categoria}</p>
        <p class="ficha-arma-linha"><strong>Dano:</strong> ${calcularDano(a)} · <strong>Teste de</strong> ${a.pericia}</p>
        <p class="ficha-arma-linha"><strong>Alcance:</strong> ${a.alcance}</p>
        <p class="ficha-arma-linha"><strong>Propriedades:</strong> ${a.maos} · Peso ${a.peso} · Tamanho ${a.tamanho} · ${a.espaco} slot${a.espaco === 1 ? "" : "s"}</p>
        <p class="ficha-arma-linha">${a.especial}</p>
    `;

    if (armasSelecionadas.length > 1) {
        const extras = armasSelecionadas.slice(1).map(arma => arma.nome).join(", ");
        html += `<p class="ficha-arma-linha"><strong>Armas extras carregadas:</strong> ${extras}</p>`;
    }

    return html;
}

// Monta as linhas da tabela de Inventário com armas, proteção e escudo carregados
function gerarInventarioArmas() {
    const linhas = armasSelecionadas.map(arma => `
        <tr>
            <td>${arma.nome}</td>
            <td>${arma.categoria}</td>
            <td>${arma.espaco} slot${arma.espaco === 1 ? "" : "s"}</td>
        </tr>
    `);

    if (protecaoSelecionada) {
        linhas.push(`
            <tr>
                <td>${protecaoSelecionada.nome}</td>
                <td>Proteção</td>
                <td>${protecaoSelecionada.espaco} slot${protecaoSelecionada.espaco === 1 ? "" : "s"}</td>
            </tr>
        `);
    }

    if (escudoEquipado) {
        linhas.push(`
            <tr>
                <td>${escudo.nome}</td>
                <td>Proteção</td>
                <td>${escudo.espaco} slot</td>
            </tr>
        `);
    }

    if (equipamentosEspeciais.mochilaTatica) {
        linhas.push(`
            <tr>
                <td>Mochila Tática</td>
                <td>Especial</td>
                <td>+2 espaços</td>
            </tr>
        `);
    }

    if (equipamentosEspeciais.cavalo) {
        linhas.push(`
            <tr>
                <td>Cavalo</td>
                <td>Especial</td>
                <td>${Math.max(0, capacidadeCavalo() - espacoUsadoCavalo())} de ${capacidadeCavalo()} slots livres</td>
            </tr>
        `);
    }

    listaDeConsumiveis.forEach(item => {
        const estado = consumiveisSelecionados[item.nome];
        if (estado.personagem > 0) {
            linhas.push(`
                <tr>
                    <td>${item.nome} x${estado.personagem}</td>
                    <td>Consumível · personagem</td>
                    <td>${estado.personagem * item.espaco} slots</td>
                </tr>
            `);
        }
        if (equipamentosEspeciais.cavalo && estado.cavalo > 0) {
            linhas.push(`
                <tr>
                    <td>${item.nome} x${estado.cavalo}</td>
                    <td>Consumível · cavalo</td>
                    <td>${estado.cavalo * item.espaco} slots</td>
                </tr>
            `);
        }
    });

    return linhas.join("");
}

function preencherFicha(personagem) {
    const campos = {
        fichaNome: personagem.personagem,
        fichaPersonagem: personagem.personagem,
        fichaJogador: personagem.jogador,
        fichaNivel: personagem.nivel,
        fichaOrigem: personagem.origem,
        fichaCategoria: personagem.categoria.toUpperCase(),
        fichaClasse: personagem.classe,
        fichaProtecao: personagem.protecao,
        fichaDefesa: personagem.defesa,
        fichaEsquiva: personagem.esquiva,
        fichaBloqueio: personagem.bloqueio,
        fichaContraAtaque: personagem.contraAtaque,
        fichaDT: personagem.dt,
        fichaPericias: personagem.pericias,
        fichaAgilidade: personagem.atributos.agilidade,
        fichaForca: personagem.atributos.forca,
        fichaIntelecto: personagem.atributos.intelecto,
        fichaPresenca: personagem.atributos.presenca,
        fichaVigor: personagem.atributos.vigor,
        fichaAparencia: personagem.aparencia,
        fichaPersonalidade: personagem.personalidade,
        fichaHistorico: personagem.historico,
        fichaObjetivo: personagem.objetivo
    };

    Object.entries(campos).forEach(([id, valor]) => {
        const elemento = document.getElementById(id);

        if (elemento) {
            elemento.textContent = valor;
        }
    });

    const fichaFoto = document.getElementById("fichaFoto");
    if (fichaFoto) {
        fichaFoto.src = personagem.foto || "";
        fichaFoto.hidden = !personagem.foto;
    }

    if (origemSelecionada) {
        const titulo = document.getElementById("fichaOrigemTitulo");
        const descricao = document.getElementById("fichaOrigemDescricao");
        const periciasOrigem = document.getElementById("fichaPericiasOrigem");
        const habilidadeOrigem = document.getElementById("fichaHabilidadeOrigem");

        if (titulo) titulo.textContent = origemSelecionada.nome;
        if (descricao) descricao.textContent = origemSelecionada.descricao;
        if (periciasOrigem) periciasOrigem.textContent = origemSelecionada.pericias.join(", ");
        if (habilidadeOrigem) {
            const hab = habilidadeOrigemAtual();
            habilidadeOrigem.textContent = `${hab.nome}. ${hab.descricao}`;
        }
    }

    if (classeSelecionada) {
        const proficienciasEl = document.getElementById("fichaProficiencias");
        if (proficienciasEl) proficienciasEl.textContent = classeSelecionada.proficiencias;
    }

    const armaDetalhe = document.getElementById("fichaArmaDetalhe");
    if (armaDetalhe) armaDetalhe.innerHTML = renderArmaDetalhe();

    const equipamentoEl = document.getElementById("fichaEquipamento");
    if (equipamentoEl) {
        equipamentoEl.innerHTML = gerarEquipamento(personagem)
            .map(item => `<li>${item}</li>`)
            .join("");
    }

    const habilidadesTabela = document.getElementById("fichaHabilidadesTabela");
    if (habilidadesTabela) habilidadesTabela.innerHTML = gerarTabelaHabilidades();

    const rituaisFichaEl = document.getElementById("fichaRituaisConhecidos");
    if (rituaisFichaEl) rituaisFichaEl.innerHTML = gerarRituaisConhecidosHTML();

    const inventarioArmas = document.getElementById("fichaInventarioArmas");
    if (inventarioArmas) {
        const possuiItens =
            armasSelecionadas.length > 0 ||
            protecaoSelecionada ||
            escudoEquipado ||
            equipamentosEspeciais.mochilaTatica ||
            equipamentosEspeciais.cavalo ||
            listaDeConsumiveis.some(item => {
                const estado = consumiveisSelecionados[item.nome];
                return estado.personagem > 0 || estado.cavalo > 0;
            });

        inventarioArmas.innerHTML = possuiItens
            ? gerarInventarioArmas()
            : `<tr><td colspan="3" class="inventario-vazio">Nenhum item equipado.</td></tr>`;
    }
}

// ============================================================
// SALVAR PERSONAGEM
// ============================================================

function salvarPersonagem() {
    const personagem = obterPersonagem();

    let personagens = [];

    try {
        personagens = JSON.parse(
            localStorage.getItem("imperio_personagens")
        ) || [];
    } catch (erro) {
        personagens = [];
    }

    const existente = personagens.findIndex(p =>
        p.personagem === personagem.personagem &&
        p.jogador === personagem.jogador
    );

    if (existente >= 0) {
        personagens[existente] = personagem;
    } else {
        personagens.push(personagem);
    }

    localStorage.setItem(
        "imperio_personagens",
        JSON.stringify(personagens)
    );

    alert("PERSONAGEM SALVO COM SUCESSO!");
}

// ============================================================
// GERAR PDF
// ============================================================

function gerarPDF() {
    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert(
            "A biblioteca jsPDF não foi carregada. Verifique o index.html."
        );
        return;
    }

    const personagem = obterPersonagem();
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "mm", "a4");

    const LARGURA = 210;
    const ALTURA = 297;
    const MARGEM = 15;
    const LARGURA_UTIL = LARGURA - MARGEM * 2;

    const FUNDO = [10, 10, 10];
    const VERMELHO = [117, 0, 0];
    const VERMELHO_CLARO = [196, 18, 18];
    const DOURADO = [199, 168, 91];
    const TEXTO = [229, 221, 206];
    const TEXTO_SUAVE = [160, 160, 160];
    const LINHA = [68, 68, 68];

    let y = MARGEM;

    function pintarFundo() {
        pdf.setFillColor(...FUNDO);
        pdf.rect(0, 0, LARGURA, ALTURA, "F");
    }

    function novaPagina() {
        pdf.addPage();
        pintarFundo();
        y = MARGEM;
    }

    function verificarEspaco(altura) {
        if (y + altura > ALTURA - MARGEM) {
            novaPagina();
        }
    }

    function barra(texto, largura = LARGURA_UTIL, x = MARGEM) {
        verificarEspaco(11);
        pdf.setFillColor(...VERMELHO);
        pdf.rect(x, y, largura, 8, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFont(undefined, "bold");
        pdf.setFontSize(11);
        pdf.text(texto, x + 3, y + 5.6);
        y += 8 + 4;
    }

    function linhaLabel(label, valor, x = MARGEM, largura = LARGURA_UTIL) {
        pdf.setFont(undefined, "bold");
        pdf.setFontSize(10);
        pdf.setTextColor(...DOURADO);
        const rotulo = `${label}: `;
        pdf.text(rotulo, x, y + 4);
        const larguraRotulo = pdf.getTextWidth(rotulo);
        pdf.setFont(undefined, "normal");
        pdf.setTextColor(...TEXTO);
        const linhas = pdf.splitTextToSize(String(valor), largura - larguraRotulo);
        pdf.text(linhas[0] || "", x + larguraRotulo, y + 4);
        y += 6;
        if (linhas.length > 1) {
            pdf.text(linhas.slice(1), x, y + 4);
            y += (linhas.length - 1) * 5 + 2;
        }
    }

    function paragrafo(texto, tamanho = 10, cor = TEXTO) {
        pdf.setFont(undefined, "normal");
        pdf.setFontSize(tamanho);
        pdf.setTextColor(...cor);
        const linhas = pdf.splitTextToSize(String(texto), LARGURA_UTIL);
        verificarEspaco(linhas.length * 5 + 3);
        pdf.text(linhas, MARGEM, y + 4);
        y += linhas.length * 5 + 5;
    }

    function subtitulo(texto) {
        verificarEspaco(8);
        pdf.setFont(undefined, "bold");
        pdf.setFontSize(12);
        pdf.setTextColor(...VERMELHO_CLARO);
        pdf.text(texto, MARGEM, y + 4);
        y += 7;
    }

    function linhaDivisoria() {
        pdf.setDrawColor(...LINHA);
        pdf.line(MARGEM, y, LARGURA - MARGEM, y);
        y += 5;
    }

    // ---------- CAPA / CABEÇALHO ----------
    pintarFundo();

    pdf.setFont(undefined, "bold");
    pdf.setFontSize(28);
    pdf.setTextColor(...VERMELHO_CLARO);
    pdf.text("IMPÉRIO", LARGURA / 2, y + 12, { align: "center" });
    y += 18;

    pdf.setFontSize(16);
    pdf.setTextColor(...TEXTO);
    pdf.text(personagem.personagem, LARGURA / 2, y, { align: "center" });
    y += 6;

    pdf.setFont(undefined, "italic");
    pdf.setFontSize(9);
    pdf.setTextColor(...TEXTO_SUAVE);
    pdf.text("ELE SEMPRE SOUBE", LARGURA / 2, y + 4, { align: "center" });
    y += 12;

    // ---------- IDENTIDADE / CLASSE (lado a lado) ----------
    const meiaLargura = (LARGURA_UTIL - 6) / 2;

    barra("IDENTIDADE", meiaLargura, MARGEM);
    const yDepoisBarra = y;
    linhaLabel("Personagem", personagem.personagem, MARGEM, meiaLargura);
    linhaLabel("Jogador", personagem.jogador, MARGEM, meiaLargura);
    linhaLabel("Nível", personagem.nivel, MARGEM, meiaLargura);
    linhaLabel("Origem", personagem.origem, MARGEM, meiaLargura);
    const yColunaA = y;

    y = yDepoisBarra - 12;
    barra("CLASSE", meiaLargura, MARGEM + meiaLargura + 6);
    linhaLabel("Categoria", personagem.categoria, MARGEM + meiaLargura + 6, meiaLargura);
    linhaLabel("Classe", personagem.classe, MARGEM + meiaLargura + 6, meiaLargura);
    const yColunaB = y;

    y = Math.max(yColunaA, yColunaB) + 4;

    // ---------- ORIGEM ----------
    if (origemSelecionada) {
        barra("ORIGEM");
        pdf.setFont(undefined, "bold");
        pdf.setFontSize(11);
        pdf.setTextColor(...VERMELHO_CLARO);
        verificarEspaco(6);
        pdf.text(origemSelecionada.nome, MARGEM, y + 4);
        y += 6;
        paragrafo(origemSelecionada.descricao);
        linhaLabel("Perícias treinadas", origemSelecionada.pericias.join(", "));
        const habOrigemPdf = habilidadeOrigemAtual();
        paragrafo(`${habOrigemPdf.nome}. ${habOrigemPdf.descricao}`, 9.5, TEXTO_SUAVE);
    }

    // ---------- ATRIBUTOS ----------
    barra("ATRIBUTOS");
    const atribs = [
        ["Agilidade", personagem.atributos.agilidade],
        ["Força", personagem.atributos.forca],
        ["Intelecto", personagem.atributos.intelecto],
        ["Presença", personagem.atributos.presenca],
        ["Vigor", personagem.atributos.vigor]
    ];
    const larguraAtrib = LARGURA_UTIL / 5;
    verificarEspaco(16);
    const yAtrib = y;
    atribs.forEach((item, indice) => {
        const x = MARGEM + indice * larguraAtrib;
        pdf.setDrawColor(...LINHA);
        pdf.rect(x, yAtrib, larguraAtrib - 3, 16);
        pdf.setFont(undefined, "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(...TEXTO_SUAVE);
        pdf.text(item[0].toUpperCase(), x + 3, yAtrib + 6);
        pdf.setFont(undefined, "bold");
        pdf.setFontSize(14);
        pdf.setTextColor(...VERMELHO_CLARO);
        pdf.text(String(item[1]), x + 3, yAtrib + 13);
    });
    y = yAtrib + 16 + 6;

    // ---------- CARACTERÍSTICAS (PV / PE / PROTEÇÃO / SAN / DEFESA) ----------
    const caracteristicas = [
        ["PV", personagem.pv],
        ["PE", personagem.pe],
        ["PROTEÇÃO", personagem.protecao],
        ["SAN", personagem.san],
        ["DEFESA", personagem.defesa],
        ["ESQUIVA", personagem.esquiva],
        ["BLOQUEIO (RD)", personagem.bloqueio],
        ["CONTRA-ATAQUE", personagem.contraAtaque],
        ["DT", personagem.dt]
    ];
    const larguraCarac = LARGURA_UTIL / 3;
    verificarEspaco(58);
    let yCarac = y;
    caracteristicas.forEach((item, indice) => {
        const coluna = indice % 3;
        const linha = Math.floor(indice / 3);
        const x = MARGEM + coluna * larguraCarac;
        const yBox = yCarac + linha * 18;
        pdf.setDrawColor(...LINHA);
        pdf.rect(x, yBox, larguraCarac - 3, 16);
        pdf.setFont(undefined, "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(...DOURADO);
        pdf.text(String(item[0]), x + 3, yBox + 6);
        pdf.setFont(undefined, "bold");
        pdf.setFontSize(13);
        pdf.setTextColor(...TEXTO);
        pdf.text(String(item[1]), x + 3, yBox + 13);
    });
    y = yCarac + 54 + 6;

    // ---------- PROFICIÊNCIAS E PERÍCIAS ----------
    if (classeSelecionada) {
        barra("PROFICIÊNCIAS");
        paragrafo(classeSelecionada.proficiencias);
    }

    barra("PERÍCIAS TREINADAS");
    paragrafo(personagem.pericias);

    // ---------- ARMA PRINCIPAL E EQUIPAMENTO ----------
    barra("ARMA PRINCIPAL");
    if (armasSelecionadas.length > 0) {
        armasSelecionadas.forEach((arma, indice) => {
            linhaDivisoria();
            linhaLabel(indice === 0 ? "Principal" : "Extra", arma.nome);
            linhaLabel("Categoria", `${arma.nivel} · ${arma.categoria} · ${arma.proficiencia}`);
            linhaLabel("Dano / Teste", `${calcularDano(arma)} · ${arma.pericia}`);
            linhaLabel("Alcance", arma.alcance);
            linhaLabel("Propriedades", `${arma.maos} · Peso ${arma.peso} · Tamanho ${arma.tamanho} · ${arma.espaco} slot${arma.espaco === 1 ? "" : "s"}`);
            paragrafo(arma.especial, 9.5, TEXTO_SUAVE);
        });
    } else {
        paragrafo("Nenhuma arma escolhida.");
    }

    barra("EQUIPAMENTO");
    gerarEquipamento(personagem).forEach(item => {
        verificarEspaco(6);
        pdf.setFont(undefined, "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(...TEXTO);
        const linhas = pdf.splitTextToSize(`•  ${item}`, LARGURA_UTIL);
        pdf.text(linhas, MARGEM, y + 4);
        y += linhas.length * 5 + 2;
    });
    y += 3;

    // ---------- HABILIDADES & RITUAIS ----------
    if (classeSelecionada && Array.isArray(classeSelecionada.progressao)) {
        barra("HABILIDADES E RITUAIS (PROGRESSÃO DE NEX)");

        classeSelecionada.progressao.forEach(passo => {
            verificarEspaco(6);
            pdf.setFont(undefined, "bold");
            pdf.setFontSize(9.5);
            pdf.setTextColor(...DOURADO);
            pdf.text(`${passo.nex}%`, MARGEM, y + 4);

            pdf.setFont(undefined, "normal");
            pdf.setTextColor(...TEXTO);
            const linhas = pdf.splitTextToSize(passo.habilidade, LARGURA_UTIL - 16);
            pdf.text(linhas, MARGEM + 16, y + 4);
            y += Math.max(linhas.length * 5, 5) + 1.5;
        });

        y += 3;
    }

    // ---------- APARÊNCIA / PERSONALIDADE / HISTÓRICO / OBJETIVO ----------
    barra("APARÊNCIA");
    paragrafo(personagem.aparencia);

    barra("PERSONALIDADE");
    paragrafo(personagem.personalidade);

    barra("HISTÓRICO");
    paragrafo(personagem.historico);

    barra("OBJETIVO");
    paragrafo(personagem.objetivo);

    // ---------- O PARANORMAL ----------
    barra("O PARANORMAL");
    linhaLabel("Você acredita que Ele existe?", personagem.respostaParanormal);

    // ---------- RODAPÉ ----------
    verificarEspaco(10);
    pdf.setFont(undefined, "italic");
    pdf.setFontSize(8);
    pdf.setTextColor(...TEXTO_SUAVE);
    pdf.text(`Ficha criada em: ${personagem.dataCriacao}`, MARGEM, y + 4);

    const nomeArquivo = personagem.personagem
        .replace(/[\\/:*?"<>|]/g, "_")
        .replace(/\s+/g, "_");

    pdf.save(`IMPERIO_${nomeArquivo}.pdf`);
}

// ============================================================
// GERAR IMAGEM
// ============================================================

function gerarImagem() {
    if (!window.html2canvas) {
        alert(
            "A biblioteca html2canvas não foi carregada. Verifique o index.html."
        );
        return;
    }

    const ficha = document.querySelector(".ficha");
    if (!ficha) return;

    const areaExportar = ficha.querySelector(".acoes-exportar");

    const acaoRecomecar = ficha.querySelector(".acao-recomecar");

    // Esconde os botões antes de capturar, para não aparecerem na imagem
    if (areaExportar) areaExportar.style.display = "none";
    if (acaoRecomecar) acaoRecomecar.style.display = "none";

    // Força a largura exata de uma folha A4 (210mm) em pixels, independente
    // do zoom/tela do dispositivo, para a imagem sair sempre no formato certo
    const larguraOriginal = ficha.style.width;
    const maxLarguraOriginal = ficha.style.maxWidth;
    const larguraA4px = Math.round((210 * 96) / 25.4);
    ficha.style.width = larguraA4px + "px";
    ficha.style.maxWidth = "none";

    html2canvas(ficha, {
        backgroundColor: "#050505",
        scale: 3,
        useCORS: true,
        windowWidth: larguraA4px
    }).then(canvas => {
        ficha.style.width = larguraOriginal;
        ficha.style.maxWidth = maxLarguraOriginal;
        if (areaExportar) areaExportar.style.display = "";
        if (acaoRecomecar) acaoRecomecar.style.display = "";

        const personagem = obterPersonagem();

        const nomeArquivo = personagem.personagem
            .replace(/[\\/:*?"<>|]/g, "_")
            .replace(/\s+/g, "_");

        const link = document.createElement("a");
        link.download = `IMPERIO_${nomeArquivo}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();

    }).catch(erro => {
        ficha.style.width = larguraOriginal;
        ficha.style.maxWidth = maxLarguraOriginal;
        if (areaExportar) areaExportar.style.display = "";
        if (acaoRecomecar) acaoRecomecar.style.display = "";

        console.error(erro);
        alert("Não foi possível gerar a imagem da ficha.");
    });
}

// ============================================================
// COMPARTILHAR PERSONAGEM
// ============================================================

async function compartilharPersonagem() {
    const personagem = obterPersonagem();

    const textoCompartilhar = `IMPÉRIO - FICHA DE PERSONAGEM

Personagem: ${personagem.personagem}
Jogador: ${personagem.jogador}
Nível: ${personagem.nivel}

Classe: ${personagem.classe}
Origem: ${personagem.origem}

PV: ${personagem.pv}
PE: ${personagem.pe}
Proteção: ${personagem.protecao}
SAN: ${personagem.san}
Defesa: ${personagem.defesa}
Esquiva: ${personagem.esquiva}
Bloqueio (RD): ${personagem.bloqueio}
Contra-ataque: ${personagem.contraAtaque}

Agilidade: ${personagem.atributos.agilidade}
Força: ${personagem.atributos.forca}
Intelecto: ${personagem.atributos.intelecto}
Presença: ${personagem.atributos.presenca}
Vigor: ${personagem.atributos.vigor}

Perícias: ${personagem.pericias}

Arma: ${personagem.arma}

"ELE SEMPRE SOUBE."`;

    if (navigator.share) {
        try {
            await navigator.share({
                title: `IMPÉRIO - ${personagem.personagem}`,
                text: textoCompartilhar
            });

            return;

        } catch (erro) {
            if (erro.name !== "AbortError") {
                console.error(erro);
            }
        }
    }

    try {
        await navigator.clipboard.writeText(textoCompartilhar);

        alert(
            "A ficha foi copiada para a área de transferência!"
        );

    } catch (erro) {
        alert(
            "Não foi possível compartilhar automaticamente."
        );
    }
}

// ============================================================
// COMPARTILHAR SITE
// ============================================================

async function compartilharSite() {
    const link = window.location.href;

    if (window.location.protocol === "file:") {
        alert(
            "Este site ainda está aberto como um arquivo no seu computador (endereço começando com \"file:///\"), " +
            "então esse link só funciona na sua própria máquina — ninguém mais consegue abri-lo.\n\n" +
            "Para poder compartilhar um link de verdade, primeiro hospede os arquivos (index.html, style.css e script.js) " +
            "em algum lugar online, como GitHub Pages, Netlify ou Vercel. Depois disso, este botão vai copiar o link público correto."
        );
        return;
    }

    if (navigator.share) {
        try {
            await navigator.share({
                title: "\"IMPÉRIO\" - Criação de Personagem",
                text: "Crie seu personagem para \"IMPÉRIO\":",
                url: link
            });

            return;

        } catch (erro) {
            if (erro.name !== "AbortError") {
                console.error(erro);
            }
        }
    }

    try {
        await navigator.clipboard.writeText(link);

        alert(
            "O link do site foi copiado para a área de transferência!"
        );

    } catch (erro) {
        alert(
            "Não foi possível copiar o link automaticamente."
        );
    }
}

// ============================================================
// VOLTAR AO INÍCIO
// ============================================================

function voltarInicio() {
    mostrarTela("inicio");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// ============================================================
// MODO DE JOGO
// ============================================================

function abrirModoJogo() {
    const personagem = obterPersonagem();

    mostrarTela("modoJogo");

    preencherModoJogo(personagem);

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function voltarParaFicha() {
    mostrarTela("fichaFinal");

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function toggleSecaoJogo(id) {
    const conteudo = document.getElementById(id);
    if (!conteudo) return;

    const cabecalho = conteudo.previousElementSibling;
    const seta = cabecalho?.querySelector(".seta");

    conteudo.classList.toggle("aberta");

    if (seta) {
        seta.textContent = conteudo.classList.contains("aberta") ? "▾" : "▸";
    }
}

function toggleEditorArmasJogo() {
    const editor = document.getElementById("editorArmasJogo");
    if (!editor) return;

    editor.hidden = !editor.hidden;
    renderizarEditorArmasJogo();
}

function renderizarEditorArmasJogo() {
    const lista = document.getElementById("listaEditorArmasJogo");
    if (!lista) return;

    const categorias = ["Corte", "Haste", "Distância", "Impacto"];

    lista.innerHTML = categorias.map(categoria => {
        const armas = listaDeArmas
            .filter(arma => arma.categoria === categoria)
            .sort((a, b) => a.nivel - b.nivel);

        return `
            <div class="grupo-editor-armas-jogo">
                <strong>${categoria}</strong>
                ${armas.map(arma => `
                    <label>
                        <input type="checkbox"
                               ${armasSelecionadas.some(selecionada => selecionada.nome === arma.nome) ? "checked" : ""}
                               onchange="alterarArmaNoModo('${arma.nome}')">
                        <span>${arma.nome}</span>
                    </label>
                `).join("")}
            </div>
        `;
    }).join("");
}

function alterarArmaNoModo(nome) {
    toggleArma(nome);
    preencherModoJogo(obterPersonagem());
    renderizarEditorArmasJogo();
}

function preencherModoJogo(personagem) {
    const jogoFoto = document.getElementById("jogoFoto");
    if (jogoFoto) {
        jogoFoto.src = personagem.foto || "";
        jogoFoto.hidden = !personagem.foto;
    }

    const nomeEl = document.getElementById("jogoNome");
    if (nomeEl) nomeEl.textContent = personagem.personagem;

    const classeOrigemEl = document.getElementById("jogoClasseOrigem");
    if (classeOrigemEl) {
        classeOrigemEl.textContent = `${personagem.classe} · ${personagem.origem}`;
    }

    const nivelEl = document.getElementById("jogoNivel");
    if (nivelEl) {
        nivelEl.value = personagem.nivel;
    }

    const nexEl = document.getElementById("jogoNex");
    if (nexEl) {
        nexEl.value = personagem.nex;
    }

    atualizarBarraStatus("pv");
    atualizarBarraStatus("pe");
    atualizarBarraStatus("san");

    const combate = [
        ["Proteção", personagem.protecao],
        ["Defesa", personagem.defesa],
        ["Esquiva", personagem.esquiva],
        ["Bloqueio (RD)", personagem.bloqueio],
        ["Contra-ataque", personagem.contraAtaque]
    ];

    const combateEl = document.getElementById("jogoCombate");
    if (combateEl) {
        combateEl.innerHTML = combate.map(([rotulo, valor]) => `
            <div class="item-jogo">
                <span class="item-jogo-rotulo">${rotulo}</span>
                <span class="item-jogo-valor">${valor}</span>
            </div>
        `).join("");
    }

    const atributosEl = document.getElementById("jogoAtributos");
    if (atributosEl) {
        const listaAtributos = [
            ["Agilidade", personagem.atributos.agilidade],
            ["Força", personagem.atributos.forca],
            ["Intelecto", personagem.atributos.intelecto],
            ["Presença", personagem.atributos.presenca],
            ["Vigor", personagem.atributos.vigor]
        ];

        atributosEl.innerHTML = listaAtributos.map(([rotulo, valor]) => `
            <div class="item-jogo">
                <span class="item-jogo-rotulo">${rotulo}</span>
                <span class="item-jogo-valor">${valor}</span>
            </div>
        `).join("");
    }

    const armasEl = document.getElementById("jogoArmas");
    if (armasEl) {
        armasEl.innerHTML = armasSelecionadas.length > 0
            ? armasSelecionadas.map((arma, indice) => `
                <div class="carta-arma-jogo">
                    <div class="carta-arma-jogo-topo">
                        <strong>${arma.nome}${indice === 0 ? " (principal)" : ""}</strong>
                        <span class="arma-dano-badge">${calcularDano(arma)}</span>
                    </div>
                    <p>${arma.categoria} · Cat. ${arma.nivel} · teste de ${arma.pericia} · alcance ${arma.alcance}</p>
                    <p class="item-jogo-especial">${arma.especial}</p>
                </div>
            `).join("")
            : `<p class="aviso-vazio">Nenhuma arma equipada.</p>`;
    }

    renderizarEditorArmasJogo();

    const periciasEl = document.getElementById("jogoPericias");
    if (periciasEl) {
        const nomesOrigem = origemSelecionada ? origemSelecionada.pericias : [];
        const todasPericias = [...new Set([...nomesOrigem, ...periciasSelecionadas])];

        periciasEl.innerHTML = todasPericias.length > 0
            ? todasPericias.map(nome => {
                const pericia = listaDePericias.find(p => p.nome === nome);
                const abrev = pericia ? abreviacaoAtributo[pericia.atributo] : "";
                const bonus = 5 + penalidadeArmaduraPesada(nome);

                return `
                    <div class="item-jogo">
                        <span class="item-jogo-rotulo">${nome} <small>(${abrev})</small></span>
                        <span class="item-jogo-valor">${bonus >= 0 ? "+" : ""}${bonus}</span>
                    </div>
                `;
            }).join("")
            : `<p class="aviso-vazio">Nenhuma perícia treinada.</p>`;
    }

    const rituaisJogoEl = document.getElementById("jogoRituais");
    if (rituaisJogoEl) rituaisJogoEl.innerHTML = gerarRituaisConhecidosHTML();

    const regrasEl = document.getElementById("jogoRegrasCombate");
    if (regrasEl) {
        regrasEl.innerHTML = regrasCombate.map(r => `
            <div class="item-regra-combate">
                <strong>${r.titulo}</strong>
                <p>${r.texto}</p>
            </div>
        `).join("");
    }

    const condicoesEl = document.getElementById("jogoCondicoes");
    if (condicoesEl) {
        condicoesEl.innerHTML = condicoesStatus.map(c => `
            <div class="item-condicao">
                <strong>${c.nome}</strong>
                <p>${c.efeito}</p>
            </div>
        `).join("");
    }
}

// ============================================================
// NAVEGAÇÃO E INICIALIZAÇÃO
// ============================================================

function mostrarTela(idTela) {
    document.querySelectorAll(".tela").forEach(tela => {
        tela.classList.remove("ativa");
    });

    document.getElementById(idTela)?.classList.add("ativa");
}

function criarPersonagem() {
    mostrarTela("criador");
    
    mudarEtapa(1);
    
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function mudarEtapa(novaEtapa) {
    if (novaEtapa < 1 || novaEtapa > 9) return;

    document.querySelectorAll(".etapa").forEach(etapa => {
        etapa.classList.remove("ativa");
    });

    const etapaAlvo = document.getElementById(`etapa${novaEtapa}`);
    if (etapaAlvo) etapaAlvo.classList.add("ativa");

    const menuItens = document.querySelectorAll(".menu-item");
    menuItens.forEach(item => item.classList.remove("ativo"));
    if (menuItens[novaEtapa - 1]) {
        menuItens[novaEtapa - 1].classList.add("ativo");
    }

    etapaAtual = novaEtapa;
    atualizarProgresso();

    if (novaEtapa === 3) {
        if (categoriaSelecionada) mostrarCategoria(categoriaSelecionada);
        if (classeSelecionada) mostrarDetalhesClasse(classeSelecionada);
    } else if (novaEtapa === 4) {
        mostrarOrigens();
    } else if (novaEtapa === 5) {
        mostrarPericias();
    } else if (novaEtapa === 6) {
        atualizarCaracteristicas();
    } else if (novaEtapa === 7) {
        atualizarPainelRituais();
    } else if (novaEtapa === 8) {
        mostrarArmas();
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

document.addEventListener("DOMContentLoaded", () => {
    mostrarTela("inicio");
    atualizarProgresso();
    atualizarEfeitosDeAtributo();
    restaurarProgresso();

    // Salva automaticamente sempre que qualquer campo de texto for editado
    document.addEventListener("input", (evento) => {
        const camposDeTexto = ["personagem", "jogador", "aparencia", "personalidade", "historico", "objetivo"];

        if (camposDeTexto.includes(evento.target.id)) {
            salvarProgresso();
        }
    });
});
// Transição da Tela Inicial para o Criador
function criarPersonagem() {
    mostrarTela("criador");

    mudarEtapa(1);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}