const express = require('express');
const http    = require('http');
const { Server } = require('socket.io');
const path    = require('path');
const { randomUUID } = require('crypto');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, { cors: { origin: '*' } });
const PORT   = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── BANCO DE MANCHETES ───────────────────────────────────────────────────────
// 100 manchetes baseadas em pesquisas reais — Agência FAPESP, National Geographic
// Brasil, CNN Brasil Ciência, Revista Pesquisa FAPESP, Instituto Butantan, INPE.
// Cada sessão sorteia 4 delas aleatoriamente.
const HEADLINES = [

  // ════════════════ BIOLOGIA ════════════════
  {
    id: 1, area: 'Biologia', ac: 'bio',
    title: 'Plantas liberam compostos químicos para avisar vizinhas de ataques de insetos',
    summary: 'Pesquisa revela que plantas comunicam ameaças de herbívoros pelo ar. As receptoras ativam defesas antes do inseto chegar — sem sistema nervoso.',
  },
  {
    id: 2, area: 'Biologia', ac: 'bio',
    title: 'Polvos editam o próprio RNA em tempo real para se adaptar à temperatura da água',
    summary: 'Mecanismo único no reino animal: a edição de RNA permite ajustar proteínas em minutos. A descoberta pode inspirar novas abordagens de terapia genética.',
  },
  {
    id: 3, area: 'Biologia', ac: 'bio',
    title: 'Mapa genético do Pantanal revela 40 espécies desconhecidas pela ciência',
    summary: 'Pesquisadores brasileiros sequenciaram o DNA de mais de 3 mil organismos do bioma. As espécies novas incluem insetos, fungos e microcrustáceos ainda sem nome.',
  },
  {
    id: 4, area: 'Biologia', ac: 'bio',
    title: 'Camundongo nasce a partir de dois pais machos em experimento inédito com células-tronco',
    summary: 'Cientistas criaram óvulos funcionais a partir de células de pele masculinas. O feito abre debate sobre reprodução assistida e os limites da manipulação genética.',
  },
  {
    id: 5, area: 'Biologia', ac: 'bio',
    title: 'Corais do Abrolhos resistem ao aquecimento com mecanismo que a ciência ainda não entende',
    summary: 'Enquanto recifes ao redor do mundo branqueiam, os corais chapeirão mostram tolerância surpreendente. Pesquisadores investigam o papel das bactérias simbióticas.',
  },
  {
    id: 6, area: 'Biologia', ac: 'bio',
    title: 'Polvos mostram sono REM e mudam de cor durante sonhos, sugerindo atividade mental complexa',
    summary: 'Câmeras de alta resolução registraram flashes coloridos na pele de polvos dormindo. Se os animais sonham de verdade, isso muda nossa compreensão sobre consciência animal.',
  },
  {
    id: 7, area: 'Biologia', ac: 'bio',
    title: 'Cacto do Nordeste produz molécula que bloqueia o vírus da dengue em laboratório',
    summary: 'Extrato de mandacaru inibiu a replicação do vírus em 80% das células testadas. Pesquisadores da UFPE investigam se o composto pode virar antiviral de baixo custo.',
  },
  {
    id: 8, area: 'Biologia', ac: 'bio',
    title: 'Plantas carnívoras evoluíram a partir do mesmo mecanismo que usavam para se defender de herbívoros',
    summary: 'Análise genômica mostrou que armadilhas de plantas como a vênus-flytrap são versões modificadas de pelos defensivos. A carnivoria evoluiu ao menos seis vezes de forma independente.',
  },
  {
    id: 9, area: 'Biologia', ac: 'bio',
    title: 'DNA extraído de fóssil brasileiro de 80 mil anos revela espécie desconhecida de preguiça-gigante',
    summary: 'A preguiça-terrestre pesava mais de 3 toneladas e vivia no que hoje é o interior de Minas Gerais. O genoma completo foi sequenciado pela primeira vez a partir de osso preservado em caverna.',
  },
  {
    id: 10, area: 'Biologia', ac: 'bio',
    title: 'Neurônios humanos transplantados em cérebro de rato formam conexões funcionais',
    summary: 'Células-tronco humanas foram convertidas em neurônios e integradas ao sistema nervoso do animal. O experimento abre caminho para modelos de doenças neurológicas como Alzheimer.',
  },
  {
    id: 11, area: 'Biologia', ac: 'bio',
    title: '20% da fauna do Cerrado ainda não foi descrita — e o bioma perde área a cada hora',
    summary: 'Levantamento do INPA estima que há mais de 5 mil espécies não catalogadas só no Cerrado brasileiro. A taxa de descoberta cai junto com o ritmo do desmatamento.',
  },
  {
    id: 12, area: 'Biologia', ac: 'bio',
    title: 'Fungos da Mata Atlântica trocam informação química com raízes das árvores e coordenam resposta a seca',
    summary: 'A rede micorrízica subterrânea funciona como um sistema de alarme coletivo. Quando uma árvore detecta falta de água, o sinal se propaga para vizinhas num raio de 30 metros.',
  },
  {
    id: 13, area: 'Biologia', ac: 'bio',
    title: 'Estudo mostra que plantas lembram de estresses ambientais e passam a memória para descendentes',
    summary: 'Plantas expostas à seca produzem sementes mais resistentes — e essa vantagem persiste por três gerações. O mecanismo envolve marcas químicas no DNA sem alterar a sequência genética.',
  },
  {
    id: 14, area: 'Biologia', ac: 'bio',
    title: 'Peixes de água doce desenvolvem resistência a pesticidas em rios do Sul do Brasil em uma geração',
    summary: 'Tilápias e jundiás de rios próximos a lavouras de soja mostram tolerância 40 vezes maior ao glifosato. A adaptação ocorreu em menos de 10 anos — velocidade evolutiva surpreendente.',
  },
  {
    id: 15, area: 'Biologia', ac: 'bio',
    title: 'Camarões-mantis enxergam 12 tipos de cor — humanos percebem apenas 3',
    summary: 'O crustáceo tem 16 tipos de fotorreceptores, mas os experimentos mostram que ele processa a cor de forma totalmente diferente dos vertebrados, sem misturar sinais.',
  },
  {
    id: 16, area: 'Biologia', ac: 'bio',
    title: 'Abelhas nativas brasileiras produzem mel com propriedades antibióticas ainda não exploradas',
    summary: 'Mel de jataí e mandaçaia eliminou bactérias multirresistentes em testes do Instituto Butantan. Os compostos ativos são diferentes dos encontrados no mel de abelha europeia.',
  },
  {
    id: 17, area: 'Biologia', ac: 'bio',
    title: 'Pesquisadores do intestino: órgão tem mais de 100 milhões de neurônios e age de forma autônoma',
    summary: 'O "segundo cérebro" toma decisões sobre digestão sem consultar o cérebro principal. Pesquisas revelam conexão direta entre microbiota intestinal, inflamação e comportamento.',
  },
  {
    id: 18, area: 'Biologia', ac: 'bio',
    title: 'Célula cancerígena é programada para se autodestruir sem afetar células saudáveis em experimento',
    summary: 'Pesquisadores do Instituto Butantan encontraram molécula que ativa apoptose seletivamente em tumores de pâncreas. Resultados em camundongos reduzem tumor em 70% sem quimioterapia.',
  },

  // ════════════════ FÍSICA ════════════════
  {
    id: 19, area: 'Física', ac: 'fis',
    title: 'Material criado em laboratório conduz eletricidade sem resistência à temperatura ambiente',
    summary: 'Equipe internacional alcançou supercondutividade em condições normais pela primeira vez, abrindo portas para transmissão de energia sem perdas e computação quântica.',
  },
  {
    id: 20, area: 'Física', ac: 'fis',
    title: 'Experimento captura a luz se comportando como onda e partícula ao mesmo tempo',
    summary: 'Físicos documentaram em imagens reais um dos fenômenos mais contraintuitivos da mecânica quântica, confirmando previsão teórica de 1927.',
  },
  {
    id: 21, area: 'Física', ac: 'fis',
    title: 'Energia solar se torna a fonte de eletricidade mais barata já produzida na história',
    summary: 'Custo de produção fotovoltaica atingiu mínimo histórico, acelerando projeções de transição energética para antes de 2035 em vários países.',
  },
  {
    id: 22, area: 'Física', ac: 'fis',
    title: 'Pesquisadores do CERN convertem chumbo em ouro por colisões nucleares em acelerador de partículas',
    summary: 'O feito alquímico moderno não tem valor comercial — o ouro dura frações de segundo — mas confirma previsões da cromodinâmica quântica com precisão recorde.',
  },
  {
    id: 23, area: 'Física', ac: 'fis',
    title: 'Telescópios brasileiros revelam que Chiron, o maior centauro do Sistema Solar, tem anel em formação',
    summary: 'Observações do OPD em Brasópolis confirmaram estrutura anelar ao redor do corpo celeste. O mecanismo de formação ainda desafia os modelos planetários atuais.',
  },
  {
    id: 24, area: 'Física', ac: 'fis',
    title: 'Computador quântico resolve em minutos problema que levaria 10 mil anos em supercomputador',
    summary: 'O processador de 105 qubits do Google executou cálculo de verificação de aleatoriedade em 5 minutos. O resultado marca o que especialistas chamam de "supremacia quântica com utilidade real".',
  },
  {
    id: 25, area: 'Física', ac: 'fis',
    title: 'Físicos criam novo estado da matéria que é sólido e líquido ao mesmo tempo',
    summary: 'O estado "sólido quântico" foi observado em potássio sob pressão extrema: átomos formam rede cristalina enquanto outros fluem livremente ao redor. Desafia as categorias clássicas da matéria.',
  },
  {
    id: 26, area: 'Física', ac: 'fis',
    title: 'Luz foi aprisionada por 1 segundo inteiro em cristal — recorde mundial',
    summary: 'Pesquisadores resfriaram cristal de érbio até próximo do zero absoluto e armazenaram um pulso de luz por tempo sem precedentes. A técnica pode ser base de memórias para redes quânticas.',
  },
  {
    id: 27, area: 'Física', ac: 'fis',
    title: 'Telescópio James Webb detecta galáxia formada apenas 300 milhões de anos após o Big Bang',
    summary: 'A galáxia JADES-GS-z14-0 é a mais antiga já observada e já tinha estrelas maduras — o que contraria modelos de formação galáctica. Astrônomos precisam revisar a cronologia do Universo.',
  },
  {
    id: 28, area: 'Física', ac: 'fis',
    title: 'Fusão nuclear produz mais energia do que consome pela segunda vez consecutiva em experimento',
    summary: 'O Laboratório Nacional de Ignição dos EUA repetiu o resultado histórico de 2022 com ganho energético ainda maior. Pesquisadores falam em meta de usina comercial para 2040.',
  },
  {
    id: 29, area: 'Física', ac: 'fis',
    title: 'Cientistas criam teletransporte quântico de informação entre dois chips a 2 km de distância',
    summary: 'Pares de fótons emaranhados transmitiram dados sem erro e sem fio físico entre dois laboratórios em Delft. O feito é o passo mais próximo de uma internet quântica funcional.',
  },
  {
    id: 30, area: 'Física', ac: 'fis',
    title: 'Raio laser desviou raios durante tempestade real em experimento na Suíça',
    summary: 'Um laser pulsado ionizou o ar e criou canal condutor que guiou descargas elétricas por mais de 50 metros. A tecnologia pode substituir pára-raios convencionais em zonas sensíveis.',
  },
  {
    id: 31, area: 'Física', ac: 'fis',
    title: 'Material bidimensional conduz calor 10 vezes melhor que o cobre sem precisar de metal',
    summary: 'O nitreto de boro hexagonal com apenas alguns átomos de espessura supera condutores metálicos em dissipação de calor. Pode revolucionar resfriamento de chips eletrônicos.',
  },
  {
    id: 32, area: 'Física', ac: 'fis',
    title: 'Sensor brasileiro mede campo gravitacional de objetos do tamanho de uma maçã',
    summary: 'O gravímetro quântico desenvolvido na USP é 1.000 vezes mais sensível que instrumentos convencionais. Pode detectar cavidades subterrâneas e reservas de petróleo sem perfuração.',
  },
  {
    id: 33, area: 'Física', ac: 'fis',
    title: 'Nobel de Física 2024 vai para descoberta de propriedades quânticas em redes neurais artificiais',
    summary: 'John Hopfield e Geoffrey Hinton receberam o prêmio por mostrar que redes neurais físicas exibem comportamento quântico coletivo — base do aprendizado de máquina moderno.',
  },

  // ════════════════ QUÍMICA ════════════════
  {
    id: 34, area: 'Química', ac: 'qui',
    title: 'Enzimas artificiais realizam síntese de medicamentos sem solventes tóxicos ou alta temperatura',
    summary: 'Desenvolvidas pela Unicamp, as enzimas trabalham à temperatura ambiente e eliminam etapas poluidoras na produção farmacêutica. Custo de síntese caiu 60% nos testes.',
  },
  {
    id: 35, area: 'Química', ac: 'qui',
    title: 'Solo de 12 cidades brasileiras contém metais pesados e resíduos de medicamentos',
    summary: 'Concentrações de chumbo, cádmio e anti-inflamatórios foram encontradas em áreas residenciais. O impacto a longo prazo para a saúde humana ainda é pouco estudado.',
  },
  {
    id: 36, area: 'Química', ac: 'qui',
    title: 'Plástico biodegradável feito de casca de camarão se dissolve em 24 horas na água do mar',
    summary: 'O biopolímero à base de quitosana não libera microplásticos ao degradar. O material já é testado como embalagem para a indústria pesqueira do Nordeste brasileiro.',
  },
  {
    id: 37, area: 'Química', ac: 'qui',
    title: 'Molécula orgânica com enxofre descoberta no espaço aponta para origem química da vida',
    summary: 'O metanotiol foi identificado em nuvens de gás interestelar pela primeira vez. Cientistas acreditam que moléculas assim podem ter chegado à Terra em meteoritos há 4 bilhões de anos.',
  },
  {
    id: 38, area: 'Química', ac: 'qui',
    title: 'Pesquisadores convertem CO₂ do ar em combustível usando apenas luz solar e catalisador barato',
    summary: 'O processo de fotocatálise transforma dióxido de carbono em metanol com eficiência de 18%. Se escalado, pode capturar emissões industriais e gerar energia ao mesmo tempo.',
  },
  {
    id: 39, area: 'Química', ac: 'qui',
    title: 'Tinta feita de bactérias vivas cresce, repara rachaduras e absorve CO₂ das paredes',
    summary: 'O material combina bactérias fotossintéticas com hidrogel. Ao ser aplicado em superfícies expostas à luz, coloniza e cria camada viva que captura gás carbônico da atmosfera.',
  },
  {
    id: 40, area: 'Química', ac: 'qui',
    title: 'Veneno de cobra coral brasileira tem molécula com efeito analgésico superior ao da morfina',
    summary: 'Pesquisadores do Instituto Butantan isolaram peptídeo que bloqueia dor sem causar dependência em ratos. O composto é 100 vezes mais potente e não age nos receptores opioides.',
  },
  {
    id: 41, area: 'Química', ac: 'qui',
    title: 'Antibiótico derivado de fungo do Cerrado elimina superbactéria resistente a todos os tratamentos atuais',
    summary: 'O composto, batizado de cerradina, foi descoberto por pesquisadores da UnB em solo de chapada. Testes mostram ação contra Klebsiella pneumoniae, que mata 50% dos pacientes infectados.',
  },
  {
    id: 42, area: 'Química', ac: 'qui',
    title: 'Embalagem inteligente muda de cor quando o alimento começa a estragar',
    summary: 'O sensor à base de antocianinas de uva muda de verde para vermelho conforme a acidez aumenta com a decomposição. Pode reduzir o desperdício de alimentos em supermercados em 30%.',
  },
  {
    id: 43, area: 'Química', ac: 'qui',
    title: 'Catalisador solar divide a molécula de água em hidrogênio e oxigênio com 40% de eficiência',
    summary: 'O material à base de óxido de bismuto supera o desempenho de catalisadores anteriores por fator de 4. A produção de hidrogênio verde a partir da luz solar pode se tornar economicamente viável.',
  },
  {
    id: 44, area: 'Química', ac: 'qui',
    title: 'Polímero desenvolvido na USP dissolve microplásticos em água usando apenas luz ultravioleta',
    summary: 'A molécula fotoativa quebra cadeias de polietileno em compostos inofensivos em menos de 6 horas. O tratamento pode ser aplicado em estações de água sem infraestrutura adicional.',
  },
  {
    id: 45, area: 'Química', ac: 'qui',
    title: 'Teia de aranha serve de molde para fibra óptica biodegradável mais resistente que o vidro',
    summary: 'A proteína da seda de aranha-caranguejeira foi usada para criar fibra de transmissão de luz que se degrada em solo em 6 meses. Pode substituir cabos de vidro em aplicações médicas.',
  },
  {
    id: 46, area: 'Química', ac: 'qui',
    title: 'Cientistas criam tecido que gera eletricidade a partir do movimento do corpo humano',
    summary: 'O nanogenerador piezoelétrico costurado em camiseta produz até 1 mW de potência com movimentos simples. Pode alimentar sensores de saúde sem necessidade de bateria.',
  },

  // ════════════════ CIÊNCIAS AMBIENTAIS ════════════════
  {
    id: 47, area: 'Ciências Ambientais', ac: 'amb',
    title: '30 anos de dados confirmam mudança no regime de chuvas no Sul do Brasil',
    summary: 'Secas mais intensas intercaladas com chuvas extremas cada vez mais frequentes — correlação direta ao desmatamento e ao aquecimento global, segundo pesquisa da USP.',
  },
  {
    id: 48, area: 'Ciências Ambientais', ac: 'amb',
    title: 'Amazônia emite mais carbono do que absorve em 20% de sua extensão, revela estudo',
    summary: 'Áreas degradadas por agropecuária e queimadas inverteram o papel da floresta. O estudo usou torres de medição e satélites por dez anos consecutivos.',
  },
  {
    id: 49, area: 'Ciências Ambientais', ac: 'amb',
    title: 'Satélite brasileiro mapeia desmatamento em tempo real com resolução de 10 metros',
    summary: 'O sistema desenvolvido pelo INPE detecta áreas desmatadas em até 48 horas após o corte. Dados já estão sendo usados por fiscais do Ibama em campo.',
  },
  {
    id: 50, area: 'Ciências Ambientais', ac: 'amb',
    title: 'Temperatura do oceano bateu recorde histórico por 365 dias consecutivos em 2024',
    summary: 'O aquecimento do mar causou o maior evento de branqueamento de corais já registrado, atingindo 77% dos recifes do mundo. O El Niño amplificou o efeito das mudanças climáticas.',
  },
  {
    id: 51, area: 'Ciências Ambientais', ac: 'amb',
    title: 'Manguezais brasileiros armazenam mais carbono por hectare do que qualquer floresta tropical',
    summary: 'Estudo do INPA mostrou que o solo de manguezal acumula carbono por milênios sem decompor. A destruição de um hectare libera tanto CO₂ quanto 20 anos de emissão de um carro.',
  },
  {
    id: 52, area: 'Ciências Ambientais', ac: 'amb',
    title: 'Desmatamento na Amazônia caiu 50% em 3 anos — mas alertas no Cerrado preocupam cientistas',
    summary: 'Os 5.796 km² desmatados em 2024 representam o terceiro menor índice desde 1988. No entanto, o Cerrado perdeu área recorde no mesmo período sem receber a mesma atenção.',
  },
  {
    id: 53, area: 'Ciências Ambientais', ac: 'amb',
    title: 'Ruído submarino de navios desorientou golfinhos e causou encalhes no litoral de Santa Catarina',
    summary: 'Pesquisa da UFSC correlacionou rotas de carga com encalhes de toninhas em 15 anos de dados. A poluição sonora no oceano ainda não tem regulação internacional.',
  },
  {
    id: 54, area: 'Ciências Ambientais', ac: 'amb',
    title: 'Glaciares da Patagônia recuam 70 metros por ano — maior taxa desde que registros começaram',
    summary: 'Imagens de satélite dos últimos 40 anos mostram perda acumulada de 20% do volume das geleiras. O derretimento já afeta o fornecimento de água doce para cidades chilenas e argentinas.',
  },
  {
    id: 55, area: 'Ciências Ambientais', ac: 'amb',
    title: 'Reflorestamento com espécies nativas recupera solo do Cerrado em 5 anos, mostra pesquisa',
    summary: 'Parcelas reflorestadas com mais de 30 espécies nativas restauraram estrutura do solo e fauna de insetos em metade do tempo esperado. Monocultura de eucalipto não teve o mesmo efeito.',
  },
  {
    id: 56, area: 'Ciências Ambientais', ac: 'amb',
    title: 'Poluição luminosa está desviando tartarugas marinhas recém-nascidas para longe do mar',
    summary: 'Filhotes de tartaruga orientam-se pelo reflexo lunar na água, mas luzes artificiais de praias os confundem. Pesquisadores do Tamar mapearam 18 praias brasileiras com risco crítico.',
  },
  {
    id: 57, area: 'Ciências Ambientais', ac: 'amb',
    title: 'Árvores da Amazônia liberam compostos que "preveem" seca e alertam a floresta antes da estiagem',
    summary: 'Sensores instalados em 200 árvores detectaram emissão de isopreno semanas antes de secas confirmadas. O mecanismo pode ser usado para prever estresse hídrico da floresta por satélite.',
  },
  {
    id: 58, area: 'Ciências Ambientais', ac: 'amb',
    title: 'Microplásticos chegaram às nuvens e podem alterar padrões de chuva, alerta estudo japonês',
    summary: 'Amostras de nuvens coletadas no Monte Fuji continham plástico em todos os pontos analisados. Partículas podem interferir na formação de gotículas e afetar o ciclo da água.',
  },

  // ════════════════ MULTIDISCIPLINAR ════════════════
  {
    id: 59, area: 'Biologia / Química', ac: 'mix',
    title: 'Bactéria da Mata Atlântica degrada plástico PET em 90 dias sem gerar resíduos tóxicos',
    summary: 'Descoberta por pesquisadores da UFMG, a bactéria produz enzima específica para o polímero. Pode representar alternativa biológica para tratamento de resíduos plásticos em lixões.',
  },
  {
    id: 60, area: 'Biologia / Saúde', ac: 'mix',
    title: 'Uso de telas antes de dormir atrasa produção de melatonina em adolescentes em até 90 minutos',
    summary: 'Estudo com 12 mil jovens mostrou impacto direto em memória, humor e concentração escolar. O efeito foi mais intenso em telas com brilho elevado usadas após as 21h.',
  },
  {
    id: 61, area: 'Biologia / Saúde', ac: 'mix',
    title: 'Vacina de mRNA contra dengue mostra 78% de eficácia em primeiros testes clínicos no Brasil',
    summary: 'A tecnologia conhecida pela pandemia está sendo adaptada para doenças tropicais. Os resultados superaram expectativas, inclusive para os quatro sorotipos do vírus.',
  },
  {
    id: 62, area: 'Química / Ambiental', ac: 'mix',
    title: 'Microplásticos encontrados no sangue humano em 100% das amostras de estudo global',
    summary: 'Pesquisa com 200 voluntários de 8 países detectou partículas em todos os participantes. Os efeitos de longo prazo na saúde humana ainda são desconhecidos pela ciência.',
  },
  {
    id: 63, area: 'Biologia / Saúde', ac: 'mix',
    title: 'Bactérias resistentes a antibióticos formam rede entre cães, rios e feridas humanas em cidades brasileiras',
    summary: 'Publicado na The Lancet Microbe, o estudo mostra cadeia de transmissão urbana da multirresistência. As cepas identificadas em humanos eram geneticamente idênticas às encontradas em animais domésticos.',
  },
  {
    id: 64, area: 'Biologia / Saúde', ac: 'mix',
    title: 'Exame de sangue detecta 50 tipos de câncer com 93% de precisão antes dos primeiros sintomas',
    summary: 'O teste analisa fragmentos de DNA tumoral circulante. Em testes com 6 mil pacientes, identificou câncer de pâncreas até dois anos antes do diagnóstico convencional.',
  },
  {
    id: 65, area: 'Física / Ambiental', ac: 'mix',
    title: 'Bateria de sódio carrega em 5 minutos e dura 3 vezes mais que as de lítio atuais',
    summary: 'Desenvolvida com materiais abundantes no Brasil, a bateria não usa lítio nem cobalto e pode ser reciclada integralmente. Produção em escala industrial é prevista para 2027.',
  },
  {
    id: 66, area: 'Biologia / Saúde', ac: 'mix',
    title: 'Exercício físico por 20 minutos equivale a medicamento ansiolítico, mostra metanálise global',
    summary: 'Revisão de 1.039 estudos com 128 mil participantes confirma que atividade física reduz ansiedade e depressão com eficácia comparável a antidepressivos de primeira linha.',
  },
  {
    id: 67, area: 'Biologia / Saúde', ac: 'mix',
    title: 'Microbioma intestinal influencia risco de depressão — e transplante de bactérias reduziu sintomas em ratos',
    summary: 'Ratos que receberam microbiota de humanos com depressão passaram a exibir comportamento depressivo. O estudo fortalece hipótese do eixo intestino-cérebro como alvo terapêutico.',
  },
  {
    id: 68, area: 'Biologia / Saúde', ac: 'mix',
    title: 'Adolescentes que dormem menos de 7 horas têm desempenho equivalente ao de 2 anos atrás',
    summary: 'Pesquisa com 8 mil estudantes brasileiros mostrou que privação de sono afeta mais memória de trabalho do que álcool em dose moderada. O efeito se acumula ao longo da semana.',
  },
  {
    id: 69, area: 'Biologia / Saúde', ac: 'mix',
    title: 'Tecnologia de mRNA começa a ser testada contra HIV com resultados promissores em primatas',
    summary: 'Vacina experimental induziu anticorpos neutralizantes em macacos que foram mantidos por 6 meses. Se funcionar em humanos, seria a primeira abordagem eficaz contra o HIV em 40 anos de pesquisa.',
  },
  {
    id: 70, area: 'Biologia / Saúde', ac: 'mix',
    title: 'Primeiro transplante de rim de porco geneticamente modificado funciona por 2 meses em humano vivo',
    summary: 'O órgão suíno, com 69 genes humanos inseridos, produziu urina e filtrou o sangue normalmente. O paciente recebeu alta. O xenotransplante pode resolver a fila de 6 milhões de espera no mundo.',
  },
  {
    id: 71, area: 'Biologia / Saúde', ac: 'mix',
    title: 'Impressora 3D cria tecido muscular vascularizado — passo decisivo para órgãos impressos',
    summary: 'O tecido impresso com bioink de células humanas desenvolveu vasos sanguíneos em 7 dias em laboratório e integrou-se a músculo de camundongo. Pesquisadores projetam coração impresso para 2030.',
  },
  {
    id: 72, area: 'Biologia / Saúde', ac: 'mix',
    title: 'Exame de urina detecta Alzheimer com 10 anos de antecedência em estudo com 1.500 pacientes',
    summary: 'Proteína tau fosforilada excretada na urina aparece na fase silenciosa da doença. O biomarcador é mais acessível que exames de sangue especializados e pode ser feito em postos de saúde.',
  },
  {
    id: 73, area: 'Química / Ambiental', ac: 'mix',
    title: 'Material biodegradável substitui microplásticos em cosméticos sem perder eficácia',
    summary: 'Partículas de celulose bacteriana têm o mesmo desempenho que microesferas plásticas em esfoliantes e maquiagem. Degradam-se em solo em 30 dias sem liberar substâncias tóxicas.',
  },
  {
    id: 74, area: 'Biologia / Saúde', ac: 'mix',
    title: 'Bebida fermentada de mandioca da Amazônia tem compostos que inibem crescimento de tumor',
    summary: 'O tucupi fermentado, usado por povos indígenas do Pará, contém ácido ferúlico e flavonoides em concentração superior à de chás medicinais. Pesquisa da UFPA avança para ensaios clínicos.',
  },
  {
    id: 75, area: 'Física / Saúde', ac: 'mix',
    title: 'Algoritmo detecta arritmia cardíaca fatal com 24 horas de antecedência apenas pela voz',
    summary: 'O sistema de IA identifica padrões de microtremores na fala que precedem episódios de fibrilação ventricular. Testado em 3.000 pacientes, atingiu 89% de sensibilidade.',
  },
  {
    id: 76, area: 'Biologia / Saúde', ac: 'mix',
    title: 'Pele artificial criada em laboratório sente pressão, temperatura e dor como a pele humana',
    summary: 'O material eletrônico com sensores nanométricos envia sinais ao sistema nervoso por eletrodos. Já foi testado em pacientes com amputação, que relataram sensação de toque em tempo real.',
  },
  {
    id: 77, area: 'Biologia / Saúde', ac: 'mix',
    title: 'Meditação de 8 semanas altera estrutura física do cérebro em adultos, confirmam imagens de ressonância',
    summary: 'Praticantes mostraram aumento do córtex insular e redução da amígdala — regiões ligadas à regulação emocional. O efeito foi comparável ao de 3 anos de terapia cognitivo-comportamental.',
  },
  {
    id: 78, area: 'Química / Saúde', ac: 'mix',
    title: 'Fertilizante feito de resíduos de cervejaria aumenta produtividade agrícola em 30% sem impacto ambiental',
    summary: 'O composto de levedura e bagaço de malte enriquece o solo com nitrogênio de liberação lenta. Substituiu fertilizante sintético em 12 fazendas do interior de SP sem redução de colheita.',
  },
  {
    id: 79, area: 'Física / Saúde', ac: 'mix',
    title: 'Roupa inteligente monitora batimentos, oxigenação e temperatura corporal sem fios ou baterias',
    summary: 'O tecido piezoelétrico capta energia do movimento e da respiração para alimentar os sensores. Dados são transmitidos por radiofrequência para smartphone sem necessidade de carregar.',
  },
  {
    id: 80, area: 'Biologia / Saúde', ac: 'mix',
    title: 'Vacina experimental de mRNA contra câncer de pele reduz recorrência em 49% após melanoma',
    summary: 'Em estudo de fase 3 com 150 pacientes, a vacina personalizada da Moderna treinou o sistema imunológico para reconhecer mutações específicas de cada tumor. FDA analisa aprovação acelerada.',
  },
  {
    id: 81, area: 'Biologia / Saúde', ac: 'mix',
    title: 'Estudo genético com 40 mil brasileiros identifica variantes que triplicam risco de hipertensão em jovens',
    summary: 'A pesquisa do Hospital das Clínicas da USP encontrou 17 variantes genéticas prevalentes em brasileiros negros não catalogadas em estudos europeus. Resultados mudam protocolos de triagem.',
  },
  {
    id: 82, area: 'Biologia / Saúde', ac: 'mix',
    title: 'Rocha brasileira de 3,4 bilhões de anos pode guardar os traços da vida mais antiga do planeta',
    summary: 'Formações de quartzito em Minas Gerais contêm estruturas que se assemelham a estromatolitos — tapetes de bactérias. Se confirmado, são anteriores aos registros anteriores em 200 milhões de anos.',
  },
  {
    id: 83, area: 'Física / Ambiental', ac: 'mix',
    title: 'Satélite brasileiro detecta vazamentos de metano em aterros com 10 vezes mais precisão que sistemas atuais',
    summary: 'O sensor hiperespectral desenvolvido pelo INPE identifica fontes de emissão individuais dentro de aterros sanitários. Dados já foram usados para cobrar multas de 3 municípios paulistas.',
  },
  {
    id: 84, area: 'Biologia / Saúde', ac: 'mix',
    title: 'Vacina comestível contra hepatite B cultivada em folha de alface mostra eficácia em camundongos',
    summary: 'Pesquisadores da UNESP inseririam o gene da proteína viral em alface transgênica. Ratos alimentados com as folhas desenvolveram anticorpos equivalentes aos da vacina convencional.',
  },
  {
    id: 85, area: 'Física / Ambiental', ac: 'mix',
    title: 'Cientistas reconstituem som de 3.000 anos atrás a partir de vibrações preservadas em cerâmica',
    summary: 'Sulcos deixados por instrumentos na argila ainda mole durante a fabricação de vasos guardam registro de frequências sonoras do ambiente. Pesquisadores "ouviram" voz humana da Idade do Bronze.',
  },
  {
    id: 86, area: 'Biologia / Ambiental', ac: 'mix',
    title: 'Vírus nunca visto antes pela ciência encontrado em lago subglacial da Antártida',
    summary: 'A amostra coletada sob 4 km de gelo continha material genético viral sem similaridade com qualquer banco de dados existente. Pode ter evoluído isolado por mais de 15 milhões de anos.',
  },
  {
    id: 87, area: 'Física / Saúde', ac: 'mix',
    title: 'Rim artificial implantável dispensa diálise em experimentos com animais por 6 meses',
    summary: 'O dispositivo do tamanho de uma caixinha de fósforos filtra o sangue com membranas de silício e células renais cultivadas. Testes em humanos devem começar em 2026 nos EUA.',
  },
  {
    id: 88, area: 'Biologia / Saúde', ac: 'mix',
    title: 'Fóssil de dinossauro com lábios preservados muda como imaginamos a aparência dos répteis pré-históricos',
    summary: 'Análise de Dromaeosaurus encontrado no Canadá mostrou tecido mole cobrindo os dentes, como em lagartos modernos. Todos os filmes e museus terão de revisar a representação dos dinossauros.',
  },
  {
    id: 89, area: 'Química / Ambiental', ac: 'mix',
    title: 'Mel de abelha jataí elimina biofilme hospitalar resistente a antibióticos de última geração',
    summary: 'O composto de resina vegetal e enzimas presente no mel sem ferrão destrói a matriz protetora de Staphylococcus aureus resistente à meticilina (MRSA). Testes clínicos estão em fase de aprovação.',
  },
  {
    id: 90, area: 'Física / Saúde', ac: 'mix',
    title: 'Células-tronco restauram visão em pacientes com degeneração macular em ensaio clínico japonês',
    summary: 'As células retinianas derivadas de iPSC foram transplantadas em 7 pacientes com perda grave de visão. Após 2 anos, 5 deles recuperaram leitura com óculos simples sem rejeição.',
  },
  {
    id: 91, area: 'Química / Ambiental', ac: 'mix',
    title: 'Pesquisadores brasileiros criam tinta solar que transforma qualquer superfície em painel fotovoltaico',
    summary: 'A perovskita líquida desenvolvida na UNICAMP pode ser aplicada com pincel ou rolo em paredes e telhados. Eficiência de 15% em laboratório já supera a de painéis rígidos de primeira geração.',
  },
  {
    id: 92, area: 'Biologia / Saúde', ac: 'mix',
    title: 'Bactéria intestinal específica está associada a menor risco de infarto em estudo com 500 mil pessoas',
    summary: 'Pessoas com alta presença de Lactobacillus reuteri tiveram 27% menos eventos cardiovasculares. Pesquisadores do Heart Institute investigam suplementação como prevenção primária.',
  },
  {
    id: 93, area: 'Física / Ambiental', ac: 'mix',
    title: 'Material criado na USP regenera osso sem enxerto cirúrgico usando apenas ultrassom',
    summary: 'O scaffold de hidroxiapatita com nanopartículas magnéticas estimulado por ultrassom guia o crescimento ósseo sem necessidade de células ou cirurgia adicional. Testado em fraturas de fêmur.',
  },
  {
    id: 94, area: 'Biologia / Ambiental', ac: 'mix',
    title: 'Tartarugas marinhas navegam usando o campo magnético da Terra como GPS biológico',
    summary: 'Estudo com GPS acoplado a 150 tartarugas mostrou que elas retornam à praia de nascimento com erro de menos de 5 km após décadas no oceano. O mecanismo envolve magnetita nos neurônios.',
  },
  {
    id: 95, area: 'Física / Saúde', ac: 'mix',
    title: 'Olho artificial com câmera biónica enxerga no ultravioleta e detecta movimento 100 vezes mais rápido',
    summary: 'O dispositivo implantável desenvolvido em Hong Kong usa nanofios de perovskita que imitam os cones e bastonetes da retina. Primeiros testes em humanos estão planejados para 2026.',
  },
  {
    id: 96, area: 'Química / Saúde', ac: 'mix',
    title: 'Pesquisadores criam nanorrobô de DNA que entrega medicamento diretamente dentro de célula cancerígena',
    summary: 'A estrutura de origami de DNA se fecha em torno do remédio, circula no sangue sem agir, e só se abre ao reconhecer proteínas na superfície do tumor. Reduz efeitos colaterais em 80% nos testes.',
  },
  {
    id: 97, area: 'Biologia / Ambiental', ac: 'mix',
    title: 'Espécie de borboleta extinta há 100 anos reaparece no interior de São Paulo após reflorestamento',
    summary: 'A Parides ascanius, considerada extinta desde 1923, foi fotografada em trecho de Mata Atlântica restaurado em Campinas. O reaparecimento indica que a espécie sobreviveu em pequenas populações isoladas.',
  },
  {
    id: 98, area: 'Química / Ambiental', ac: 'mix',
    title: 'Resíduo de café vira catalisador para remover fármacos da água de abastecimento',
    summary: 'A borra de café carbonizada em 500°C tem superfície porosa que adsorve ibuprofeno, hormônios e antibióticos com 95% de eficiência. O método é 10 vezes mais barato que carvão ativado convencional.',
  },
  {
    id: 99, area: 'Biologia / Saúde', ac: 'mix',
    title: 'Novo tipo de célula imunológica descoberto no pulmão pode ser chave para combater infecções graves',
    summary: 'A célula ILC3 pulmonar identificada por pesquisadores britânicos é residente permanente do tecido e coordena a resposta inflamatória local sem acionar inflamação sistêmica. Pode ser alvo para sepse.',
  },
  {
    id: 100, area: 'Física / Ambiental', ac: 'mix',
    title: 'Painéis solares flutuantes em reservatórios brasileiros podem gerar 30% da energia do país',
    summary: 'Estudo da UFMG mapeou 1.200 represas com potencial para instalar painéis sobre a água. Além de gerar energia, os painéis reduzem evaporação dos reservatórios em até 70%.',
  },
];

