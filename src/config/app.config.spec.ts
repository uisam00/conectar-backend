import type { AppConfig } from './app-config.type';

// Evita dependência do alias de paths no ambiente de teste
jest.mock('src/utils/validate-config', () => ({
  __esModule: true,
  default: () => undefined,
}), { virtual: true });

describe('app.config', () => {
  const OLD_ENV = process.env;
  let appConfig: () => unknown;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    // requer após o mock acima
    appConfig = require('./app.config').default;
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should return an object with the expected shape and types', () => {
    const cfg = appConfig() as unknown as AppConfig;

    expect(cfg).toHaveProperty('nodeEnv');
    expect(typeof cfg.nodeEnv).toBe('string');

    expect(cfg).toHaveProperty('name');
    expect(typeof cfg.name).toBe('string');

    expect(cfg).toHaveProperty('workingDirectory');
    expect(typeof cfg.workingDirectory).toBe('string');

    expect(cfg).toHaveProperty('backendDomain');
    expect(typeof cfg.backendDomain).toBe('string');

    expect(cfg).toHaveProperty('port');
    expect(typeof cfg.port).toBe('number');

    expect(cfg).toHaveProperty('apiPrefix');
    expect(typeof cfg.apiPrefix).toBe('string');

    expect(cfg).toHaveProperty('fallbackLanguage');
    expect(typeof cfg.fallbackLanguage).toBe('string');

    expect(cfg).toHaveProperty('headerLanguage');
    expect(typeof cfg.headerLanguage).toBe('string');
  });
});


