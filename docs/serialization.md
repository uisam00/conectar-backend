# Serialização

Para serialização, o projeto utiliza [class-transformer](https://www.npmjs.com/package/class-transformer) e o interceptor global `ClassSerializerInterceptor`.

---

## Sumário <!-- omit in toc -->

- [Ocultar propriedade privada](#ocultar-propriedade-privada)
- [Exibir propriedade privada para admins](#exibir-propriedade-privada-para-admins)

---

## Ocultar propriedade privada

Se você precisa ocultar uma propriedade na entidade, pode usar `@Exclude({ toPlainOnly: true })` na coluna.

```ts
// /src/users/entities/user.entity.ts

import { Exclude } from 'class-transformer';

@Entity()
export class User extends EntityRelationalHelper {
  // ...

  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  password: string;

  // ...
}
```

## Exibir propriedade privada para admins

1. Crie um controller que retorne dados apenas para admin e adicione `@SerializeOptions({ groups: ['admin'] })` no método:

   ```ts
   // /src/users/users.controller.ts

   // ...

   @ApiBearerAuth()
   @Roles(RoleEnum.admin)
   @UseGuards(AuthGuard('jwt'), RolesGuard)
   @Controller({
     path: 'users',
     version: '1',
   })
   export class UsersController {
     constructor(private readonly usersService: UsersService) {}

     // ...

     @SerializeOptions({
       groups: ['admin'],
     })
     @Get(':id')
     @HttpCode(HttpStatus.OK)
     findOne(@Param('id') id: string) {
       return this.usersService.findOne({ id: +id });
     }

     // ...
   }
   ```

2. Na entidade, adicione `@Expose({ groups: ['admin'] })` na coluna que deve ser exibida para admin:

   ```ts
   // /src/users/entities/user.entity.ts

   // ...

   import { Expose } from 'class-transformer';

   @Entity()
   export class User extends EntityRelationalHelper {
     // ...

     @Column({ unique: true, nullable: true })
     @Expose({ groups: ['admin'] })
     email: string | null;

     // ...
   }
   ```

---

Anterior: [Autenticação](auth.md)

Próximo: [Upload de arquivos](file-uploading.md)
