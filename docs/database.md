# Banco de Dados

## Sumário <!-- omit in toc -->

- [Sobre bancos de dados](#sobre-bancos-de-dados)
- [Trabalhando com schema (TypeORM)](#trabalhando-com-schema-typeorm)
  - [Gerar migração](#gerar-migração)
  - [Rodar migração](#rodar-migração)
  - [Reverter migração](#reverter-migração)
  - [Dropar todas as tabelas](#dropar-todas-as-tabelas)
- [Seeding (TypeORM)](#seeding-typeorm)
  - [Rodar seed (TypeORM)](#rodar-seed-typeorm)
- [Otimização de performance (PostgreSQL + TypeORM)](#otimização-de-performance-postgresql--typeorm)
  - [Índices e Chaves Estrangeiras](#índices-e-chaves-estrangeiras)
  - [Máximo de conexões](#máximo-de-conexões)
- [Trocar PostgreSQL por MySQL](#trocar-postgresql-por-mysql)

---

## Sobre bancos de dados

O projeto utiliza PostgreSQL com TypeORM para persistência de dados.

Para suporte ao banco de dados, é usada a [Arquitetura Hexagonal](architecture.md#hexagonal-architecture).
> Pode ser adicionado outras implementações de banco de dados, ex: MongoDB.

## Trabalhando com schema (TypeORM)

### Gerar migração

1. Crie a entidade com extensão `.entity.ts`. Ex.: `post.entity.ts`:

   ```ts
   // /src/posts/infrastructure/persistence/relational/entities/post.entity.ts

   import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
   import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';

   @Entity()
   export class Post extends EntityRelationalHelper {
     @PrimaryGeneratedColumn()
     id: number;

     @Column()
     title: string;

     @Column()
     body: string;

     // Campos adicionais conforme necessário
   }
   ```

1. Gere o arquivo de migração:

   ```bash
   npm run migration:generate -- src/database/migrations/CreatePostTable
   ```

1. Aplique a migração ao banco via [npm run migration:run](#rodar-migração).

### Rodar migração

```bash
npm run migration:run
```

### Reverter migração

```bash
npm run migration:revert
```

### Dropar todas as tabelas

```bash
npm run schema:drop
```

---

## Seeding (TypeORM)

### Rodar seed (TypeORM)

```bash
npm run seed:run:relational
```
## Otimização de performance (PostgreSQL + TypeORM)

### Índices e Chaves Estrangeiras

Não esqueça de criar `indexes` nas colunas de chaves estrangeiras (quando necessário), pois por padrão o PostgreSQL [não cria índices automaticamente para FKs](https://stackoverflow.com/a/970605/18140714).

### Máximo de conexões

Defina o número ideal de [max connections](https://node-postgres.com/apis/pool) para sua aplicação no `/.env`:

```txt
DATABASE_MAX_CONNECTIONS=100
```

Pense nesse parâmetro como o número de conexões concorrentes que sua aplicação consegue manter.


## Trocar PostgreSQL por MySQL

Se quiser usar `MySQL` no lugar de `PostgreSQL`, siga o guia completo em [Instalação e Execução](installing-and-running.md).

Após concluir os passos, a aplicação deve estar rodando.
![image](https://github.com/user-attachments/assets/ec60b61a-65e6-43e2-9bcf-72dad4c8a9fa)

Depois disso, são poucas mudanças para trocar de `PostgreSQL` para `MySQL`.

**Altere o `.env` para:**

```env
DATABASE_TYPE=mysql
# "localhost" se rodar local
# "mysql" se rodar no docker
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USERNAME=root
DATABASE_PASSWORD=secret
DATABASE_NAME=app
```

**Altere o `docker-compose.yml` para:**

```yml
services:
  mysql:
    image: mysql:9.2.0
    ports:
      - ${DATABASE_PORT}:3306
    volumes:
      - mysql-conectar-db:/var/lib/mysql
    environment:
      MYSQL_USER: ${DATABASE_USERNAME}
      MYSQL_PASSWORD: ${DATABASE_PASSWORD}
      MYSQL_ROOT_PASSWORD: ${DATABASE_PASSWORD}
      MYSQL_DATABASE: ${DATABASE_NAME}

  # outros serviços...

volumes:
  # outros volumes...
  mysql-conectar-db:
```

Depois, suba os serviços com:

```bash
docker compose up -d mysql adminer maildev
```

Os três serviços devem estar rodando conforme abaixo:

![image](https://github.com/user-attachments/assets/73e10325-66ed-46ca-a0c5-45791ef0750f)

Agora instale o cliente MySQL:

```bash
npm i mysql2 --save
```

**Delete a migração existente e gere uma nova:**

```bash
npm run migration:generate -- src/database/migrations/newMigration --pretty=true
```

Rode as migrações:

```bash
npm run migration:run
```

Rode os seeds:

```bash
npm run seed:run:relational
```

Rode a aplicação em modo dev:

```bash
npm run start:dev
```

Abra <http://localhost:3000>

Para configurar o Adminer:

Abra a porta no navegador.
Abra <http://localhost:8080>

![image](https://github.com/user-attachments/assets/f4b86daa-d93f-4ae9-a9e3-3c29bb3bba9d)

Aplicação rodando:
![image](https://github.com/user-attachments/assets/5dc0609d-5f6d-4176-918d-1744906f4f88)
![image](https://github.com/user-attachments/assets/ff2201a6-d834-4c8b-9ab7-b9413a0a95c1)

---

Anterior: [Interface de Linha de Comando](cli.md)

Próximo: [Autenticação](auth.md)
