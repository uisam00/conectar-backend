import { Test, TestingModule } from '@nestjs/testing';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';

describe('HomeController', () => {
  let controller: HomeController;

  const homeServiceMock = {
    appInfo: jest.fn().mockReturnValue({ name: 'Conéctar Backend' }),
  } as unknown as HomeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HomeController],
      providers: [
        {
          provide: HomeService,
          useValue: homeServiceMock,
        },
      ],
    }).compile();

    controller = module.get<HomeController>(HomeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('GET / should return app info', () => {
    const result = controller.appInfo();
    expect(result).toEqual({ name: 'Conéctar Backend' });
  });
});


