import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnCoreModule } from '../core/hn-core.module';
import { HnUserController } from './hn-user.controller';
import { HnUser } from './hn-user.entity';
import { HnUserProcessor } from './hn-user.processor';
import { HnUserService } from './hn-user.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnUser]), HnCoreModule],
  exports: [TypeOrmModule, HnUserService],
  controllers: [HnUserController],
  providers: [HnUserService, HnUserProcessor],
})
export class HnUserModule {}
