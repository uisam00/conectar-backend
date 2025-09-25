# Traduções

## Sumário <!-- omit in toc -->

- [Como adicionar uma nova tradução](#como-adicionar-uma-nova-tradução)
- [Como usar traduções no frontend](#como-usar-traduções-no-frontend)
- [Como usar traduções no código](#como-usar-traduções-no-código)

## Como adicionar uma nova tradução

1. Copie a pasta `pr_BR` e renomeie para o idioma desejado.
2. Traduza os arquivos da nova pasta.

## Como usar traduções no frontend

1. Adicione o header `x-custom-lang` na requisição com o idioma desejado.

## Como usar traduções no código

```typescript
import { I18nContext } from 'nestjs-i18n';

// ...

@Injectable()
export class SomeService {
  // ...

  async someMethod(): Promise<void> {
    const i18n = I18nContext.current();

    if (!i18n) {
      throw new Error('I18nContext is not available');
    }

    const emailConfirmTitle = await i18n.t('common.confirmEmail');

    // ...
  }
}
```

---

Anterior: [Atualização automática de dependências](tests.md)
