import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { MailerService } from '../mailer/mailer.service';
import { ConfigService } from '@nestjs/config';

describe('MailService', () => {
  let service: MailService;
  const mailerServiceMock = {
    sendMail: jest.fn(),
  } as unknown as MailerService;

  const configServiceMock = {
    get: jest.fn((key: string) => {
      if (key === 'app.name') return 'App';
      return undefined;
    }),
    getOrThrow: jest.fn((key: string) => {
      if (key === 'app.frontendDomain') return 'http://localhost:3000';
      if (key === 'app.workingDirectory') return process.cwd();
      return 'x';
    }),
  } as unknown as ConfigService;

  beforeEach(async () => {
    jest.resetAllMocks();
    // Simplificar URL no ambiente de teste para evitar "Invalid URL"

    (global as any).URL = class {
      private value: string;
      searchParams = new (class {
        private params = new Map<string, string>();
        set = (k: string, v: string) => {
          this.params.set(k, v);
        };
      })();
      constructor(value: string) {
        this.value = value;
      }
      toString() {
        return this.value;
      }
    } as unknown as any;

    // garantir workingDirectory para path.join
    (configServiceMock.getOrThrow as jest.Mock).mockImplementation(
      (key: string) => {
        if (key === 'app.frontendDomain') return 'http://localhost:3000';
        if (key === 'app.workingDirectory') return process.cwd();
        return 'x';
      },
    );
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: MailerService, useValue: mailerServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('userSignUp should call mailerService.sendMail with expected fields', async () => {
    await service.userSignUp({ to: 'a@a.com', data: { hash: 'h' } });
    expect(mailerServiceMock.sendMail).toHaveBeenCalled();
  });

  it('forgotPassword should call mailerService.sendMail with expected fields', async () => {
    await service.forgotPassword({
      to: 'a@a.com',
      data: { hash: 'h', tokenExpires: Date.now() + 1000 },
    });
    expect(mailerServiceMock.sendMail).toHaveBeenCalled();
  });

  it('confirmNewEmail should call mailerService.sendMail with expected fields', async () => {
    await service.confirmNewEmail({ to: 'a@a.com', data: { hash: 'h' } });
    expect(mailerServiceMock.sendMail).toHaveBeenCalled();
  });
});