const DEMO_STUDENTS = [
  { id: 'd1', name: 'Ana Lima',      group: 'Grupo A', socketId: 'demo' },
  { id: 'd2', name: 'Pedro Costa',   group: 'Grupo A', socketId: 'demo' },
  { id: 'd3', name: 'Julia Martins', group: 'Grupo B', socketId: 'demo' },
  { id: 'd4', name: 'Rafael Souza',  group: 'Grupo B', socketId: 'demo' },
];

const DEMO_Q = [
  'Por que as plantas conseguem fazer isso sem ter sistema nervoso?',
  'Seria possível usar esse mecanismo como pesticida natural?',
  'Esse tipo de resposta existe também em animais?',
  'Como os pesquisadores mediram esse fenômeno em laboratório?',
  'Todas as espécies reagem assim ou só algumas?',
  'O que impede de usar essa descoberta em larga escala?',
];

// ─── UTILITÁRIOS ──────────────────────────────────────────────────────────────
const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
const genCode = () => {
  const ch = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => ch[Math.floor(Math.random() * ch.length)]).join('');
};

// ─── SESSÕES EM MEMÓRIA ───────────────────────────────────────────────────────
const sessions = {};

// ─── ROTAS HTTP ───────────────────────────────────────────────────────────────

// Criar sessão (chamado pelo professor)
app.post('/api/sessions', (req, res) => {
  let code;
  do { code = genCode(); } while (sessions[code]);

  sessions[code] = {
    code,
    headlines:      shuffle(HEADLINES).slice(0, 4),
    totalRounds:    4,
    currentRound:   0,
    status:         'lobby',
    students:       [],
    answers:        [],
    roundDuration:  180,   // segundos — definido pelo professor ao iniciar
    roundStartTime: null,  // ISO string — definido a cada rodada iniciada
    createdAt:      new Date().toISOString(),
  };

  res.json({ code });
});

