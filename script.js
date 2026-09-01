// ============================================================
// IMPÉRIO - SISTEMA COMPLETO
// ============================================================

// ============================================================
// VARIÁVEIS GERAIS
// ============================================================

let etapaAtual = 1;
let pontosDisponiveis = 3;

let origemSelecionada = null;
let categoriaSelecionada = "";
let classeSelecionada = null;

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

// Limite total de perícias treinadas, de acordo com a classe escolhida
function limitePericias() {
    if (!categoriaSelecionada || !(categoriaSelecionada in periciasBase)) {
        return 0;
    }

    return periciasBase[categoriaSelecionada] + atributos.intelecto;
}

// Quantas perícias já treinadas usam um determinado atributo
function contarPericiasPorAtributo(atributo) {
    return periciasSelecionadas.filter(nome => {
        const pericia = listaDePericias.find(p => p.nome === nome);
        return pericia && pericia.atributo === atributo;
    }).length;
}

// Remove seleções que não são mais válidas (ex.: classe ou atributos mudaram)
function sanearPericias() {
    const limite = limitePericias();

    periciasSelecionadas = periciasSelecionadas.filter((nome, indice, array) => {
        if (indice >= limite) return false;

        const pericia = listaDePericias.find(p => p.nome === nome);
        if (!pericia) return false;

        const jaContadas = array
            .slice(0, indice)
            .filter(n => {
                const p = listaDePericias.find(item => item.nome === n);
                return p && p.atributo === pericia.atributo;
            }).length;

        return jaContadas < atributos[pericia.atributo];
    });
}

function togglePericia(nome) {
    const pericia = listaDePericias.find(p => p.nome === nome);
    if (!pericia) return;

    const jaSelecionada = periciasSelecionadas.includes(nome);

    if (jaSelecionada) {
        periciasSelecionadas = periciasSelecionadas.filter(n => n !== nome);
        mostrarPericias();
        return;
    }

    const limite = limitePericias();

    if (periciasSelecionadas.length >= limite) {
        alert("Você já treinou o número máximo de perícias permitido pela sua classe.");
        return;
    }

    const usadasDoAtributo = contarPericiasPorAtributo(pericia.atributo);

    if (usadasDoAtributo >= atributos[pericia.atributo]) {
        alert(
            `Você só pode treinar até ${atributos[pericia.atributo]} ` +
            `perícia(s) de ${abreviacaoAtributo[pericia.atributo]}, ` +
            "de acordo com o valor desse atributo."
        );
        return;
    }

    periciasSelecionadas.push(nome);
    mostrarPericias();
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

        const bonus = atributos[pericia.atributo] * 5;

        return `${nome} (${abreviacaoAtributo[pericia.atributo]}, +${bonus})`;
    }).join(", ");
}

