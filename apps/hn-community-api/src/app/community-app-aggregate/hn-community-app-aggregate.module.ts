import { Module } from '@nestjs/common';

import { HnCoreModule } from '../core/hn-core.module';
import { HnCommunitySecurityModule } from '../core/security/hn-community-security.module';
import { HnFileAppModule } from '../file-aggregate/file-app/hn-file-app.module';
import { HnSpaceAggregateModule } from '../space-aggregate/hn-space-aggregate.module';
import { HnUserModule } from '../users/hn-user.module';
import { HnCommunityAppModule } from './community-app/hn-community-app.module';
import { HnCommunityAppCoAuthorModule } from './community-app-co-author/hn-community-app-co-author.module';
import { HnCommunityAppStatModule } from './community-app-stat/hn-community-app-stat.module';
import { HnCommunityAppUserModule } from './community-app-user/hn-community-app-user.module';
import { HnCommunityAppController } from './hn-community-app.controller';
import { HnCommunityAppListener } from './hn-community-app.listener';
import { HnCommunityAppAggregateService } from './hn-community-app-aggregate.service';
import { HnCommunityAppForLabController } from './hn-community-app-for-lab.controller';
import { HnCommunityAppSecurity } from './security/hn-community-app.security';

@Module({
  imports: [
    HnCoreModule,
    HnCommunitySecurityModule,
    HnCommunityAppModule,
    HnCommunityAppStatModule,
    HnUserModule,
    HnSpaceAggregateModule,
    HnFileAppModule,
    HnCommunityAppUserModule,
    HnCommunityAppCoAuthorModule,
  ],
  controllers: [HnCommunityAppController, HnCommunityAppForLabController],
  providers: [HnCommunityAppAggregateService, HnCommunityAppSecurity, HnCommunityAppListener],
  exports: [HnCommunityAppAggregateService],
})
export class HnCommunityAppAggregateModule {}
