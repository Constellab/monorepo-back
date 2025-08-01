import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnUserModule } from '../../users/hn-user.module';
import { HnBrickUser } from './hn-brick-user.entity';
import { HnBrickUserService } from './hn-brick-user.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnBrickUser]), HnUserModule],
  exports: [TypeOrmModule, HnBrickUserService],
  providers: [HnBrickUserService],
})
export class HnBrickUserModule {}
