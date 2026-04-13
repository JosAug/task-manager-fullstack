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

- **Frontend:** http://localhost:5173  
- **API:** http://localhost:4000  
- **Swagger:** http://localhost:4000/api/docs  
- **Chat:** após entrar, use o botão flutuante **💬** (WebSocket na mesma origem em dev).

---

## Colocar online (deploy)

Padrão típico: **frontend estático** em um host e **Node (API + WebSockets)** em outro.

1. **Backend (Render, Railway, Fly.io, etc.)**  
   - Comando: `npm start` na pasta `server` (ou raiz apontando para `server`).  
   - Variáveis: `PORT` (muitos hosts definem sozinhos), `JWT_SECRET`, `CLIENT_ORIGIN` = URL **exata** do seu site (ex.: `https://meu-app.vercel.app`). Várias origens: separadas por **vírgula**.  
   - **WebSockets:** o chat usa **Socket.IO** em `/socket.io` no mesmo servidor da API — o plano do host precisa suportar WebSocket (evite só “serverless puro” sem WS).

2. **Frontend (Vercel, Netlify, Cloudflare Pages, etc.)**  
   - Build: `npm run build` dentro de `client`.  
   - Defina **`VITE_API_URL`** com a URL pública da API **sem barra no final** (ex.: `https://meu-api.onrender.com`). Isso vale no **momento do build**.  
   - Copie `client/.env.example` → `client/.env` (ou configure as variáveis no painel do host).

3. **SQLite em produção**  
   - Em disco efêmero (free tier) o arquivo pode **sumir** a cada deploy. Para algo estável, use volume persistente no host ou migre para **PostgreSQL** (recomendado além do estudo local).

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