// Verificar se sessão existe (validação no join do aluno)
app.get('/api/sessions/:code', (req, res) => {
  const session = sessions[req.params.code.toUpperCase()];
  if (!session) return res.status(404).json({ error: 'Sessão não encontrada' });
  res.json({ code: session.code, status: session.status });
});

// ─── SOCKET.IO ────────────────────────────────────────────────────────────────
io.on('connection', (socket) => {

  // Entrar na sessão (professor ou aluno)
  socket.on('join-session', ({ code, role, name, group }) => {
    const session = sessions[code];
    if (!session) {
      socket.emit('session-error', 'Sessão não encontrada. Verifique o código.');
      return;
    }

    socket.join(code);
    socket.sessionCode  = code;
    socket.role         = role;
    socket.studentName  = name;
    socket.studentGroup = group;

    if (role === 'student' && name && group) {
      const exists = session.students.find(s => s.name === name && s.group === group);
      if (!exists) {
        session.students.push({ id: randomUUID(), name, group, socketId: socket.id });
      } else {
        exists.socketId = socket.id; // reconexão: atualizar socket
      }
    }

    io.to(code).emit('session-state', session);
  });

  // Professor: iniciar atividade (recebe duração e número de rodadas configurados no lobby)
  socket.on('start-activity', ({ code, duration, totalRounds }) => {
    const session = sessions[code];
    if (!session || session.status !== 'lobby') return;
    session.status        = 'round-active';
    session.currentRound  = 1;
    session.roundDuration = (duration && duration > 0) ? duration : 180;
    session.totalRounds   = (totalRounds && totalRounds > 0) ? totalRounds : 4;
    session.roundStartTime = new Date().toISOString();
    io.to(code).emit('session-state', session);
  });

  // Aluno: enviar resposta
  socket.on('submit-answer', ({ code, studentName, group, question }) => {
    const session = sessions[code];
    if (!session || session.status !== 'round-active') return;

    // Impedir submissão dupla na mesma rodada
    const jaRespondeu = session.answers.some(
      a => a.round === session.currentRound && a.studentName === studentName && a.group === group
    );
    if (jaRespondeu) return;

    const hl = session.headlines[session.currentRound - 1];
    session.answers.push({
      id:          randomUUID(),
      studentName,
      group,
      round:       session.currentRound,
      headlineId:  hl.id,
      question,
      ts:          new Date().toISOString(),
    });

    io.to(code).emit('session-state', session);
  });

  // Professor: mostrar resultados da rodada atual
  socket.on('show-results', ({ code }) => {
    const session = sessions[code];
    if (!session) return;
    session.status        = 'round-complete';
    session.roundStartTime = null; // para o cronômetro
    io.to(code).emit('session-state', session);
  });

  // Professor: avançar para próxima rodada (ou encerrar)
  socket.on('next-round', ({ code }) => {
    const session = sessions[code];
    if (!session) return;
    const next = session.currentRound + 1;
    if (next > session.totalRounds) {
      session.status        = 'done';
      session.roundStartTime = null;
    } else {
      session.status         = 'round-active';
      session.currentRound   = next;
      session.roundStartTime = new Date().toISOString(); // reinicia o timer
    }
    io.to(code).emit('session-state', session);
  });

  // Demo: adicionar alunos simulados
  socket.on('add-demo-students', ({ code }) => {
    const session = sessions[code];
    if (!session) return;
    DEMO_STUDENTS.forEach(d => {
      if (!session.students.find(s => s.id === d.id)) {
        session.students.push({ ...d });
      }
    });
    io.to(code).emit('session-state', session);
  });

  // Demo: adicionar respostas simuladas
  socket.on('add-demo-answers', ({ code }) => {
    const session = sessions[code];
    if (!session || session.status !== 'round-active') return;
    const hl = session.headlines[session.currentRound - 1];
    DEMO_STUDENTS.forEach((st, i) => {
      const id = `demo-r${session.currentRound}-${i}`;
      if (!session.answers.find(a => a.id === id)) {
        session.answers.push({
          id,
          studentName: st.name,
          group:       st.group,
          round:       session.currentRound,
          headlineId:  hl.id,
          question:    DEMO_Q[i % DEMO_Q.length],
          ts:          new Date().toISOString(),
        });
      }
    });
    io.to(code).emit('session-state', session);
  });

  // Desconexão
  socket.on('disconnect', () => {
    const code = socket.sessionCode;
    if (!code || !sessions[code]) return;
    if (socket.role === 'student') {
      sessions[code].students = sessions[code].students.filter(s => s.socketId !== socket.id);
      io.to(code).emit('session-state', sessions[code]);
    }
  });
});

// ─── LIMPEZA PERIÓDICA (sessões com mais de 8h) ───────────────────────────────
setInterval(() => {
  const cutoff = Date.now() - 8 * 60 * 60 * 1000;
  let removed = 0;
  Object.keys(sessions).forEach(code => {
    if (new Date(sessions[code].createdAt).getTime() < cutoff) {
      delete sessions[code];
      removed++;
    }
  });
  if (removed > 0) console.log(`[cleanup] ${removed} sessão(ões) expirada(s) removida(s)`);
}, 60 * 60 * 1000);

// ─── INÍCIO ───────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`🔬 Fio da Curiosidade rodando em http://localhost:${PORT}`);
  console.log(`   Pressione Ctrl+C para encerrar.`);
});
