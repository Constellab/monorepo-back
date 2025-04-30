import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HnBrickUserInvite } from './hn-brick-user-invite.entity';
import { HnUserModule } from '../../users/hn-user.module';
import { HnBrickUserInviteService } from './hn-brick-user-invite.service';
import { HnCoreModule } from '../../core/hn-core.module';

@Module({
  imports: [TypeOrmModule.forFeature([HnBrickUserInvite]), HnUserModule, HnCoreModule],
  exports: [TypeOrmModule, HnBrickUserInviteService],
  providers: [HnBrickUserInviteService],
})
export class HnBrickUserInviteModule {}