function mostrarPericias() {
    sanearPericias();

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

    const limite = limitePericias();

    if (resumo) {
        resumo.innerHTML = `
            <div class="pontos-box">
                <p>PERÍCIAS TREINADAS</p>
                <strong>${periciasSelecionadas.length} / ${limite}</strong>
                <small>Limite da classe: ${periciasBase[categoriaSelecionada]} + Intelecto (${atributos.intelecto})</small>
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

    lista.innerHTML = ordemAtributos.map(atributo => {
        const valorAtributo = atributos[atributo];
        const usadasDoAtributo = contarPericiasPorAtributo(atributo);

        const itensHTML = listaDePericias
            .filter(pericia => pericia.atributo === atributo)
            .map(pericia => {
                const selecionada = periciasSelecionadas.includes(pericia.nome);
                const bonus = selecionada ? valorAtributo * 5 : 0;

                const limiteAtributoAtingido = usadasDoAtributo >= valorAtributo;
                const limiteTotalAtingido = periciasSelecionadas.length >= limite;
                const bloqueada = !selecionada && (limiteTotalAtingido || limiteAtributoAtingido);

                let motivo = "";
                if (bloqueada) {
                    motivo = limiteAtributoAtingido
                        ? "Atributo cheio"
                        : "Limite da classe atingido";
                }

                return `
                    <label class="pericia-item ${selecionada ? "selecionada" : ""} ${bloqueada ? "bloqueada" : ""}">

                        <input type="checkbox"
                               ${selecionada ? "checked" : ""}
                               ${bloqueada ? "disabled" : ""}
                               onchange="togglePericia('${pericia.nome}')">

                        <span class="pericia-check"></span>

                        <span class="pericia-info">
                            <span class="pericia-nome">
                                ${pericia.nome}${pericia.somenteTreinada ? "*" : ""}
                            </span>
                            ${bloqueada ? `<span class="pericia-motivo">${motivo}</span>` : ""}
                        </span>

                        <span class="pericia-bonus">+${bonus}</span>

                    </label>
                `;
            })
            .join("");

        return `
            <div class="grupo-pericias">

                <div class="grupo-pericias-header">
                    <h3>${nomesAtributo[atributo]} <span class="grupo-abrev">(${abreviacaoAtributo[atributo]})</span></h3>
                    <span class="grupo-contador">${usadasDoAtributo} / ${valorAtributo} treinadas</span>
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
        nome: "Professor",
        descricao: "Você dedicou sua vida a ensinar e pesquisar, e em algum ponto seus estudos tocaram em assuntos que a maioria das academias prefere ignorar. Registros incompletos, lendas locais e relatos descartados como superstição começaram a formar um padrão perturbador demais para ignorar.",
        pericias: ["Ciências", "Investigação"],
        habilidade: {
            nome: "Saber é Poder",
            descricao: "Sua disciplina intelectual permite extrair clareza mesmo sob pressão. Quando faz um teste usando Intelecto, você pode gastar 2 PE para receber +5 nesse teste, aplicando anos de rigor acadêmico ao problema à sua frente."
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
        nome: "Espião",
        descricao: "Você viveu nas sombras de assuntos que não deveriam existir, coletando segredos, observando pessoas importantes e desaparecendo antes que alguém notasse. Confiança é um luxo que você aprendeu a nunca oferecer por completo.",
        pericias: ["Furtividade", "Investigação"],
        habilidade: {
            nome: "Informante",
            descricao: "Sua antiga rede de contatos ainda lhe deve favores. Uma vez por missão, você pode obter uma informação útil sobre uma pessoa ou local, puxando um fio da teia de segredos que ajudou a construir."
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
    }
];

// ============================================================
// CLASSES
// ============================================================

const classes = {
    combatente: [
        {
            nome: "Samurai", foco: "Katana, disciplina e honra.",
            descricao: "O Samurai é a lâmina viva de um juramento. Treinado desde a infância na arte da espada e no código de honra que rege sua existência, ele enfrenta o horror não apenas com aço, mas com uma disciplina inabalável que recusa a desonra da retirada. Onde outros hesitam, o Samurai avança — porque hesitar seria trair tudo o que jurou defender. Além de treinar o corpo para o combate direto, o combatente também aprende a liderar aliados em batalha e a manter seu equipamento sempre pronto para o confronto. Perícias treinadas: Luta e Fortitude, mais uma quantidade de perícias à sua escolha igual a 1 + Intelecto. Figuras conhecidas dessa vocação: Isamu Takagawa, Kaito Onodera e Yuto Shibata.",
            pv: 24, pvNex: 5, pe: 2, peNex: 2, san: 12, sanNex: 3,
            proficiencias: "Armas simples, armas marciais (incluindo katana e wakizashi) e proteções pesadas, como armaduras completas de lamelas.",
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
            descricao: "Sem clã, sem mestre e sem rede de apoio, o Ronin aprendeu a transformar o abandono em vantagem. Ele luta de forma imprevisível, adaptando-se ao inimigo à sua frente em vez de seguir uma escola rígida de combate, e sobrevive onde guerreiros mais tradicionais fracassariam por pura teimosia e instinto afiado. Além de treinar o corpo para o combate direto, o combatente também aprende a liderar aliados em batalha e a manter seu equipamento sempre pronto para o confronto. Perícias treinadas: Luta e Reflexos, mais uma quantidade de perícias à sua escolha igual a 1 + Intelecto. Figuras conhecidas dessa vocação: Ren Takagawa, Goro Kuronuma e Haru Toyotomi Jr.",
            pv: 23, pvNex: 5, pe: 3, peNex: 2, san: 13, sanNex: 3,
            proficiencias: "Armas simples, armas marciais e proteções leves, priorizando mobilidade sobre proteção total.",
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
            descricao: "O Ashigaru é o soldado forjado em campanhas, treinado para suportar o caos da guerra e lutar em formação ao lado de seus companheiros. Sua força não está em golpes espetaculares, mas na resistência bruta de quem já sobreviveu a batalhas que quebraram guerreiros mais talentosos. Além de treinar o corpo para o combate direto, o combatente também aprende a liderar aliados em batalha e a manter seu equipamento sempre pronto para o confronto. Perícias treinadas: Luta e Fortitude, mais uma quantidade de perícias à sua escolha igual a 1 + Intelecto. Figuras conhecidas dessa vocação: Nozomi Kanzaki, Kaito Fujimori e Nao Shibata.",
            pv: 25, pvNex: 5, pe: 2, peNex: 2, san: 10, sanNex: 2,
            proficiencias: "Armas simples, lanças de haste longa e proteções médias, como couraças reforçadas.",
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
            descricao: "Mestre da lança, o Yari no Senshi domina o espaço ao seu redor como ninguém, mantendo inimigos à distância e ditando o ritmo do combate. Cada movimento é calculado para negar ao adversário a chance de se aproximar o suficiente para revidar. Além de treinar o corpo para o combate direto, o combatente também aprende a liderar aliados em batalha e a manter seu equipamento sempre pronto para o confronto. Perícias treinadas: Luta e Reflexos, mais uma quantidade de perícias à sua escolha igual a 1 + Intelecto. Figuras conhecidas dessa vocação: Yui Sakaguchi, Kaito Kuronuma e Nao Kuronuma.",
            pv: 22, pvNex: 5, pe: 3, peNex: 2, san: 11, sanNex: 2,
            proficiencias: "Armas simples, lanças de diferentes comprimentos e proteções médias.",
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
            descricao: "O Kyudoka pratica o caminho do arco como uma forma de meditação letal, onde respiração, postura e foco se fundem em um único disparo perfeito. Ele prefere resolver o conflito antes que o inimigo sequer perceba seu risco, atingindo alvos que a maioria julgaria impossíveis. Além de treinar o corpo para o combate direto, o combatente também aprende a liderar aliados em batalha e a manter seu equipamento sempre pronto para o confronto. Perícias treinadas: Pontaria e Percepção, mais uma quantidade de perícias à sua escolha igual a 1 + Intelecto. Figuras conhecidas dessa vocação: Nozomi Shibata, Hana Toyotomi Jr. e Kenji Ibaraki.",
            pv: 20, pvNex: 4, pe: 4, peNex: 2, san: 12, sanNex: 3,
            proficiencias: "Armas simples, arcos de todos os tipos e proteções leves que não atrapalhem a mira.",
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
            descricao: "Construído como uma muralha viva, o lutador Sumo usa peso, técnica e força bruta para dominar qualquer adversário no combate corpo a corpo. Poucas criaturas — humanas ou não — conseguem permanecer de pé depois de encará-lo diretamente. Além de treinar o corpo para o combate direto, o combatente também aprende a liderar aliados em batalha e a manter seu equipamento sempre pronto para o confronto. Perícias treinadas: Luta e Fortitude, mais uma quantidade de perícias à sua escolha igual a 1 + Intelecto. Figuras conhecidas dessa vocação: Hiroshi Amano, Tetsu Kagemori e Suzu Onodera.",
            pv: 28, pvNex: 6, pe: 2, peNex: 2, san: 10, sanNex: 2,
            proficiencias: "Combate desarmado e proteções pesadas adaptadas ao seu porte físico.",
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
            descricao: "O Sohei é um monge guerreiro que uniu o treinamento marcial dos templos à disciplina espiritual mais rígida. Ele enfrenta ameaças paranormais com a mesma serenidade que aplica à meditação, tratando cada batalha como uma extensão de sua fé. Além de treinar o corpo para o combate direto, o combatente também aprende a liderar aliados em batalha e a manter seu equipamento sempre pronto para o confronto. Perícias treinadas: Luta e Vontade, mais uma quantidade de perícias à sua escolha igual a 1 + Intelecto. Figuras conhecidas dessa vocação: Ren Kurogane, Hiroshi Mizushima e Sora Fujimori.",
            pv: 22, pvNex: 4, pe: 4, peNex: 3, san: 15, sanNex: 3,
            proficiencias: "Armas simples, bastões, naginatas de templo e proteções médias.",
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
            descricao: "Treinado para colocar o próprio corpo entre o perigo e aqueles que jurou proteger, o Guarda Imperial é a última linha de defesa de nobres, fortalezas e aliados em campo. Sua disciplina defensiva torna cada ataque contra seus protegidos uma tarefa quase impossível. Além de treinar o corpo para o combate direto, o combatente também aprende a liderar aliados em batalha e a manter seu equipamento sempre pronto para o confronto. Perícias treinadas: Luta e Fortitude, mais uma quantidade de perícias à sua escolha igual a 1 + Intelecto. Figuras conhecidas dessa vocação: Rin Takagawa, Aiko Hasekura e Emi Onodera.",
            pv: 26, pvNex: 5, pe: 2, peNex: 2, san: 12, sanNex: 3,
            proficiencias: "Armas simples, armas marciais e proteções pesadas de alta qualidade.",
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
            descricao: "O Duelista transformou o confronto individual em uma forma de arte, valorizando reflexos e precisão acima de força bruta. Cada troca de golpes é um diálogo silencioso entre lâminas, e ele raramente perde a última palavra. Além de treinar o corpo para o combate direto, o combatente também aprende a liderar aliados em batalha e a manter seu equipamento sempre pronto para o confronto. Perícias treinadas: Luta e Reflexos, mais uma quantidade de perícias à sua escolha igual a 1 + Intelecto. Figuras conhecidas dessa vocação: Akira Kanzaki, Masaru Tsukino e Sakura Takagawa.",
            pv: 21, pvNex: 4, pe: 4, peNex: 3, san: 12, sanNex: 3,
            proficiencias: "Espadas leves, armas simples e proteções leves que preservam a agilidade.",
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
            descricao: "Enquanto a maioria dos guerreiros treina para enfrentar outros humanos, o Caçador de Demônios prepara corpo e mente para lutar contra yokai, espíritos vingativos e horrores que desafiam a razão. Ele conhece as fraquezas do sobrenatural porque já perdeu companheiros aprendendo-as. Além de treinar o corpo para o combate direto, o combatente também aprende a liderar aliados em batalha e a manter seu equipamento sempre pronto para o confronto. Perícias treinadas: Luta e Ocultismo, mais uma quantidade de perícias à sua escolha igual a 1 + Intelecto. Figuras conhecidas dessa vocação: Ichiro Ryusaki, Haru Kuronuma e Toshi Sakaguchi.",
            pv: 24, pvNex: 5, pe: 3, peNex: 3, san: 14, sanNex: 3,
            proficiencias: "Armas simples, armas marciais e proteções médias, muitas vezes adornadas com símbolos de proteção.",
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
            descricao: "Treinado nas sombras desde jovem, o Shinobi domina infiltração, disfarce e o silêncio absoluto. Ele entra e sai de lugares que deveriam ser impenetráveis, e quando é notado, geralmente já é tarde demais para impedi-lo. Além de acumular conhecimento amplo sobre diversas áreas, o especialista também desenvolve uma versatilidade rara, sendo capaz de improvisar soluções onde ninguém mais consegue. Perícias treinadas: Furtividade e Reflexos, mais uma quantidade de perícias à sua escolha igual a 2 + Intelecto. Figuras conhecidas dessa vocação: Kotaro Hasekura, Kiyomi Kurogane e Tetsu Fujimori.",
            pv: 16, pvNex: 3, pe: 3, peNex: 3, san: 16, sanNex: 4,
            proficiencias: "Armas simples, ferramentas de infiltração e proteções leves que não comprometem o silêncio.",
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
            nome: "Espião", foco: "Enganação e investigação.",
            descricao: "O Espião constrói identidades falsas com a mesma facilidade que a maioria das pessoas conta a verdade. Vive entre segredos, sabendo exatamente quais perguntas fazer e quais respostas nunca revelar, mesmo sob pressão intensa. Além de acumular conhecimento amplo sobre diversas áreas, o especialista também desenvolve uma versatilidade rara, sendo capaz de improvisar soluções onde ninguém mais consegue. Perícias treinadas: Enganação e Investigação, mais uma quantidade de perícias à sua escolha igual a 2 + Intelecto. Figuras conhecidas dessa vocação: Ryo Shibata, Hiroshi Yagami e Haru Shibata.",
            pv: 16, pvNex: 3, pe: 3, peNex: 3, san: 16, sanNex: 4,
            proficiencias: "Armas simples e proteções leves que passam despercebidas.",
            habilidades: ["Eclético", "Perito", "Rede de Informações", "Identidade Falsa"],
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
            descricao: "Estudioso de presságios, espíritos e do equilíbrio entre os elementos, o Onmyoji interpreta sinais que a maioria ignora por completo. Seu conhecimento acadêmico do oculto o torna capaz de prever perigos antes que se manifestem plenamente. Além de acumular conhecimento amplo sobre diversas áreas, o especialista também desenvolve uma versatilidade rara, sendo capaz de improvisar soluções onde ninguém mais consegue. Perícias treinadas: Ocultismo e Vontade, mais uma quantidade de perícias à sua escolha igual a 2 + Intelecto. Figuras conhecidas dessa vocação: Susumu Takagawa, Rin Onodera e Hana Hasekura.",
            pv: 16, pvNex: 3, pe: 3, peNex: 3, san: 17, sanNex: 4,
            proficiencias: "Armas simples e proteções leves, priorizando liberdade de movimento para rituais.",
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
            descricao: "Treinado para manter aliados vivos mesmo nas piores circunstâncias, o Médico combina conhecimento técnico com uma calma cirúrgica diante do caos. Onde outros veem uma ferida fatal, ele vê um problema a ser resolvido com precisão. Além de acumular conhecimento amplo sobre diversas áreas, o especialista também desenvolve uma versatilidade rara, sendo capaz de improvisar soluções onde ninguém mais consegue. Perícias treinadas: Medicina e Intuição, mais uma quantidade de perícias à sua escolha igual a 2 + Intelecto. Figuras conhecidas dessa vocação: Daigo Hasekura, Aiko Kurogane e Goro Onodera.",
            pv: 17, pvNex: 3, pe: 4, peNex: 3, san: 16, sanNex: 4,
            proficiencias: "Armas simples e proteções leves que não atrapalhem procedimentos rápidos.",
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
            descricao: "Especialista em armas, ferramentas e reparos, o Ferreiro entende cada engrenagem e cada fio de uma lâmina como uma extensão de suas próprias mãos. Onde um equipamento falha, ele encontra uma solução antes que a situação piore. Além de acumular conhecimento amplo sobre diversas áreas, o especialista também desenvolve uma versatilidade rara, sendo capaz de improvisar soluções onde ninguém mais consegue. Perícias treinadas: Profissão e Tecnologia, mais uma quantidade de perícias à sua escolha igual a 2 + Intelecto. Figuras conhecidas dessa vocação: Emi Amano, Sakura Shibata e Daigo Tsukino.",
            pv: 18, pvNex: 3, pe: 3, peNex: 3, san: 15, sanNex: 3,
            proficiencias: "Martelos, ferramentas de forja e armas simples.",
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
            descricao: "O Inventor enxerga mecanismos e soluções onde outros só veem problemas. Movido por curiosidade incansável, transforma peças soltas e ideias estranhas em engenhocas que, de alguma forma, sempre funcionam quando mais importa. Além de acumular conhecimento amplo sobre diversas áreas, o especialista também desenvolve uma versatilidade rara, sendo capaz de improvisar soluções onde ninguém mais consegue. Perícias treinadas: Tecnologia e Investigação, mais uma quantidade de perícias à sua escolha igual a 2 + Intelecto. Figuras conhecidas dessa vocação: Ichiro Kuronuma, Yuto Mizushima e Jiro Kanzaki.",
            pv: 16, pvNex: 3, pe: 4, peNex: 3, san: 16, sanNex: 4,
            proficiencias: "Armas simples e ferramentas especializadas de sua própria criação.",
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
            descricao: "Especialista em alianças, política e influência, o Diplomata sabe que palavras bem escolhidas evitam guerras que a espada jamais venceria. Sua presença impõe respeito mesmo em salões hostis, e ele raramente sai de uma negociação com as mãos vazias. Além de acumular conhecimento amplo sobre diversas áreas, o especialista também desenvolve uma versatilidade rara, sendo capaz de improvisar soluções onde ninguém mais consegue. Perícias treinadas: Diplomacia e Intuição, mais uma quantidade de perícias à sua escolha igual a 2 + Intelecto. Figuras conhecidas dessa vocação: Yuto Kanzaki, Akira Mizushima e Haru Kurogane.",
            pv: 16, pvNex: 3, pe: 4, peNex: 3, san: 17, sanNex: 4,
            proficiencias: "Armas simples e proteções leves que não comprometem sua apresentação.",
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
            descricao: "Guardião de documentos e conhecimentos administrativos, o Escriba encontra informações onde ninguém mais procuraria. Sua memória meticulosa e paciência para vasculhar registros antigos já revelaram segredos que muitos preferiam manter enterrados. Além de acumular conhecimento amplo sobre diversas áreas, o especialista também desenvolve uma versatilidade rara, sendo capaz de improvisar soluções onde ninguém mais consegue. Perícias treinadas: Investigação e Ciências, mais uma quantidade de perícias à sua escolha igual a 2 + Intelecto. Figuras conhecidas dessa vocação: Ichiro Toyotomi Jr., Kotaro Mizushima e Nao Arakawa.",
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
            descricao: "Servindo em um santuário desde jovem, a Miko aprendeu danças, orações e rituais de purificação destinados a manter espíritos malignos afastados. Quando esses rituais deixaram de ser suficientes, ela precisou aprender a enfrentar diretamente aquilo que antes apenas mantinha à distância. Além de estudar o Outro Lado, o ocultista aprende a canalizar pequenas frações desse poder em rituais controlados, sempre ciente do preço que esse conhecimento cobra. Perícias treinadas: Religião e Vontade, mais uma quantidade de perícias à sua escolha igual a 1 + Intelecto. Figuras conhecidas dessa vocação: Rin Tsukino, Ren Onodera e Ren Shibata.",
            pv: 15, pvNex: 3, pe: 5, peNex: 4, san: 18, sanNex: 4,
            proficiencias: "Armas simples e instrumentos rituais, como sinos, leques e ofuda.",
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
            descricao: "O Yamabushi abandonou o conforto da vida em vilarejos para viver em retiro nas montanhas sagradas, submetendo o corpo a provações extremas em busca de poder espiritual. Esse ascetismo o deixou marcado por experiências que a maioria consideraria insanas — e perigosamente capaz de canalizar forças que não deveriam obedecer a um humano. Além de estudar o Outro Lado, o ocultista aprende a canalizar pequenas frações desse poder em rituais controlados, sempre ciente do preço que esse conhecimento cobra. Perícias treinadas: Fortitude e Vontade, mais uma quantidade de perícias à sua escolha igual a 1 + Intelecto. Figuras conhecidas dessa vocação: Masaru Kuronuma, Sakura Onodera e Masaru Toyotomi Jr.",
            pv: 17, pvNex: 3, pe: 5, peNex: 4, san: 15, sanNex: 3,
            proficiencias: "Armas simples, bastões rituais e proteções leves adaptadas a longas jornadas.",
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
            descricao: "Treinado especificamente para expulsar espíritos que tomaram corpos ou lugares à força, o Exorcista enfrenta possessões que a maioria dos religiosos comuns nem ousaria se aproximar. Ele já olhou nos olhos de algo que usava um rosto humano como máscara e sobreviveu para continuar fazendo isso. Além de estudar o Outro Lado, o ocultista aprende a canalizar pequenas frações desse poder em rituais controlados, sempre ciente do preço que esse conhecimento cobra. Perícias treinadas: Ocultismo e Religião, mais uma quantidade de perícias à sua escolha igual a 1 + Intelecto. Figuras conhecidas dessa vocação: Nozomi Toyotomi Jr., Rin Hasekura e Yuto Shirasu.",
            pv: 16, pvNex: 3, pe: 5, peNex: 4, san: 16, sanNex: 4,
            proficiencias: "Armas simples, adagas rituais e proteções leves reforçadas com símbolos de proteção.",
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
            descricao: "Vivendo à margem das grandes vilas, o Xamã aprendeu tradições antigas de comunicação com espíritos de rios, florestas e montanhas. Ele não vê o paranormal como algo a ser combatido por padrão, mas como uma força a ser respeitada, negociada e, quando necessário, apaziguada. Além de estudar o Outro Lado, o ocultista aprende a canalizar pequenas frações desse poder em rituais controlados, sempre ciente do preço que esse conhecimento cobra. Perícias treinadas: Ocultismo e Sobrevivência, mais uma quantidade de perícias à sua escolha igual a 1 + Intelecto. Figuras conhecidas dessa vocação: Yui Arakawa, Haru Kanzaki e Ren Amano.",
            pv: 16, pvNex: 3, pe: 5, peNex: 4, san: 17, sanNex: 4,
            proficiencias: "Armas simples e instrumentos rituais, como tambores e amuletos.",
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
            descricao: "Ao contrário do Onmyoji, que trata o oculto com tradição e ritual, o Estudioso do Vazio o encara como um campo de pesquisa perigoso e obsessivo. Ele devora textos proibidos e relatos descartados por outros acadêmicos, pagando o preço mental por um conhecimento que poucos deveriam buscar. Além de estudar o Outro Lado, o ocultista aprende a canalizar pequenas frações desse poder em rituais controlados, sempre ciente do preço que esse conhecimento cobra. Perícias treinadas: Ocultismo e Ciências, mais uma quantidade de perícias à sua escolha igual a 1 + Intelecto. Figuras conhecidas dessa vocação: Akira Kagemori, Emi Fujimori e Rin Ryusaki.",
            pv: 14, pvNex: 3, pe: 5, peNex: 4, san: 14, sanNex: 3,
            proficiencias: "Armas simples e proteções leves, priorizando liberdade para consultar anotações em pleno confronto.",
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
            descricao: "Rejeitado por templos formais por lidar com práticas consideradas profanas, o Necromante Ancestral aprendeu a se comunicar com os mortos e a negociar com espíritos que se recusam a partir. Caminha em um território moralmente incerto, onde cada resposta obtida dos mortos tem um preço. Além de estudar o Outro Lado, o ocultista aprende a canalizar pequenas frações desse poder em rituais controlados, sempre ciente do preço que esse conhecimento cobra. Perícias treinadas: Ocultismo e Vontade, mais uma quantidade de perícias à sua escolha igual a 1 + Intelecto. Figuras conhecidas dessa vocação: Emi Tsukino, Yui Onodera e Sakura Ibaraki.",
            pv: 15, pvNex: 3, pe: 6, peNex: 4, san: 13, sanNex: 3,
            proficiencias: "Armas simples e instrumentos rituais associados a cerimônias fúnebres.",
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
            descricao: "Descendente de uma linhagem responsável por manter selos antigos intactos, o Guardião de Selos dedica a vida a impedir que coisas que não deveriam voltar consigam atravessar. Ele conhece o peso literal de manter uma porta fechada quando algo do outro lado está sempre empurrando. Além de estudar o Outro Lado, o ocultista aprende a canalizar pequenas frações desse poder em rituais controlados, sempre ciente do preço que esse conhecimento cobra. Perícias treinadas: Ocultismo e Fortitude, mais uma quantidade de perícias à sua escolha igual a 1 + Intelecto. Figuras conhecidas dessa vocação: Goro Takagawa, Hiroshi Onodera e Sora Yagami.",
            pv: 17, pvNex: 4, pe: 5, peNex: 3, san: 15, sanNex: 3,
            proficiencias: "Armas simples e proteções médias reforçadas com talismãs de contenção.",
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
            descricao: "Lendo ossos, cartas ou os padrões da fumaça de incenso, o Adivinho enxerga fragmentos do que está por vir — nem sempre com clareza, e nem sempre com conforto. Ele aprendeu que prever o futuro é mais fácil do que convencer alguém a acreditar nele a tempo. Além de estudar o Outro Lado, o ocultista aprende a canalizar pequenas frações desse poder em rituais controlados, sempre ciente do preço que esse conhecimento cobra. Perícias treinadas: Ocultismo e Intuição, mais uma quantidade de perícias à sua escolha igual a 1 + Intelecto. Figuras conhecidas dessa vocação: Nozomi Amano, Hana Ibaraki e Masaru Onodera.",
            pv: 15, pvNex: 3, pe: 5, peNex: 4, san: 16, sanNex: 4,
            proficiencias: "Armas simples e instrumentos de adivinhação, como varetas, ossos e cartas rituais.",
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
        }
    ]
};

// ============================================================
// PROGRESSO
// ============================================================

function atualizarProgresso() {
    const barra = document.getElementById("barraProgresso");
    const texto = document.getElementById("textoProgresso");

    const totalEtapas = 7;

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
}

function selecionarOrigem(origem, elemento) {
    origemSelecionada = origem;

    document.querySelectorAll(".card-origem").forEach(card => {
        card.classList.remove("selecionada");
    });

    if (elemento) {
        elemento.classList.add("selecionada");
    }

    const detalhes = document.getElementById("detalhesOrigem");

    if (detalhes) {
        detalhes.innerHTML = `
            <h2>${origem.nome}</h2>

            <p class="descricao-origem">
                ${origem.descricao}
            </p>

            <h3>HABILIDADE DE ORIGEM</h3>

            <h4>${origem.habilidade.nome}</h4>

            <p>${origem.habilidade.descricao}</p>
        `;
    }

    atualizarCaracteristicas();
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
}

// ============================================================
// DETALHES DA CLASSE
// ============================================================

function mostrarDetalhesClasse(classe) {
    const detalhes = document.getElementById("detalhesClasse");

    if (!detalhes) return;

    const habilidadesHTML = classe.habilidades
        .map(habilidade => `<div class="habilidade-item"><h4>${habilidade}</h4></div>`)
        .join("");

    const temProgressao = Array.isArray(classe.progressao) && classe.progressao.length > 0;

    const progressaoHTML = temProgressao
        ? classe.progressao.map(progresso => `
            <tr>
                <td>${progresso.nex}%</td>
                <td>${progresso.habilidade}</td>
            </tr>
        `).join("")
        : "";

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

        ${temProgressao ? `
        <div class="classe-secao">
            <h3>PROGRESSÃO NEX</h3>

            <div class="tabela-wrapper">
                <table class="tabela-nex">
                    <thead>
                        <tr>
                            <th>NEX</th>
                            <th>HABILIDADE</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${progressaoHTML}
                    </tbody>
                </table>
            </div>
        </div>
        ` : ""}
    `;
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

    const pv = classeSelecionada.pv + atributos.vigor;
    const pe = classeSelecionada.pe + atributos.presenca;
    const san = classeSelecionada.san;

    painel.innerHTML = `
        <div class="titulo-caracteristicas">
            <h2>
                CARACTERÍSTICAS DE
                ${classeSelecionada.nome.toUpperCase()}
            </h2>
        </div>

        <div class="resumo-caracteristicas">

            <div class="caracteristica">
                <span>PONTOS DE VIDA</span>
                <strong>${pv}</strong>
                <small>
                    Base: ${classeSelecionada.pv}
                    + Vigor: ${atributos.vigor}
                </small>
            </div>

            <div class="caracteristica">
                <span>PONTOS DE ESFORÇO</span>
                <strong>${pe}</strong>
                <small>
                    Base: ${classeSelecionada.pe}
                    + Presença: ${atributos.presenca}
                </small>
            </div>

            <div class="caracteristica">
                <span>SANIDADE</span>
                <strong>${san}</strong>
                <small>Sanidade inicial da classe</small>
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
                        ${origemSelecionada.habilidade.nome}
                    </strong>
                </p>

                <p>
                    ${origemSelecionada.habilidade.descricao}
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
// OBTER PERSONAGEM
// ============================================================

function obterPersonagem() {
    const respostaEle = document.getElementById("respostaEle");

    return {
        personagem: document.getElementById("personagem")?.value || "Sem nome",
        jogador: document.getElementById("jogador")?.value || "Não informado",
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

        pv: classeSelecionada
            ? classeSelecionada.pv + atributos.vigor
            : 0,

        pe: classeSelecionada
            ? classeSelecionada.pe + atributos.presenca
            : 0,

        san: classeSelecionada
            ? classeSelecionada.san
            : 0,

        pericias: textoPericias(),

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

    document.getElementById("criador")?.classList.remove("ativa");
    document.getElementById("fichaFinal")?.classList.add("ativa");

    preencherFicha(personagem);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// ============================================================
// PREENCHER FICHA
// ============================================================

function preencherFicha(personagem) {
    const campos = {
        fichaNome: personagem.personagem,
        fichaPersonagem: personagem.personagem,
        fichaJogador: personagem.jogador,
        fichaOrigem: personagem.origem,
        fichaCategoria: personagem.categoria.toUpperCase(),
        fichaClasse: personagem.classe,
        fichaPV: personagem.pv,
        fichaPE: personagem.pe,
        fichaSAN: personagem.san,
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

    const pdf = new jsPDF();

    let y = 20;

    function verificarPagina(espaco = 15) {
        if (y + espaco > 280) {
            pdf.addPage();
            y = 20;
        }
    }

    function titulo(texto) {
        verificarPagina(15);

        pdf.setFontSize(16);
        pdf.text(texto, 15, y);

        y += 10;
    }

    function escrever(label, conteudo) {
        verificarPagina(20);

        pdf.setFontSize(11);

        const linhas = pdf.splitTextToSize(
            label ? `${label}: ${conteudo}` : String(conteudo),
            180
        );

        pdf.text(linhas, 15, y);

        y += linhas.length * 6 + 4;
    }

    pdf.setFontSize(22);

    pdf.text(
        "IMPÉRIO",
        105,
        y,
        { align: "center" }
    );

    y += 15;

    pdf.setFontSize(14);

    pdf.text(
        personagem.personagem,
        105,
        y,
        { align: "center" }
    );

    y += 20;

    titulo("IDENTIDADE");

    escrever("Personagem", personagem.personagem);
    escrever("Jogador", personagem.jogador);
    escrever("Origem", personagem.origem);

    titulo("CLASSE");

    escrever("Categoria", personagem.categoria);
    escrever("Classe", personagem.classe);

    titulo("CARACTERÍSTICAS");

    escrever("Pontos de Vida", personagem.pv);
    escrever("Pontos de Esforço", personagem.pe);
    escrever("Sanidade", personagem.san);

    titulo("ATRIBUTOS");

    escrever("Agilidade", personagem.atributos.agilidade);
    escrever("Força", personagem.atributos.forca);
    escrever("Intelecto", personagem.atributos.intelecto);
    escrever("Presença", personagem.atributos.presenca);
    escrever("Vigor", personagem.atributos.vigor);

    titulo("PERÍCIAS");
    escrever("", personagem.pericias);

    titulo("APARÊNCIA");
    escrever("", personagem.aparencia);

    titulo("PERSONALIDADE");
    escrever("", personagem.personalidade);

    titulo("HISTÓRICO");
    escrever("", personagem.historico);

    titulo("OBJETIVO");
    escrever("", personagem.objetivo);

    titulo("O PARANORMAL");
    escrever("Resposta", personagem.respostaParanormal);

    verificarPagina(20);

    pdf.setFontSize(9);

    pdf.text(
        "Ficha criada em: " + personagem.dataCriacao,
        15,
        y
    );

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

    const botaoCriarOutro = Array.from(
        ficha.querySelectorAll(":scope > button")
    ).find(botao => botao.textContent.includes("CRIAR OUTRO PERSONAGEM"));

    // Esconde os botões antes de capturar, para não aparecerem na imagem
    if (areaExportar) areaExportar.style.display = "none";
    if (botaoCriarOutro) botaoCriarOutro.style.display = "none";

    html2canvas(ficha, {
        backgroundColor: "#050505",
        scale: 2,
        useCORS: true
    }).then(canvas => {
        if (areaExportar) areaExportar.style.display = "";
        if (botaoCriarOutro) botaoCriarOutro.style.display = "";

        const personagem = obterPersonagem();

        const nomeArquivo = personagem.personagem
            .replace(/[\\/:*?"<>|]/g, "_")
            .replace(/\s+/g, "_");

        const link = document.createElement("a");
        link.download = `IMPERIO_${nomeArquivo}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();

    }).catch(erro => {
        if (areaExportar) areaExportar.style.display = "";
        if (botaoCriarOutro) botaoCriarOutro.style.display = "";

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

Classe: ${personagem.classe}
Origem: ${personagem.origem}

PV: ${personagem.pv}
PE: ${personagem.pe}
SAN: ${personagem.san}

Agilidade: ${personagem.atributos.agilidade}
Força: ${personagem.atributos.forca}
Intelecto: ${personagem.atributos.intelecto}
Presença: ${personagem.atributos.presenca}
Vigor: ${personagem.atributos.vigor}

Perícias: ${personagem.pericias}

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
    document.getElementById("fichaFinal")
        ?.classList.remove("ativa");

    document.getElementById("criador")
        ?.classList.add("ativa");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// ============================================================
// NAVEGAÇÃO E INICIALIZAÇÃO
// ============================================================

function criarPersonagem() {
    document.getElementById("inicio")?.classList.remove("ativa");
    document.getElementById("criador")?.classList.add("ativa");
    
    mudarEtapa(1);
    
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function mudarEtapa(novaEtapa) {
    if (novaEtapa < 1 || novaEtapa > 7) return;

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

    if (novaEtapa === 4) {
        mostrarOrigens();
    } else if (novaEtapa === 5) {
        mostrarPericias();
    } else if (novaEtapa === 6) {
        atualizarCaracteristicas();
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

document.addEventListener("DOMContentLoaded", () => {
    atualizarProgresso();
    atualizarEfeitosDeAtributo();
});
// Transição da Tela Inicial para o Criador
function criarPersonagem() {
    const telaInicio = document.getElementById("inicio");
    const telaCriador = document.getElementById("criador");

    if (telaInicio) telaInicio.classList.remove("ativa");
    if (telaCriador) telaCriador.classList.add("ativa");

    mudarEtapa(1);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}