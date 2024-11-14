import { Module } from '@nestjs/common';
import { CnUsersService } from './cn-users.service';
import { CnUsersController } from './cn-users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CnUserEntity } from './cn-user.entity';
import { CnCoreModule } from '../cn-core/cn-core.module';
import { BullModule } from '@nestjs/bullmq';
import { blTransportSpaceUserQueue } from '@monorepo/back-core-lib';

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
