import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HomeService } from './home.service';

describe('HomeService', () => {
  let service: HomeService;
  const configServiceMock = {
    get: jest.fn(),
    getOrThrow: jest.fn(),
  } as unknown as ConfigService;

  beforeEach(async () => {
    (configServiceMock.get as jest.Mock).mockReturnValue('Conéctar Backend');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HomeService,
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    service = module.get<HomeService>(HomeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('appInfo should return name from config', () => {
    const result = service.appInfo();
    expect(result).toEqual({ name: 'Conéctar Backend' });
  });
});


