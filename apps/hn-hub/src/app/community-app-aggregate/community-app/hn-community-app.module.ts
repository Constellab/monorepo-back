import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HnCommunityAppEntity } from './hn-community-app.entity';
import { HnCoreModule } from '../../core/hn-core.module';
import { HnCommunityAppService } from './hn-community-app.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnCommunityAppEntity]), HnCoreModule],
  exports: [TypeOrmModule, HnCommunityAppService],
  providers: [HnCommunityAppService],
})
export class HnCommunityAppModule {}
