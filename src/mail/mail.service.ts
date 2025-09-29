import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nContext } from 'nestjs-i18n';
import { MailData } from './interfaces/mail-data.interface';

import { MaybeType } from '../utils/types/maybe.type';
import { MailerService } from '../mailer/mailer.service';
import path from 'path';
import { AllConfigType } from '../config/config.type';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  async userSignUp(mailData: MailData<{ hash: string }>): Promise<void> {
    try {
      const i18n = I18nContext.current();
      let emailConfirmTitle: MaybeType<string>;
      let text1: MaybeType<string>;
      let text2: MaybeType<string>;
      let text3: MaybeType<string>;

      if (i18n) {
        [emailConfirmTitle, text1, text2, text3] = await Promise.all([
          i18n.t('common.confirmEmail'),
          i18n.t('confirm-email.text1'),
          i18n.t('confirm-email.text2'),
          i18n.t('confirm-email.text3'),
        ]);
      }

      const url = new URL(
        this.configService.getOrThrow('app.frontendDomain', {
          infer: true,
        }) + '/confirm-email',
      );
      url.searchParams.set('hash', mailData.data.hash);

      await this.mailerService.sendMail({
        to: mailData.to,
        subject: emailConfirmTitle,
        text: `${url.toString()} ${emailConfirmTitle}`,
        templatePath: path.join(
          this.configService.getOrThrow('app.workingDirectory', {
            infer: true,
          }),
          'src',
          'mail',
          'mail-templates',
          'activation.hbs',
        ),
        context: {
          title: emailConfirmTitle,
          url: url.toString(),
          actionTitle: emailConfirmTitle,
          app_name: this.configService.get('app.name', { infer: true }),
          text1,
          text2,
          text3,
        },
      });
    } catch (error) {
      console.warn('Failed to send email:', error.message);
      // Don't throw the error to prevent registration from failing
    }
  }

  async forgotPassword(
    mailData: MailData<{ hash: string; tokenExpires: number }>,
  ): Promise<void> {
    const i18n = I18nContext.current();
    let resetPasswordTitle: MaybeType<string>;
    let text1: MaybeType<string>;
    let text2: MaybeType<string>;
    let text3: MaybeType<string>;
    let text4: MaybeType<string>;

    if (i18n) {
      [resetPasswordTitle, text1, text2, text3, text4] = await Promise.all([
        i18n.t('common.resetPassword'),
        i18n.t('reset-password.text1'),
        i18n.t('reset-password.text2'),
        i18n.t('reset-password.text3'),
        i18n.t('reset-password.text4'),
      ]);
    }

    const url = new URL(
      this.configService.getOrThrow('app.frontendDomain', {
        infer: true,
      }) + '/password-change',
    );
    url.searchParams.set('hash', mailData.data.hash);
    url.searchParams.set('expires', mailData.data.tokenExpires.toString());

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: resetPasswordTitle,
      text: `${url.toString()} ${resetPasswordTitle}`,
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src',
        'mail',
        'mail-templates',
        'reset-password.hbs',
      ),
      context: {
        title: resetPasswordTitle,
        url: url.toString(),
        actionTitle: resetPasswordTitle,
        app_name: this.configService.get('app.name', {
          infer: true,
        }),
        text1,
        text2,
        text3,
        text4,
      },
    });
  }

  async confirmNewEmail(mailData: MailData<{ hash: string }>): Promise<void> {
    const i18n = I18nContext.current();
    let emailConfirmTitle: MaybeType<string>;
    let text1: MaybeType<string>;
    let text2: MaybeType<string>;
    let text3: MaybeType<string>;

    if (i18n) {
      [emailConfirmTitle, text1, text2, text3] = await Promise.all([
        i18n.t('common.confirmEmail'),
        i18n.t('confirm-new-email.text1'),
        i18n.t('confirm-new-email.text2'),
        i18n.t('confirm-new-email.text3'),
      ]);
    }

    const url = new URL(
      this.configService.getOrThrow('app.frontendDomain', {
        infer: true,
      }) + '/confirm-new-email',
    );
    url.searchParams.set('hash', mailData.data.hash);

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: emailConfirmTitle,
      text: `${url.toString()} ${emailConfirmTitle}`,
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src',
        'mail',
        'mail-templates',
        'confirm-new-email.hbs',
      ),
      context: {
        title: emailConfirmTitle,
        url: url.toString(),
        actionTitle: emailConfirmTitle,
        app_name: this.configService.get('app.name', { infer: true }),
        text1,
        text2,
        text3,
      },
    });
  }

  async userCreated(
    mailData: MailData<{
      firstName: string;
      temporaryPassword?: string;
    }>,
  ): Promise<void> {
    try {
      const i18n = I18nContext.current();
      let userCreatedTitle: MaybeType<string>;
      let text1: MaybeType<string>;
      let text2: MaybeType<string>;
      let text3: MaybeType<string>;
      let text4: MaybeType<string>;
      let text5: MaybeType<string>;
      let text6: MaybeType<string>;

      if (i18n) {
        [userCreatedTitle, text1, text2, text3, text4, text5, text6] =
          await Promise.all([
            i18n.t('common.userCreated'),
            i18n.t('user-created.text1', {
              args: { firstName: mailData.data.firstName },
            }),
            i18n.t('user-created.text2'),
            i18n.t('user-created.text3'),
            i18n.t('user-created.text4'),
            i18n.t('user-created.text5'),
            i18n.t('user-created.text6'),
          ]);
      }

      const url = new URL(
        this.configService.getOrThrow('app.frontendDomain', {
          infer: true,
        }) + '/login',
      );

      const templateFile = mailData.data.temporaryPassword
        ? 'user-created.hbs'
        : 'welcome.hbs';

      await this.mailerService.sendMail({
        to: mailData.to,
        subject: userCreatedTitle,
        text: `${url.toString()} ${userCreatedTitle}`,
        templatePath: path.join(
          this.configService.getOrThrow('app.workingDirectory', {
            infer: true,
          }),
          'src',
          'mail',
          'mail-templates',
          templateFile,
        ),
        context: {
          title: userCreatedTitle,
          url: url.toString(),
          actionTitle: 'Acessar Plataforma',
          app_name: this.configService.get('app.name', { infer: true }),
          firstName: mailData.data.firstName,
          temporaryPassword: mailData.data.temporaryPassword,
          text1,
          text2,
          text3,
          text4,
          text5,
          text6,
        },
      });
    } catch (error) {
      console.warn('Failed to send user created email:', error.message);
      // Don't throw the error to prevent user creation from failing
    }
  }

  async userCreatedWithConfirmation(
    mailData: MailData<{
      firstName: string;
      temporaryPassword: string;
      hash: string;
    }>,
  ): Promise<void> {
    try {
      const i18n = I18nContext.current();
      let userCreatedTitle: MaybeType<string>;
      let text1: MaybeType<string>;
      let text2: MaybeType<string>;
      let text3: MaybeType<string>;
      let text4: MaybeType<string>;
      let text5: MaybeType<string>;
      let text6: MaybeType<string>;

      if (i18n) {
        [userCreatedTitle, text1, text2, text3, text4, text5, text6] =
          await Promise.all([
            i18n.t('common.userCreated'),
            i18n.t('user-created.text1', {
              args: { firstName: mailData.data.firstName },
            }),
            i18n.t('user-created.text2'),
            i18n.t('user-created.text3'),
            i18n.t('user-created.text4'),
            i18n.t('user-created.text5'),
            i18n.t('user-created.text6'),
          ]);
      }

      const confirmUrl = new URL(
        this.configService.getOrThrow('app.frontendDomain', {
          infer: true,
        }) + '/confirm-email',
      );
      confirmUrl.searchParams.set('hash', mailData.data.hash);

      await this.mailerService.sendMail({
        to: mailData.to,
        subject: userCreatedTitle,
        text: `${confirmUrl.toString()} ${userCreatedTitle}`,
        templatePath: path.join(
          this.configService.getOrThrow('app.workingDirectory', {
            infer: true,
          }),
          'src',
          'mail',
          'mail-templates',
          'user-created.hbs',
        ),
        context: {
          title: userCreatedTitle,
          url: confirmUrl.toString(),
          actionTitle: 'Confirmar Email',
          app_name: this.configService.get('app.name', { infer: true }),
          firstName: mailData.data.firstName,
          temporaryPassword: mailData.data.temporaryPassword,
          text1,
          text2,
          text3,
          text4,
          text5,
          text6,
        },
      });
    } catch (error) {
      console.warn(
        'Failed to send user created with confirmation email:',
        error.message,
      );
      // Don't throw the error to prevent user creation from failing
    }
  }
}
