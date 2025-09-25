# Instalação

---

## Sumário

- [Desenvolvimento confortável (PostgreSQL + TypeORM)](#desenvolvimento-confortável-postgresql--typeorm)
- [Execução rápida (PostgreSQL + TypeORM)](#execução-rápida-postgresql--typeorm)
- [Links](#links)

---

## Desenvolvimento confortável (PostgreSQL + TypeORM)

1. Clone o repositório

   ```bash
   git clone --depth 1 hhttps://github.com/uisam00/conectar-backend.git my-app
   ```

1. Entre na pasta e copie `env-example-development` como `.env`.

   ```bash
   cd my-app/
   cp env-example-development .env
   ```


1. Suba os containers adicionais:

   ```bash
   docker compose up -d postgres maildev
   ```

1. Instale as dependências

   ```bash
   npm install
   ```

1. Rode as migrações

   ```bash
   npm run migration:run
   ```

1. Rode os seeds

   ```bash
   npm run seed:run:relational
   ```

1. Rode a aplicação em modo dev

   ```bash
   npm run start:dev
   ```

1. Abra <http://localhost:3000/docs>


## Execução rápida (PostgreSQL + TypeORM)

Se quiser executar rapidamente a aplicação, use os comandos abaixo:

1. Clone o repositório

   ```bash
   git clone --depth 1 hhttps://github.com/uisam00/conectar-backend.git my-app
   ```

1. Entre na pasta e copie `env-example` como `.env`.

   ```bash
   cd my-app/
   cp env-example .env
   ```

1. Suba os containers

   ```bash
   docker compose up -d
   ```

1. Para verificar o status, rode

   ```bash
   docker compose logs
   ```

1. Abra <http://localhost:3000/docs>

---
## Links

- Swagger (documentação da API): <http://localhost:3000/docs>
- Adminer (cliente de DB): <http://localhost:8080>
- MongoDB Express (cliente de DB): <http://localhost:8081/>
- Maildev: <http://localhost:1080>

---

Anterior: [Introdução](introduction.md)

Próximo: [Arquitetura](architecture.md)
