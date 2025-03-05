import { Module } from '@nestjs/common';
import { HnCoreModule } from '../core/hn-core.module';
import { HnCommunityAppController } from './hn-community-app.controller';
import { HnCommunityAppAggregateService } from './hn-community-app-aggregate.service';
import { HnCommunityAppModule } from './hn-community-app/hn-community-app.module';
import { HnCommunityAppStatModule } from './hn-community-app-stat/hn-community-app-stat.module';
import { HnCommunityAppForLabController } from './hn-community-app-for-lab.controller';
import { HnUserModule } from '../users/hn-user.module';
import { HnSpaceModule } from '../space-aggregate/space/hn-space.module';
import { HnFileAppModule } from '../file-aggregate/file-app/hn-file-app.module';

@Module({
  imports: [
    HnCoreModule,
    HnCommunityAppModule,
    HnCommunityAppStatModule,
    HnUserModule,
    HnSpaceModule,
    HnFileAppModule,
  ],
  controllers: [HnCommunityAppController, HnCommunityAppForLabController],
  providers: [HnCommunityAppAggregateService],
  exports: [HnCommunityAppAggregateService],
})
export class HnCommunityAppAggregateModule {}
