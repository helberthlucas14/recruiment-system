# Recruitment System

Sistema de Recrutamento e Seleção com backend em Go e frontend em React. Permite:
- Cadastro e login de usuários (candidato e recrutador)
- CRUD de vagas e visualização detalhada
- Candidatura a vagas e gerenciamento de aplicações
- Dashboard com métricas básicas
- Documentação da API via Swagger

## Tecnologias e versões
- Backend: Go `1.22` (imagem Docker), módulo `go 1.24.0`
  - `gin-gonic/gin` `v1.11.0`
  - `gorm` `v1.31.1` + `gorm.io/driver/postgres` `v1.6.0`
  - `golang-jwt/jwt` `v5.3.0`
  - `swaggo` (`swag` `v1.8.12`, `gin-swagger` `v1.6.1`, `files` `v1.0.1`)
- Banco de dados: PostgreSQL `15-alpine`
- Frontend: Node.js `20`
  - React `19`, Vite `7`, TypeScript `~5.9.3`
  - MUI (`@mui/material` `7.3.6`), Emotion `11.14.x`
  - Axios `1.13.2`, React Router `7.10.1`
- Orquestração: Docker Compose `3.8`

## Como executar (Docker)
Pré-requisitos: `Docker` e `Docker Compose` instalados.

1. No diretório raiz do projeto, execute:
   - `docker compose up --build`
2. Aguardando inicialização, os serviços ficam disponíveis em:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:8081`
   - Swagger: `http://localhost:8081/swagger/index.html`
   - PostgreSQL: `localhost:5432`
3. Seed de dados:
   - O serviço `seed` cria uma conta recrutadora e popula 100 vagas
   - Usuário recrutador: `teste@empresa.com` / senha `123456`
   - Para reexecutar manualmente: `docker compose run --rm seed`

Ports e serviços (compose raiz):
- `backend`: container porta `8080` exposta em `localhost:8081`
- `frontend`: `5173`
- `db`: `5432`

Variáveis de ambiente (compose raiz):
- `PORT`, `JWT_SECRET`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSLMODE`

## Como executar (local, sem Docker)
### Banco de dados
- Suba um PostgreSQL local e crie o banco `recruitment`
- Crie um usuário e senha ou use os padrões abaixo

### Backend (Go)
1. Crie um arquivo `.env` na raiz com, por exemplo:
   ```env
   PORT=8080
   JWT_SECRET=secret_key_change_me
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=user
   DB_PASSWORD=password
   DB_NAME=recruitment
   DB_SSLMODE=disable
   ```
2. Execute o servidor:
   - `go run ./backend/cmd/api`
3. A documentação da API estará em:
   - `http://localhost:8080/swagger/index.html`

### Frontend (React + Vite)
1. Entre em `frontend/recruiment-system-web` e instale dependências:
   - `npm install`
2. Crie um `.env.development` com:
   - `VITE_API_URL=http://localhost:8080`
3. Execute em desenvolvimento:
   - `npm run dev`
4. Acesse:
   - `http://localhost:5173`

Scripts úteis (frontend):
- `npm run dev` — desenvolvimento
- `npm run build` — build de produção
- `npm run preview` — preview do build
- `npm run lint` — lint com ESLint `^9.39.1`

## Estrutura do projeto
- Backend (Go): `backend/`
  - Entrypoint API: `backend/cmd/api/main.go`
  - Seed: `backend/cmd/seed/main.go`
  - Config: `backend/internal/config/config.go`
  - Repositórios/UseCases/Handlers em `backend/internal/...`
  - Dockerfile: `backend/Dockerfile`
- Frontend (React): `frontend/recruiment-system-web/`
  - Código: `src/` (páginas em `presentation/pages/`)
  - Configuração Vite: `vite.config.ts`
  - Dockerfile: `frontend/recruiment-system-web/Dockerfile`
- Orquestração: `docker-compose.yml` (raiz)

Observações:
- Em produção, configure `JWT_SECRET` e credenciais do banco com valores seguros
- O `go.mod` declara `go 1.24.0`, mas a imagem Docker usa Go `1.22`; ambas funcionam neste projeto
