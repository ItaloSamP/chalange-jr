# Backend — API de Clientes

API REST em **NestJS** com **Prisma** e **PostgreSQL**.

## Estrutura

```
src/
  modules/clients/
    clients.controller.ts   # Rotas REST (pronto)
    clients.service.ts      # Regras de negócio (TODO candidato)
    clients.repository.ts   # Acesso ao banco (pronto)
    dto/                    # Validação de entrada (pronto)
  prisma/
    prisma.service.ts       # Cliente Prisma global
prisma/
  schema.prisma             # Model Client + enum ClientStatus
```

## Setup

```bash
npm install
cp .env.example .env
# Configure DATABASE_URL
npx prisma migrate dev
npm run start:dev
```

## Variáveis de ambiente

| Variável       | Descrição                          | Padrão                 |
|----------------|------------------------------------|------------------------|
| `DATABASE_URL` | Connection string PostgreSQL       | —                      |
| `PORT`         | Porta da API                       | `3001`                 |
| `CORS_ORIGIN`  | Origem permitida (frontend)        | `http://localhost:3000`|

## Implementação pendente

Edite `src/modules/clients/clients.service.ts` e implemente os métodos marcados com `TODO`.

O repository já expõe: `create`, `findMany`, `findById`, `findByEmail`, `findByDocumento`, `update`, `softDelete`.

## Testes

```bash
npm run test
npm run test:e2e
```
