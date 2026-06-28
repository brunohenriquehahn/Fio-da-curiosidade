# Fio da Curiosidade

Atividade interativa de formulação de perguntas científicas, desenvolvida para o **Projeto Integrador de Ciências da Natureza** (Biologia, Física, Química).

Funciona como o Kahoot: o professor gera um código de sessão, os alunos entram pelo celular ou computador, e todos interagem em tempo real.

---

## Como usar

### Fluxo do professor

1. Acesse o site → clique em **Criar sessão**
2. Um código de 6 letras é gerado — projete na lousa ou envie pelo grupo da turma
3. Quando os alunos entrarem, clique **Iniciar atividade**
4. Para cada rodada: os alunos leem a manchete e formulam uma pergunta
5. Clique **Ver resultados** para exibir todas as perguntas para a turma discutir
6. Avance pelas 4 rodadas e, ao final, exporte as respostas em `.csv`

### Fluxo do aluno

1. Acesse o mesmo endereço → **Entrar com código**
2. Digite o código do professor, seu nome e o nome do grupo
3. Leia a manchete e escreva sua pergunta
4. Aguarde os colegas — na tela de resultados, toda a turma vê as perguntas de todos

---

## Instalação local (para testes)

### Requisitos
- [Node.js](https://nodejs.org) versão 18 ou superior
- Conexão de rede local (para que alunos acessem pelo celular)

### Passo a passo

```bash
# 1. Entre na pasta do projeto
cd fio-da-curiosidade

# 2. Instale as dependências
npm install

# 3. Inicie o servidor
npm start
```

Acesse em: **http://localhost:3000**

Para que alunos acessem pelo celular na mesma rede Wi-Fi, descubra o IP local da máquina:
- Windows: `ipconfig` no terminal → procure "Endereço IPv4"
- Linux/Mac: `ip a` ou `ifconfig`

O endereço será algo como `http://192.168.1.X:3000`

---

## Deploy em nuvem (para usar pela internet)

### Railway (recomendado — gratuito para uso leve)

1. Crie uma conta em [railway.app](https://railway.app)
2. Clique em **New Project → Deploy from GitHub**
3. Faça upload ou conecte o repositório deste projeto
4. O Railway detecta automaticamente o `package.json` e faz o deploy
5. Acesse a URL gerada (algo como `https://fio-da-curiosidade.up.railway.app`)

### Render (alternativa gratuita)

1. Crie uma conta em [render.com](https://render.com)
2. Novo serviço → **Web Service** → conecte o repositório
3. Build command: `npm install`
4. Start command: `npm start`
5. Free tier funciona para uso em sala de aula

---

## Estrutura do projeto

```
fio-da-curiosidade/
├── server.js          ← servidor Node.js (Express + Socket.IO)
├── package.json       ← dependências
├── public/
│   └── index.html     ← frontend completo (React via CDN)
└── README.md
```

---

## Arquitetura técnica

- **Backend**: Node.js + Express + Socket.IO
- **Persistência**: memória RAM (sessões duram até 8h ou até o servidor reiniciar)
- **Frontend**: React (sem compilador — carregado via CDN), Socket.IO client
- **Comunicação em tempo real**: WebSockets via Socket.IO

### Eventos Socket.IO

| Evento (cliente → servidor) | Descrição |
|---|---|
| `join-session` | Professor ou aluno entra na sala |
| `start-activity` | Professor inicia a atividade |
| `submit-answer` | Aluno envia pergunta |
| `show-results` | Professor exibe resultados da rodada |
| `next-round` | Professor avança para próxima rodada |
| `add-demo-students` | Adiciona alunos simulados (demo) |
| `add-demo-answers` | Adiciona respostas simuladas (demo) |

| Evento (servidor → cliente) | Descrição |
|---|---|
| `session-state` | Estado completo da sessão (broadcast para todos na sala) |
| `session-error` | Mensagem de erro (somente para o cliente que causou) |

---

## Próximos passos possíveis

- **Persistência com banco de dados**: adicionar SQLite ou PostgreSQL para salvar sessões entre reinicializações
- **Banco de manchetes editável**: painel do professor para cadastrar manchetes personalizadas por turma/tema
- **Limite de tempo por rodada**: cronômetro visível para alunos
- **Modo de avaliação**: critérios automáticos para classificar perguntas (investigável, envolve CN, etc.)
- **PWA**: tornar o app instalável no celular dos alunos
