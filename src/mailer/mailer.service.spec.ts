import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from './mailer.service';
import { ConfigService } from '@nestjs/config';

jest.mock('node:fs/promises', () => ({
  __esModule: true,
  default: {
    readFile: jest.fn().mockResolvedValue('<p>{{title}}</p>'),
  },
  readFile: jest.fn().mockResolvedValue('<p>{{title}}</p>'),
}));

jest.mock('handlebars', () => ({
  __esModule: true,
  default: {
    compile: jest.fn(() => () => '<p>HTML</p>'),
  },
}));

const sendMailMock = jest.fn().mockResolvedValue(undefined);
jest.mock('nodemailer', () => {
  return {
    __esModule: true,
    default: {
      createTransport: jest.fn(() => ({ sendMail: sendMailMock })),
    },
  };
});

describe('MailerService', () => {
  let service: MailerService;
  const configServiceMock = {
    get: jest.fn((key: string) => {
      const map: Record<string, any> = {
        'mail.host': 'localhost',
        'mail.port': 1025,
        'mail.ignoreTLS': true,
        'mail.secure': false,
        'mail.requireTLS': false,
        'mail.user': undefined,
        'mail.password': undefined,
        'mail.defaultName': 'Api',
        'mail.defaultEmail': 'noreply@example.com',
      };
      return map[key];
    }),
  } as unknown as ConfigService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailerService,
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    service = module.get<MailerService>(MailerService);
  });

  it('sendMail should call transporter when html provided (skip template)', async () => {
    await service.sendMail({
      to: 'a@a.com',
      html: '<p>Hi</p>',
      templatePath: undefined as any,
      context: {},
    } as any);
    expect(sendMailMock).toHaveBeenCalled();
  });
});


