# Fluxo — Tarefas (fullstack)

App de tarefas com **React (Vite)**, **API REST (Express)**, **JWT**, validação (Zod), documentação **Swagger**, **chat em tempo real (Socket.IO)** e UI responsiva.

---

## Ambiente de desenvolvimento (não é stack de produção)

Este repositório está configurado para **rodar na sua máquina sem instalar servidor de banco**.

- O arquivo **`server/data/app.db`** é um **SQLite local**, gerado automaticamente.
- **Isso é intencional:** facilita estudo, portfólio e revisão de código (clone → `npm install` → `npm run dev`), sem Docker ou PostgreSQL obrigatório.
- **Não interprete como “o projeto só sabe SQLite”:** em produção o padrão seria um banco gerenciado (**PostgreSQL**, etc.), variáveis de ambiente, migrações versionadas, backup e políticas de segurança — a camada de dados seria trocada ou abstraída mantendo a mesma API.

Em resumo: **SQLite aqui = conveniência para dev**, não decisão arquitetural final.

---

## Como rodar

Na raiz do projeto:

```bash
npm install
npm install --prefix server
npm install --prefix client
```

Copie o exemplo de env da API (se ainda não existir):

```bash
# Windows (cmd)
copy server\.env.example server\.env
```

Suba API + frontend:

```bash
npm run dev
```

- **Frontend:** https://task-manager-fullstack-lovat.vercel.app/login
- **API:** https://task-manager-fullstack-wacf.onrender.com
- **Swagger:** http://localhost:4000/api/docs  
- **Chat:** após entrar, use o botão flutuante **💬** (WebSocket na mesma origem em dev).

---

## Colocar online (deploy)

Padrão típico: **frontend estático** em um host e **Node (API + WebSockets)** em outro.

1. **Backend (Render, Railway, Fly.io, etc.)**  
   - **Root directory:** `server`  
   - **Build:** `npm install`  
   - **Start:** `npm start`  
   - **Node:** 20+ (`server/package.json` → `engines`)  
   - **Variáveis obrigatórias em produção**  
     - `NODE_ENV=production` (muitos hosts já definem)  
     - `JWT_SECRET`: string **aleatória com 24+ caracteres** (o processo **não sobe** se estiver fraca ou igual ao exemplo do `.env.example`)  
     - `CLIENT_ORIGIN`: URL **exata** do front (ex.: `https://meu-app.vercel.app`). Várias origens: **vírgula**. Sem isso, CORS/Socket.IO ficam só em `http://localhost:5173`.  
   - **Opcionais:** `SQLITE_PATH` — caminho absoluto do `.db` (ex.: volume persistente `/data/app.db`); `HOST` (padrão `0.0.0.0`).  
   - **WebSockets:** Socket.IO em `/socket.io` no mesmo processo da API — use host com **WebSocket** (evite serverless HTTP “puro” sem WS).  
   - Na raiz há um **`render.yaml`** opcional (Blueprint no Render); ajuste nomes e crie `CLIENT_ORIGIN` no painel após o primeiro deploy.

2. **Frontend (Vercel, Netlify, Cloudflare Pages, etc.)**  
   - **Root:** `client`  
   - **Build:** `npm install && npm run build` (ou `npm ci` em CI)  
   - **Publish directory:** `client/dist`  
   - **`VITE_API_URL`:** URL pública da API **sem barra no final**, definida no **build** (variável de ambiente do painel ou `client/.env` antes do build). Na raiz: `npm run build:client` após configurar o env.  
   - **SPA:** `client/public/_redirects` (Netlify) e `client/vercel.json` (Vercel) enviam rotas do React para `index.html`.

3. **SQLite em produção**  
   - Em disco **efêmero** (free tier) o banco pode **zerar** a cada deploy/restart. Use **`SQLITE_PATH`** apontando para **volume persistente** no host ou migre para **PostgreSQL** (recomendado para dados estáveis).

---

## Estrutura

| Pasta     | Conteúdo                          |
|----------|------------------------------------|
| `client/` | React + Vite                       |
| `server/` | Express, JWT, SQLite (`data/`), Socket.IO (`/socket.io`) |

O arquivo `server/data/app.db` está no `.gitignore` (cada clone cria o próprio banco local).

---

## Chat (tempo real)

- Salas: um **lobby** global para todos os usuários autenticados (JWT no handshake `auth.token`).  
- Histórico: últimas mensagens ficam em **`chat_messages`** no SQLite (mesmo banco de dev).  
- Limite: **500 caracteres** por mensagem (validação no servidor).

## Próximos passos (evolução)

- Trocar persistência para **PostgreSQL** (ou outro SGBD) com pool de conexões, migrações (ex.: `node-pg-migrate`, Prisma, Drizzle) e `DATABASE_URL` em produção.
- Hardening: HTTPS, rate limit em REST e chat, moderação, secrets em vault/CI, logs e monitoramento.
