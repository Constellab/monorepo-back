import { BlExternalApiModule } from '@monorepo/back-core-lib';
import { Module } from '@nestjs/common';

import { HnBrickModule } from '../brick-aggregate/brick/hn-brick.module';
import { HnBrickMajorVersionModule } from '../brick-aggregate/brick-major-version/hn-brick-major-version.module';
import { HnBrickUserModule } from '../brick-aggregate/brick-user/hn-brick-user.module';
import { HnBrickUserInviteModule } from '../brick-aggregate/brick-user-invite/hn-brick-user-invite.module';
import { HnBrickVersionModule } from '../brick-aggregate/brick-version/hn-brick-version.module';
import { HnDocumentationModule } from '../brick-aggregate/documentation/hn-documentation.module';
import { HnFolderModule } from '../brick-aggregate/folder/hn-folder.module';
import { HnBrickAggregateModule } from '../brick-aggregate/hn-brick-aggregate.module';
import { HnBrickAggregateService } from '../brick-aggregate/hn-brick-aggregate.service';
import { HnCoreModule } from '../core/hn-core.module';
import { HnCoreConfigModule } from '../core/modules/core-config/hn-core-config.module';
import { HnCommunitySecurityModule } from '../core/security/hn-community-security.module';
import { HnFileAgentModule } from '../file-aggregate/file-agent/hn-file-agent.module';
import { HnFileAppModule } from '../file-aggregate/file-app/hn-file-app.module';
import { HnFileDocumentationModule } from '../file-aggregate/file-documentation/hn-file-documentation.module';
import { HnSpaceAggregateModule } from '../space-aggregate/hn-space-aggregate.module';
import { HnSpaceAggregateService } from '../space-aggregate/hn-space-aggregate.service';
import { HnSpaceModule } from '../space-aggregate/space/hn-space.module';
import { HnSpaceUserModule } from '../space-aggregate/space-user/hn-space-user.module';
import { HnTechnicalFolderModule } from '../technical-folder/hn-technical-folder.module';
import { HnUserModule } from '../users/hn-user.module';
import { HnAgentModule } from './agent/hn-agent.module';
import { HnAgentCoAuthorModule } from './agent-co-author/hn-agent-co-author.module';
import { HnAgentCoAuthorInviteModule } from './agent-co-author-invite/hn-agent-co-author-invite.module';
import { HnAgentVersionModule } from './agent-version/hn-agent-version.module';
import { HnAgentVersionBrickDependenciesModule } from './agent-version-brick-dependencies/hn-agent-version-brick-dependencies.module';
import { HnAgentController } from './hn-agent.controller';
import { HnAgentListener } from './hn-agent.listener';
import { HnAgentAggregateService } from './hn-agent-aggregate.service';
import { HnAgentForLabController } from './hn-agent-for-lab.controller';
import { HnTempLiveTaskController } from './hn-temp-live-task.controller';
import { HnAgentSecurity } from './security/hn-agent.security';

@Module({
  imports: [
    HnAgentModule,
    HnAgentVersionModule,
    HnAgentCoAuthorInviteModule,
    HnAgentVersionBrickDependenciesModule,
    HnAgentCoAuthorModule,

    HnSpaceAggregateModule,
    HnSpaceModule,
    HnSpaceUserModule,

    HnBrickAggregateModule,
    HnBrickVersionModule,
    HnBrickMajorVersionModule,
    HnBrickModule,
    HnFolderModule,
    HnTechnicalFolderModule,
    HnDocumentationModule,
    HnBrickUserModule,
    HnBrickUserInviteModule,
    HnFileDocumentationModule,
    HnFileAgentModule,
    HnFileAppModule,

    BlExternalApiModule,
    HnCoreConfigModule,
    HnCoreModule,
    HnCommunitySecurityModule,

    HnUserModule,
  ],
  controllers: [HnAgentController, HnAgentForLabController, HnTempLiveTaskController],
  providers: [
    HnAgentAggregateService,
    HnAgentSecurity,
    HnSpaceAggregateService,
    HnBrickAggregateService,
    HnAgentForLabController,
    HnAgentListener,
  ],
  exports: [HnAgentAggregateService],
})
export class HnAgentAggregateModule {}
