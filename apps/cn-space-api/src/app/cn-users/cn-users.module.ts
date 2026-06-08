import { BL_TRANSPORT_SPACE_USER_QUEUE } from '@monorepo/back-core-lib';
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
      name: BL_TRANSPORT_SPACE_USER_QUEUE,
    }),
  ],
  providers: [CnUsersService],
  controllers: [CnUsersController],
  exports: [CnUsersService],
})
export class CnUsersModule {}
