import { blTransportSpaceUserQueue } from '@monorepo/back-core-lib';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CnCoreModule } from '../cn-core/cn-core.module';
import { CnUserEntity } from './cn-user.entity';
import { CnUsersController } from './cn-users.controller';
import { CnUsersService } from './cn-users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnUserEntity]),
    CnCoreModule,
    BullModule.registerQueue({
      name: blTransportSpaceUserQueue,
    }),
  ],
  providers: [CnUsersService],
  controllers: [CnUsersController],
  exports: [CnUsersService],
})
export class CnUsersModule {}
