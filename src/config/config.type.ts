import { AppConfig } from './app-config.type';

import { DatabaseConfig } from '../database/config/database-config.type';
import { AuthConfig } from 'src/auth/config/auth-config.type';
import { MailConfig } from 'src/mail/config/mail-config.type';
import { FileConfig } from 'src/files/config/file-config.type';
import { GoogleConfig } from 'src/auth-google/config/google-config.type';


export type AllConfigType = {
  app: AppConfig;
  auth: AuthConfig;
  database: DatabaseConfig;
  file: FileConfig;
  google: GoogleConfig;
  mail: MailConfig;
};


