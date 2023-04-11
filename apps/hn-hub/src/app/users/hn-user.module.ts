import { Module } from '@nestjs/common';
import { HnUserService } from './hn-user.service';
import { HnUserController } from './hn-user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HnUser } from './hn-user.entity';
import {HnCoreConfigService} from '../core/modules/core-config/hn-core-config.service';
import {HnCoreConfigModule} from '../core/modules/core-config/hn-core-config.module';
import {BlObjectStorageService} from '@monorepo/back-core-lib';

@Module({
  imports: [TypeOrmModule.forFeature([HnUser])],
  exports: [TypeOrmModule, HnUserService],
  controllers: [HnUserController],
  providers: [HnUserService, BlObjectStorageService, HnCoreConfigService]
})
export class HnUserModule {}
