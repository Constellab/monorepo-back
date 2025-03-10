import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HnCommunityAppUser } from './hn-community-app-user.entity';
import { HnCommunityAppUserService } from './hn-community-app-user.service';
import { HnUserModule } from '../../users/hn-user.module';

@Module({
  imports: [TypeOrmModule.forFeature([HnCommunityAppUser]), HnUserModule],
  exports: [TypeOrmModule, HnCommunityAppUserService],
  providers: [HnCommunityAppUserService],
})
export class HnCommunityAppUserModule {}
