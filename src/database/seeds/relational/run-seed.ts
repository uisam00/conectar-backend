import { NestFactory } from '@nestjs/core';
import { RoleSeedService } from './role/role-seed.service';
import { SeedModule } from './seed.module';
import { StatusSeedService } from './status/status-seed.service';
import { UserSeedService } from './user/user-seed.service';
import { PlanSeedService } from './plan/plan-seed.service';
import { ClientSeedService } from './client/client-seed.service';
import { ClientRoleSeedService } from './client-role/client-role-seed.service';

const runSeed = async () => {
  const app = await NestFactory.create(SeedModule);

  // run
  await app.get(RoleSeedService).run();
  await app.get(StatusSeedService).run();
  await app.get(UserSeedService).run();
  await app.get(PlanSeedService).run();
  await app.get(ClientSeedService).run();
  await app.get(ClientRoleSeedService).run();

  await app.close();
};

void runSeed();
