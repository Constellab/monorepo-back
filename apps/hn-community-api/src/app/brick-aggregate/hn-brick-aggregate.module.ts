import { Module } from '@nestjs/common';

import { HnCoreModule } from '../core/hn-core.module';
import { HnCommunitySecurityModule } from '../core/security/hn-community-security.module';
import { HnCoreConfigModule } from '../core/modules/core-config/hn-core-config.module';
import { HnFileDocumentationModule } from '../file-aggregate/file-documentation/hn-file-documentation.module';
import { HnSpaceAggregateModule } from '../space-aggregate/hn-space-aggregate.module';
import { HnSpaceUserModule } from '../space-aggregate/space-user/hn-space-user.module';
import { HnTechnicalFolderModule } from '../technical-folder/hn-technical-folder.module';
import { HnUserModule } from '../users/hn-user.module';
import { HnBrickModule } from './brick/hn-brick.module';
import { HnBrickMajorVersionModule } from './brick-major-version/hn-brick-major-version.module';
import { HnBrickUserModule } from './brick-user/hn-brick-user.module';
import { HnBrickUserInviteModule } from './brick-user-invite/hn-brick-user-invite.module';
import { HnBrickVersionModule } from './brick-version/hn-brick-version.module';
import { HnDocumentationModule } from './documentation/hn-documentation.module';
import { HnFolderModule } from './folder/hn-folder.module';
import { HnBrickController } from './hn-brick.controller';
import { HnBrickForSpaceController } from './hn-brick-for-space.controller';
import { HnBrickListener } from './hn-brick.listener';
import { HnBrickAggregateService } from './hn-brick-aggregate.service';
import { HnBrickSecurity } from './security/hn-brick.security';
import { HnBrickVersionController } from './hn-brick-version.controller';
import { HnDocumentationController } from './hn-documentation.controller';
import { HnFolderController } from './hn-folder.controller';

@Module({
  imports: [
    HnCoreModule,
    HnCommunitySecurityModule,
    HnCoreConfigModule,
    HnBrickModule,
    HnBrickMajorVersionModule,
    HnBrickVersionModule,
    HnFolderModule,
    HnDocumentationModule,
    HnBrickUserModule,
    HnBrickUserInviteModule,
    HnTechnicalFolderModule,
    HnSpaceUserModule,
    HnSpaceAggregateModule,
    HnUserModule,
    HnFileDocumentationModule,
  ],
  controllers: [HnBrickController, HnBrickForSpaceController, HnBrickVersionController, HnFolderController, HnDocumentationController],
  providers: [HnBrickAggregateService, HnBrickSecurity, HnBrickListener],
  exports: [HnBrickAggregateService, HnBrickSecurity],
})
export class HnBrickAggregateModule {}
