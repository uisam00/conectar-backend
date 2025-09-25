# Arquitetura

---

## Sumário 

- [Arquitetura Hexagonal](#arquitetura-hexagonal)
- [Motivação](#motivação)
- [Descrição da estrutura de módulos](#descrição-da-estrutura-de-módulos)
- [Recomendações](#recomendações)
  - [Repositório](#repositório)
- [Links](#links)

---

## Arquitetura Hexagonal

O Projeto é baseado na [Arquitetura Hexagonal](https://en.wikipedia.org/wiki/Hexagonal_architecture_(software)), também conhecida como Ports and Adapters (Portas e Adaptadores).

![Hexagonal Architecture Diagram](hex-arch.png)

```ts
// <database-block>
const infrastructurePersistenceModule = (databaseConfig() as DatabaseConfig)
  .isDocumentDatabase
  ? DocumentUserPersistenceModule
  : RelationalUserPersistenceModule;
// </database-block>

@Module({
  imports: [
    infrastructurePersistenceModule,
    FilesModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, infrastructurePersistenceModule],
})
export class UsersModule {}
```

Esse exemplo demonstra como você poderia alternar entre um banco relacional e um banco não relacional sem impactar o domínio.

## Motivação

A principal razão para usar a Arquitetura Hexagonal é separar a lógica de negócio da infraestrutura. Essa separação permite alterar facilmente o banco de dados, a forma de upload de arquivos ou qualquer outra infraestrutura sem mudar a lógica de negócio.

## Descrição da estrutura de módulos

```txt
.
├── domain
│   └── [DOMAIN_ENTITY].ts
├── dto
│   ├── create.dto.ts
│   ├── find-all.dto.ts
│   └── update.dto.ts
├── infrastructure
│   └── persistence
│       ├── document <- exemplo de implementação de um banco de dados não relacional (MongoDB)
│       │   ├── document-persistence.module.ts
│       │   ├── entities
│       │   │   └── [SCHEMA].ts
│       │   ├── mappers
│       │   │   └── [MAPPER].ts
│       │   └── repositories
│       │       └── [ADAPTER].repository.ts
│       ├── relational
│       │   ├── entities
│       │   │   └── [ENTITY].ts
│       │   ├── mappers
│       │   │   └── [MAPPER].ts
│       │   ├── relational-persistence.module.ts
│       │   └── repositories
│       │       └── [ADAPTER].repository.ts
│       └── [PORT].repository.ts
├── controller.ts
├── module.ts
└── service.ts
```

`[DOMAIN ENTITY].ts` representa uma entidade usada na lógica de negócio. A entidade de domínio não possui dependências do banco de dados ou de qualquer infraestrutura.

`[SCHEMA].ts` representa a **estrutura do banco de dados**. É usado em bancos orientados a documentos (MongoDB).

`[ENTITY].ts` representa a **estrutura de banco de dados**. É usado em bancos relacionais (PostgreSQL).

`[MAPPER].ts` é um mapeador que converte **entidades de banco** em **entidades de domínio** e vice-versa.

`[PORT].repository.ts` é a **porta** do repositório que define os métodos de interação com o banco de dados.

`[ADAPTER].repository.ts` é o repositório que implementa `[PORT].repository.ts`. Ele é usado para interagir com o banco de dados.

Pasta `infrastructure` – contém componentes relacionados à infraestrutura, como `persistence`, `uploader`, `senders`, etc.

Cada componente tem `port` e `adapters`. `Port` é a interface que define os métodos de interação com a infraestrutura. `Adapters` são as implementações da `port`.

## Recomendações

### Repositório

Não tente criar métodos universais no repositório, pois são difíceis de estender ao longo do projeto. Prefira métodos com responsabilidade única.

```typescript
// ❌
export class UsersRelationalRepository implements UserRepository {
  async find(condition: UniversalConditionInterface): Promise<User> {
    // ...
  }
}

// ✅
export class UsersRelationalRepository implements UserRepository {
  async findByEmail(email: string): Promise<User> {
    // ...
  }
  
  async findByRoles(roles: string[]): Promise<User> {
    // ...
  }
  
  async findByIds(ids: string[]): Promise<User> {
    // ...
  }
}
```

---

## Links

- [Princípio da Inversão de Dependência](https://trilon.io/blog/dependency-inversion-principle) com NestJS.

---

Anterior: [Instalação e Execução](installing-and-running.md)

Próximo: [Interface de Linha de Comando](database.md)
