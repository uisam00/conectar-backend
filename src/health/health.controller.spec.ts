import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should return status ok', () => {
    const result = controller.check();
    expect(result.status).toBe('ok');
    expect(typeof result.uptime).toBe('number');
    expect(typeof result.timestamp).toBe('string');
  });
});
