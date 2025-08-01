import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnSpaceUser } from './hn-space-user.entity';
import { HnSpaceUserService } from './hn-space-user.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnSpaceUser])],
  exports: [TypeOrmModule, HnSpaceUserService],
  providers: [HnSpaceUserService],
})
export class HnSpaceUserModule {}
