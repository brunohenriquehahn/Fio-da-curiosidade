# Fio da Curiosidade — CLAUDE.md

Esse arquivo é lido automaticamente pelo Claude Code no início de cada sessão.
Ele contém contexto pedagógico e técnico para que você possa ajudar bem.

---

## Contexto do projeto

**O que é:** ferramenta educacional interativa para o **Projeto Integrador de Ciências da Natureza** (Biologia, Física, Química) do Ensino Médio. Funciona como o Kahoot: o professor gera um código, os alunos entram pelo celular ou computador, e a atividade acontece em tempo real.

**Objetivo pedagógico:** estimular a formulação de perguntas científicas a partir de manchetes de divulgação científica. É a **etapa 1 do Projeto Integrador** — onde os alunos exploram temas e começam a construir sua pergunta-problema para o semestre.

**Quem usa:**
- Professor de Ciências da Natureza, ensino médio, Brasil
- Alunos de EM em grupos de até 5 (estrutura do Projeto Integrador)
- Contexto: sala de aula com Wi-Fi, cada aluno com celular ou computador

**Projeto Integrador — 5 etapas avaliativas:**
1. Definição do tema e da pergunta-problema ← *esta ferramenta apoia essa etapa*
2. Elaboração do pré-projeto
3. Produção do texto completo
4. Versão final (ABNT)
5. Apresentação pública (palestra ou estande)

---

## Arquitetura técnica

```
fio-da-curiosidade/
├── server.js        ← backend principal (Express + Socket.IO)
├── package.json
├── public/
│   └── index.html   ← frontend completo (React via CDN + Socket.IO client)
└── README.md
```

**Stack:**
- Node.js + Express (HTTP e arquivos estáticos)
- Socket.IO (WebSockets para sincronização em tempo real)
- React 18 (via CDN, sem build step — React.createElement direto, sem JSX)
- Sessões em memória RAM (sem banco de dados por enquanto)

**Como rodar:**
```bash
npm install
npm start
# Acessa em http://localhost:3000
```

**Para desenvolvimento com auto-restart:**
```bash
npx nodemon server.js
```

---

## Fluxo da aplicação

### Estados possíveis de uma sessão (`session.status`)
| Status | Descrição |
|--------|-----------|
| `lobby` | Aguardando alunos conectarem |
| `round-active` | Rodada em andamento — alunos formulando perguntas |
| `round-complete` | Resultados da rodada visíveis para todos |
| `done` | Atividade encerrada |

### Eventos Socket.IO (cliente → servidor)
| Evento | Quem emite | O que faz |
|--------|-----------|-----------|
| `join-session` | professor ou aluno | entra na sala |
| `start-activity` | professor | status: lobby → round-active, currentRound: 1 |
| `submit-answer` | aluno | adiciona resposta à sessão |
| `show-results` | professor | status: round-active → round-complete |
| `next-round` | professor | avança rodada ou encerra (status: done) |
| `add-demo-students` | professor | popula sessão com alunos simulados (teste) |
| `add-demo-answers` | professor | popula rodada com respostas simuladas (teste) |

**Broadcast:** todos os eventos resultam em `session-state` emitido para todos os clientes na sala (via `io.to(code).emit`).

### Estrutura de uma sessão em memória
```javascript
{
  code: 'ABC123',
  headlines: [...],      // 4 manchetes sorteadas do banco (HEADLINES em server.js)
  totalRounds: 4,
  currentRound: 0,
  status: 'lobby',
  students: [{ id, name, group, socketId }],
  answers: [{ id, studentName, group, round, headlineId, question, ts }],
  createdAt: '...',
}
```

---

## Frontend (public/index.html)

O frontend usa **React.createElement** diretamente (sem JSX, sem Babel, sem build).
Isso é intencional — o arquivo precisa funcionar sem compilação.

Ao editar o frontend, **nunca introduza JSX**. Use sempre:
```javascript
// CORRETO
React.createElement('div', { className: 'card' }, 'conteúdo')
e('div', { className: 'card' }, 'conteúdo')  // e = React.createElement (alias no topo)

// ERRADO — não funciona sem compilação
<div className="card">conteúdo</div>
```

**Estado do React no frontend:**
- `page`: `'home'` | `'session'`
- `tab`: `'teacher'` | `'student'` (aba ativa na nav)
- `tScreen`: tela atual do professor
- `sScreen`: tela atual do aluno
- `session`: objeto de sessão recebido do servidor via `session-state`
- `role` + `roleRef`: papel atual (`'teacher'` | `'student'`)

**Sincronização:** o listener `socket.on('session-state', ...)` recebe o estado completo e atualiza `session` + navega automaticamente para a tela correta baseado em `session.status`.

---

## Banco de manchetes (`HEADLINES` em server.js)

12 manchetes atualmente, cobrindo Biologia, Física, Química e Ciências Ambientais.
Cada sessão sorteia 4 delas aleatoriamente.

**Estrutura de uma manchete:**
```javascript
{
  id: 1,
  area: 'Biologia',    // texto exibido na tag
  ac: 'bio',           // chave da cor: 'bio' | 'fis' | 'qui' | 'amb' | 'mix'
  title: '...',
  summary: '...',
}
```

**Cores por área (no CSS do index.html):**
- `bio` → verde (`#D3F4E7 / #0A6B3A`)
- `fis` → roxo (`#E0D9FA / #3C2D8A`)
- `qui` → âmbar (`#FEF0C4 / #7A4800`)
- `amb` → azul (`#D4EDFA / #0B4F75`)
- `mix` → rosa (`#F5D9F0 / #6B2060`)

---

## Preferências do dono do projeto

- **Linguagem dos comentários e texto da UI:** português brasileiro
- **Estilo de código:** limpo, bem comentado em português, sem abreviações obscuras
- **Filosofia:** ferramenta durável e reutilizável — prefira soluções que possam ser evoluídas, não gambiarras rápidas
- **Frontend sem build step:** nunca adicionar Webpack, Vite, ou qualquer bundler — o HTML precisa funcionar como arquivo estático simples
- **Banco de dados:** ainda não tem. Ao adicionar persistência, preferir SQLite com `better-sqlite3` (simples, sem servidor separado) ou Supabase (se quiser real-time nativo)
- **Deploy target:** Railway ou Render (plano gratuito, fácil CI/CD via GitHub)

---

## Funcionalidades planejadas (backlog)

Essas features foram discutidas mas ainda não implementadas, em ordem de prioridade:

1. **Cronômetro por rodada** — timer visível pro aluno (ex: 3 minutos), configurável pelo professor ao criar a sessão
2. **Banco de manchetes editável** — painel do professor para adicionar/remover manchetes personalizadas por turma ou tema
3. **Persistência com SQLite** — salvar sessões passadas para consulta posterior; exportar histórico de turmas
4. **Critérios de avaliação de perguntas** — checklist simples: *é investigável? envolve CN? é original?*
5. **PWA** — tornar instalável no celular dos alunos (manifest + service worker)
6. **Número de rodadas configurável** — atualmente fixo em 4; deixar o professor escolher

---

## O que não mudar sem perguntar

- A lógica de sincronização via `session-state` broadcast (funciona, não mexer sem motivo)
- O `React.createElement` no frontend (sem JSX é intencional)
- O número de manchetes por sessão (4) — decisão pedagógica, não técnica
- O sistema de "alunos demo" e "respostas demo" — são necessários para demonstração em sala
