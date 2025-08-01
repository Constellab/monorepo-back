import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnCoreModule } from '../../core/hn-core.module';
import { HnUserModule } from '../../users/hn-user.module';
import { HnBrickUserInvite } from './hn-brick-user-invite.entity';
import { HnBrickUserInviteService } from './hn-brick-user-invite.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnBrickUserInvite]), HnUserModule, HnCoreModule],
  exports: [TypeOrmModule, HnBrickUserInviteService],
  providers: [HnBrickUserInviteService],
})
export class HnBrickUserInviteModule {}
