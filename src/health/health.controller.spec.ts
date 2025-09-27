import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { ConfigService } from '@nestjs/config';
import { SmtpTestDto } from './dto/smtp-test.dto';
import { HEALTH_REPOSITORY } from './infrastructure/health.repository.interface';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

describe('HealthController', () => {
  let controller: HealthController;
  // let healthService: HealthService;
  let configService: ConfigService;

  const mockHealthRepository = {
    checkHealth: jest.fn(),
    testSmtpConnection: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        HealthService,
        {
          provide: HEALTH_REPOSITORY,
          useValue: mockHealthRepository,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    // healthService = module.get<HealthService>(HealthService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('should return health status with correct structure', async () => {
      const mockHealthResponse = {
        status: 'ok',
        uptime: 123.456,
        timestamp: '2024-01-01T00:00:00.000Z',
      };

      mockHealthRepository.checkHealth.mockResolvedValue(mockHealthResponse);

      const result = await controller.check();

      expect(result).toEqual(mockHealthResponse);
      expect(result.status).toBe('ok');
      expect(typeof result.uptime).toBe('number');
      expect(typeof result.timestamp).toBe('string');
      expect(mockHealthRepository.checkHealth).toHaveBeenCalledTimes(1);
    });

    it('should handle health check errors', async () => {
      const error = new Error('Health check failed');
      mockHealthRepository.checkHealth.mockRejectedValue(error);

      await expect(controller.check()).rejects.toThrow('Health check failed');
      expect(mockHealthRepository.checkHealth).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /health/smtp', () => {
    const mockRequest = {
      ip: '127.0.0.1',
      connection: { remoteAddress: '127.0.0.1' },
    } as any;

    const mockSmtpTestDto: SmtpTestDto = {
      email: 'test@example.com',
      message: 'Teste de conectividade SMTP',
    };

    beforeEach(() => {
      jest.spyOn(configService, 'get').mockReturnValue(Environment.Development);
    });

    it('should test SMTP connection successfully', async () => {
      const mockSmtpResponse = {
        status: 'ok',
        service: 'smtp',
        message: 'SMTP connection successful and test email sent',
        emailSent: true,
        recipient: 'test@example.com',
        timestamp: '2024-01-01T00:00:00.000Z',
      };

      mockHealthRepository.testSmtpConnection.mockResolvedValue(
        mockSmtpResponse,
      );

      const result = await controller.testSmtp(mockSmtpTestDto, mockRequest);

      expect(result).toEqual(mockSmtpResponse);
      expect(result.status).toBe('ok');
      expect(result.emailSent).toBe(true);
      expect(result.recipient).toBe('test@example.com');
      expect(mockHealthRepository.testSmtpConnection).toHaveBeenCalledWith(
        mockSmtpTestDto.email,
        mockSmtpTestDto.message,
      );
    });

    it('should handle SMTP test errors', async () => {
      const mockSmtpErrorResponse = {
        status: 'error',
        service: 'smtp',
        message: 'SMTP test failed: Connection timeout',
        emailSent: false,
        recipient: 'test@example.com',
        timestamp: '2024-01-01T00:00:00.000Z',
      };

      mockHealthRepository.testSmtpConnection.mockResolvedValue(
        mockSmtpErrorResponse,
      );

      const result = await controller.testSmtp(mockSmtpTestDto, mockRequest);

      expect(result).toEqual(mockSmtpErrorResponse);
      expect(result.status).toBe('error');
      expect(result.emailSent).toBe(false);
    });

    it('should throw error when not in development or test environment', async () => {
      jest.spyOn(configService, 'get').mockReturnValue(Environment.Production);

      await expect(
        controller.testSmtp(mockSmtpTestDto, mockRequest),
      ).rejects.toThrow(
        'Este endpoint só está disponível em ambiente de desenvolvimento ou teste',
      );
    });

    it('should handle request without IP', async () => {
      const mockRequestWithoutIp = {
        connection: { remoteAddress: '127.0.0.1' },
      } as any;

      const mockSmtpResponse = {
        status: 'ok',
        service: 'smtp',
        message: 'SMTP connection successful and test email sent',
        emailSent: true,
        recipient: 'test@example.com',
        timestamp: '2024-01-01T00:00:00.000Z',
      };

      mockHealthRepository.testSmtpConnection.mockResolvedValue(
        mockSmtpResponse,
      );

      const result = await controller.testSmtp(
        mockSmtpTestDto,
        mockRequestWithoutIp,
      );

      expect(result).toEqual(mockSmtpResponse);
    });

    it('should handle request with unknown IP', async () => {
      const mockRequestUnknownIp = {
        connection: {},
      } as any;

      const mockSmtpResponse = {
        status: 'ok',
        service: 'smtp',
        message: 'SMTP connection successful and test email sent',
        emailSent: true,
        recipient: 'test@example.com',
        timestamp: '2024-01-01T00:00:00.000Z',
      };

      mockHealthRepository.testSmtpConnection.mockResolvedValue(
        mockSmtpResponse,
      );

      const result = await controller.testSmtp(
        mockSmtpTestDto,
        mockRequestUnknownIp,
      );

      expect(result).toEqual(mockSmtpResponse);
    });
  });
});
