# CodePlay API

Backend da plataforma CodePlay - uma plataforma de compartilhamento de vídeos educacionais de programação.

## Stack

- **Runtime**: Node.js 22
- **Framework**: Fastify 5
- **Banco de dados**: MongoDB 6.0 (ReplicaSet)
- **ORM**: Prisma 6
- **Validação**: Zod
- **Autenticação**: JWT + Bcrypt
- **Testes**: Vitest
- **Documentação API**: Swagger/Scalar
- **Linting**: Biome
- **Storage**: AWS S3

## Modelos

- **User**: Usuários (nome, email, username, role)
- **Video**: Vídeos com segment (Backend, Frontend, FullStack, AI, DataScience, DevOps)
- **Comment**: Comentários em vídeos
- **Like**: Likes em vídeos e comentários
- **Subscription**: Sistema de inscrição entre usuários

## Setup

### Requisitos

- Node.js 22+
- Docker & Docker Compose
- npm

### Instalação

```bash
# Instalar dependências
npm install

# Gerar cliente Prisma
npm run prisma:generate
```

### Variáveis de Ambiente

Copie `.env` e configure:

```env
PORT=3333
JWT_SECRET_KEY=sua_chave_secreta
DATABASE_URL=mongodb://localhost:27017/meu_banco?replicaSet=rs0
FRONTEND_URL=http://localhost:5173
AWS_REGION=us-east-2
AWS_S3_BUCKET=seu-bucket
AWS_ACCESS_KEY_ID=sua_chave
AWS_SECRET_ACCESS_KEY=seu_secret
```

## Desenvolvimento

### Iniciar MongoDB local

```bash
docker-compose up -d
```

Isso inicia:
- MongoDB 6.0 em `localhost:27017`
- Banco: `meu_banco`
- ReplicaSet: `rs0`

### Rodar servidor

```bash
npm run dev
```

Server roda em `http://localhost:3333`
Docs em `http://localhost:3333/docs`

### Popular com dados de teste

```bash
npm run seed
```

Cria 10 usuários, 20 vídeos, 50 comentários e ~200 likes.

## Testes

### Setup banco de teste

```bash
docker-compose -f docker-compose.test.yml up -d
```

Banco de teste isolado em `localhost:27018`

### Rodar testes

```bash
npm test                 # Rodar uma vez
npm run test:watch      # Watch mode
npm run test:coverage   # Com coverage
```

Os testes:
- Usam banco MongoDB isolado
- Limpam dados entre testes
- Testam casos de sucesso e erro
- Verificam validações e autorizações

### Estrutura de testes

```
tests/
├── user/              # Autenticação
├── comments/          # Comentários
├── likes/             # Likes
├── subscriptions/     # Inscrições
├── videos/            # Vídeos
└── routes/            # Rotas integradas
```

## Arquitetura

O projeto segue **Domain-Driven Design** com separação clara de responsabilidades:

```
src/
├── modules/           # Domínios independentes
│   ├── comments/
│   │   ├── application/    # Use cases
│   │   ├── domain/         # Entidades e interfaces
│   │   └── infrastructure/ # Implementação (Prisma)
│   ├── videos/
│   ├── users/
│   ├── likes/
│   └── subscriptions/
├── middleware/        # Auth, validação
├── hooks/            # Verificações JWT
├── errors/           # Tratamento de erros
├── lib/              # Prisma, mocks
└── server.ts         # Configuração Fastify
```

## Scripts

```bash
npm run dev                    # Desenvolvimento
npm run start                  # Produção
npm test                       # Testes
npm run test:watch            # Testes em watch
npm run test:coverage         # Coverage report
npm run seed                  # Seed dados
npm run lint                  # Lint com Biome
npm run format               # Format com Biome
```

## API Endpoints

### Autenticação

- `POST /auth/register` - Registrar novo usuário
- `POST /auth/login` - Login
- `GET /auth/user` - Dados do usuário autenticado

### Vídeos

- `POST /videos` - Criar vídeo
- `GET /videos` - Listar vídeos
- `GET /videos/:id` - Detalhes do vídeo
- `PUT /videos/:id` - Atualizar vídeo
- `DELETE /videos/:id` - Deletar vídeo

### Comentários

- `POST /videos/:videoId/comments` - Criar comentário
- `GET /videos/:videoId/comments` - Listar comentários
- `PUT /comments/:id` - Atualizar comentário
- `DELETE /comments/:id` - Deletar comentário

### Likes

- `POST /likes` - Dar like
- `DELETE /likes/:id` - Remover like

### Inscrições

- `POST /subscriptions` - Inscrever em usuário
- `GET /subscriptions/:userId` - Listar inscritos

## Troubleshooting

### MongoDB connection refused
```bash
# Verificar se container está rodando
docker ps | grep mongodb

# Reiniciar
docker-compose restart mongodb
```

### Seed falha
```bash
# Conectar ao MongoDB e limpar manualmente
docker-compose exec mongodb mongosh

# No mongosh:
> use meu_banco
> db.users.deleteMany({})
> db.videos.deleteMany({})
```

### Porta 27017 já está em uso
```bash
# Mudar porta no docker-compose.yml ou:
docker-compose down
# ou encontrar processo:
lsof -i :27017
```

## Contribuindo

1. Criar branch: `git checkout -b feature/nome`
2. Fazer commit: `git commit -m "feat: descrição"`
3. Push: `git push origin feature/nome`
4. Abrir PR

## Licença

MIT
