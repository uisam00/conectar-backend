import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmConfigService } from './typeorm-config.service';
import { ConfigService } from '@nestjs/config';

describe('TypeOrmConfigService', () => {
  let service: TypeOrmConfigService;
  const configServiceMock = {
    get: jest.fn((key: string) => {
      const map: Record<string, any> = {
        'database.type': 'postgres',
        'database.url': undefined,
        'database.host': 'localhost',
        'database.port': 5432,
        'database.username': 'root',
        'database.password': 'secret',
        'database.name': 'api',
        'database.synchronize': false,
        'app.nodeEnv': 'test',
        'database.maxConnections': 10,
        'database.sslEnabled': false,
      };
      return map[key];
    }),
  } as unknown as ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmConfigService,
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    service = module.get<TypeOrmConfigService>(TypeOrmConfigService);
  });

  it('should create options using config service', () => {
    const opts = service.createTypeOrmOptions();
    const anyOpts = opts as any;
    expect(anyOpts.type).toBe('postgres');
    expect(anyOpts.host).toBe('localhost');
    expect(anyOpts.port).toBe(5432);
    expect(anyOpts.username).toBe('root');
    expect(anyOpts.password).toBe('secret');
    expect(anyOpts.database).toBe('api');
    expect(anyOpts.synchronize).toBe(false);
    expect(anyOpts.logging).toBe(true);
    expect(anyOpts.extra).toBeDefined();
  });
});
