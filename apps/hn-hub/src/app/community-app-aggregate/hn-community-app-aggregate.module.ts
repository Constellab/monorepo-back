import { Module } from '@nestjs/common';
import { HnCoreModule } from '../core/hn-core.module';
import { HnCommunityAppController } from './hn-community-app.controller';
import { HnCommunityAppAggregateService } from './hn-community-app-aggregate.service';
import { HnCommunityAppModule } from './community-app/hn-community-app.module';
import { HnCommunityAppStatModule } from './community-app-stat/hn-community-app-stat.module';
import { HnCommunityAppForLabController } from './hn-community-app-for-lab.controller';
import { HnUserModule } from '../users/hn-user.module';
import { HnFileAppModule } from '../file-aggregate/file-app/hn-file-app.module';
import { HnSpaceAggregateModule } from '../space-aggregate/hn-space-aggregate.module';
import { HnCommunityAppUserModule } from './community-app-user/hn-community-app-user.module';
import { HnCommunityAppListener } from './hn-community-app.listener';

@Module({
  imports: [
    HnCoreModule,
    HnCommunityAppModule,
    HnCommunityAppStatModule,
    HnUserModule,
    HnSpaceAggregateModule,
    HnFileAppModule,
    HnCommunityAppUserModule,
  ],
  controllers: [HnCommunityAppController, HnCommunityAppForLabController],
  providers: [HnCommunityAppAggregateService, HnCommunityAppListener],
  exports: [HnCommunityAppAggregateService],
})
export class HnCommunityAppAggregateModule {}
