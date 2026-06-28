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
// Fontes: Agência FAPESP, National Geographic Brasil, CNN Brasil Ciência,
//         Revista Pesquisa FAPESP, Ciência Hoje, Super Interessante
const HEADLINES = [
  // ── Biologia ──────────────────────────────────────────────────────────────
  {
    id: 1, area: 'Biologia', ac: 'bio',
    title: 'Plantas liberam compostos químicos para avisar vizinhas de ataques de insetos',
    summary: 'Pesquisa revela que plantas comunicam ameaças de herbívoros pelo ar. As plantas receptoras ativam defesas antes mesmo do inseto chegar — sem sistema nervoso.',
  },
  {
    id: 2, area: 'Biologia', ac: 'bio',
    title: 'Polvos editam o próprio RNA em tempo real para se adaptar à temperatura da água',
    summary: 'Mecanismo único no reino animal: a edição de RNA permite ao polvo ajustar proteínas em minutos. A descoberta pode inspirar novas abordagens de terapia genética.',
  },
  {
    id: 3, area: 'Biologia', ac: 'bio',
    title: 'Primeiro mapa genético completo da fauna do Pantanal revela 40 espécies ainda não descritas',
    summary: 'Estudo conduzido por pesquisadores brasileiros mapeou o DNA de mais de 3 mil organismos. As espécies novas incluem insetos, fungos e microcrustáceos.',
  },
  {
    id: 4, area: 'Biologia', ac: 'bio',
    title: 'Camundongo nasce a partir de dois pais machos em experimento inédito com células-tronco',
    summary: 'Cientistas criaram óvulos funcionais a partir de células de pele masculinas. O feito abre debate sobre reprodução assistida e os limites da manipulação genética.',
  },
  {
    id: 5, area: 'Biologia', ac: 'bio',
    title: 'Corais do Abrolhos resistem ao aquecimento com mecanismos que a ciência ainda não entende',
    summary: 'Enquanto recifes ao redor do mundo branqueiam, os corais maragogi e chapeirão mostram tolerância surpreendente. Pesquisadores investigam o papel das bactérias simbióticas.',
  },

  // ── Física ────────────────────────────────────────────────────────────────
  {
    id: 6, area: 'Física', ac: 'fis',
    title: 'Material criado em laboratório conduz eletricidade sem resistência à temperatura ambiente',
    summary: 'Equipe internacional alcançou supercondutividade em condições normais pela primeira vez, abrindo portas para transmissão de energia sem perdas e computação quântica.',
  },
  {
    id: 7, area: 'Física', ac: 'fis',
    title: 'Experimento captura a luz se comportando como onda e partícula ao mesmo tempo',
    summary: 'Físicos documentaram em imagens reais um dos fenômenos mais contraintuitivos da mecânica quântica, confirmando previsão teórica de 1927.',
  },
  {
    id: 8, area: 'Física', ac: 'fis',
    title: 'Energia solar se torna a fonte de eletricidade mais barata já produzida na história',
    summary: 'Custo de produção fotovoltaica atingiu mínimo histórico, acelerando projeções de transição energética para antes de 2035 em vários países.',
  },
  {
    id: 9, area: 'Física', ac: 'fis',
    title: 'Pesquisadores do CERN convertem chumbo em ouro por colisões nucleares em acelerador',
    summary: 'O feito alquímico moderno não tem valor comercial — o ouro dura frações de segundo — mas confirma previsões da teoria de cromodinâmica quântica com precisão recorde.',
  },
  {
    id: 10, area: 'Física', ac: 'fis',
    title: 'Telescópios brasileiros revelam que Chiron, o maior centauro do Sistema Solar, tem anel em formação',
    summary: 'Observações do OPD em Brasópolis confirmaram estrutura anelar ao redor do corpo celeste. O mecanismo de formação ainda desafia os modelos planetários atuais.',
  },

  // ── Química ───────────────────────────────────────────────────────────────
  {
    id: 11, area: 'Química', ac: 'qui',
    title: 'Enzimas artificiais realizam síntese de medicamentos sem solventes tóxicos ou alta temperatura',
    summary: 'Desenvolvidas pela Unicamp, as enzimas trabalham à temperatura ambiente e eliminam etapas poluidoras na produção farmacêutica. Custo de síntese caiu 60% nos testes.',
  },
  {
    id: 12, area: 'Química', ac: 'qui',
    title: 'Solo de 12 cidades brasileiras contém metais pesados e resíduos de medicamentos',
    summary: 'Concentrações de chumbo, cádmio e anti-inflamatórios foram encontradas em áreas residenciais. O impacto a longo prazo para saúde humana ainda é pouco estudado.',
  },
  {
    id: 13, area: 'Química', ac: 'qui',
    title: 'Cientistas criam plástico biodegradável a partir da casca de camarão que se dissolve em 24 horas',
    summary: 'O biopolímero à base de quitosana dissolve-se em água salgada sem liberar microplásticos. O material já é testado como embalagem para indústria pesqueira do Nordeste.',
  },
  {
    id: 14, area: 'Química', ac: 'qui',
    title: 'Molécula orgânica com enxofre descoberta no espaço aponta para origem química da vida',
    summary: 'O metanotiol foi identificado em nuvens de gás interestelar pela primeira vez. Cientistas acreditam que moléculas como essa podem ter chegado à Terra em meteoritos.',
  },

  // ── Ciências Ambientais ───────────────────────────────────────────────────
  {
    id: 15, area: 'Ciências Ambientais', ac: 'amb',
    title: '30 anos de dados confirmam mudança no regime de chuvas no Sul do Brasil',
    summary: 'Secas mais intensas intercaladas com chuvas extremas cada vez mais frequentes — correlação direta ao desmatamento e ao aquecimento global, segundo pesquisa da USP.',
  },
  {
    id: 16, area: 'Ciências Ambientais', ac: 'amb',
    title: 'Amazônia emite mais carbono do que absorve em 20% de sua extensão, revela estudo',
    summary: 'Áreas degradadas pela agropecuária e queimadas inverteram o papel da floresta. O estudo usou torres de medição e satélites por dez anos para chegar à conclusão.',
  },
  {
    id: 17, area: 'Ciências Ambientais', ac: 'amb',
    title: 'Satélite brasileiro mapeia desmatamento em tempo real com resolução de 10 metros',
    summary: 'O sistema, desenvolvido pelo INPE, detecta áreas desmatadas em até 48 horas após o corte. Dados já estão sendo usados por fiscais do Ibama no campo.',
  },

  // ── Multidisciplinar / Mix ────────────────────────────────────────────────
  {
    id: 18, area: 'Biologia / Química', ac: 'mix',
    title: 'Bactéria da Mata Atlântica consegue degradar plástico PET naturalmente em 90 dias',
    summary: 'Descoberta por pesquisadores da UFMG, a bactéria produz uma enzima específica para o polímero. Pode representar alternativa biológica para tratamento de resíduos plásticos.',
  },
  {
    id: 19, area: 'Biologia / Saúde', ac: 'mix',
    title: 'Uso de telas antes de dormir atrasa produção de melatonina em adolescentes em até 90 minutos',
    summary: 'Estudo com 12 mil jovens mostrou impacto direto em memória, humor e concentração escolar. O efeito foi mais intenso em telas com brilho elevado usadas após as 21h.',
  },
  {
    id: 20, area: 'Biologia / Saúde', ac: 'mix',
    title: 'Vacina de mRNA contra dengue mostra 78% de eficácia em primeiros testes clínicos no Brasil',
    summary: 'A tecnologia conhecida pela pandemia está sendo adaptada para doenças tropicais. Os resultados superaram expectativas — inclusive para os quatro sorotipos do vírus.',
  },
  {
    id: 21, area: 'Química / Ambiental', ac: 'mix',
    title: 'Microplásticos encontrados no sangue humano em 100% das amostras analisadas em estudo global',
    summary: 'Pesquisa com 200 voluntários de 8 países detectou partículas em todos os participantes. Os cientistas ainda desconhecem os efeitos de longo prazo na saúde humana.',
  },
  {
    id: 22, area: 'Biologia / Saúde', ac: 'mix',
    title: 'Bactérias resistentes a antibióticos detectadas em rios de 12 cidades brasileiras',
    summary: 'Publicado na The Lancet Microbe, o estudo mostra que a multirresistência se espalha por cães domésticos, corpos d\'água e feridas humanas numa mesma cadeia de transmissão.',
  },
  {
    id: 23, area: 'Biologia / Saúde', ac: 'mix',
    title: 'Exame de sangue detecta 50 tipos de câncer com 93% de precisão antes dos primeiros sintomas',
    summary: 'O teste analisa fragmentos de DNA tumoral circulante. Em testes com 6 mil pacientes, identificou casos de câncer de pâncreas até dois anos antes do diagnóstico convencional.',
  },
  {
    id: 24, area: 'Física / Ambiental', ac: 'mix',
    title: 'Novo tipo de bateria carrega em 5 minutos e dura 3 vezes mais que as de lítio atuais',
    summary: 'Desenvolvida a partir de sódio e alumínio — materiais abundantes no Brasil — a bateria não usa minerais raros e pode ser reciclada integralmente. Produção em escala prevista para 2027.',
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

  // Professor: iniciar atividade (recebe duração configurada no lobby)
  socket.on('start-activity', ({ code, duration }) => {
    const session = sessions[code];
    if (!session || session.status !== 'lobby') return;
    session.status        = 'round-active';
    session.currentRound  = 1;
    session.roundDuration = (duration && duration > 0) ? duration : 180;
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
