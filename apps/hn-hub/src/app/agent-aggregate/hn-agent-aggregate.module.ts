import { Module } from '@nestjs/common';
import { HnAgentModule } from './agent/hn-agent.module';
import { HnAgentVersionModule } from './agent-version/hn-agent-version.module';
import { HnAgentController } from './hn-agent.controller';
import { HnAgentAggregateService } from './hn-agent-aggregate.service';
import { HnSpaceAggregateModule } from '../space-aggregate/hn-space-aggregate.module';
import { HnSpaceAggregateService } from '../space-aggregate/hn-space-aggregate.service';
import { HnSpaceModule } from '../space-aggregate/space/hn-space.module';
import { HnSpaceUserModule } from '../space-aggregate/space-user/hn-space-user.module';
import { HnUserModule } from '../users/hn-user.module';
import { HnAgentVersionBrickDependenciesModule } from './agent-version-brick-dependencies/hn-agent-version-brick-dependencies.module';
import { HnBrickAggregateModule } from '../brick-aggregate/hn-brick-aggregate.module';
import { HnBrickAggregateService } from '../brick-aggregate/hn-brick-aggregate.service';
import { HnBrickVersionModule } from '../brick-aggregate/brick-version/hn-brick-version.module';
import { HnBrickMajorVersionModule } from '../brick-aggregate/brick-major-version/hn-brick-major-version.module';
import { HnBrickModule } from '../brick-aggregate/brick/hn-brick.module';
import { HnFolderModule } from '../brick-aggregate/folder/hn-folder.module';
import { HnDocumentationModule } from '../brick-aggregate/documentation/hn-documentation.module';
import { HnBrickUserModule } from '../brick-aggregate/brick-user/hn-brick-user.module';
import { HnBrickUserInviteModule } from '../brick-aggregate/brick-user-invite/hn-brick-user-invite.module';
import { BlExternalApiModule } from '@monorepo/back-core-lib';
import { HnCoreConfigModule } from '../core/modules/core-config/hn-core-config.module';
import { HnCoreModule } from '../core/hn-core.module';
import { HnTechnicalFolderModule } from '../technical-folder/hn-technical-folder.module';
import { HnAgentCoAuthorModule } from './agent-co-author/hn-agent-co-author.module';
import { HnAgentCoAuthorInviteModule } from './agent-co-author-invite/hn-agent-co-author-invite.module';
import { HnFileDocumentationModule } from '../file-aggregate/file-documentation/hn-file-documentation.module';
import { HnFileAgentModule } from '../file-aggregate/file-agent/hn-file-agent.module';
import { HnTempLiveTaskController } from './hn-temp-live-task.controller';
import { HnAgentForLabController } from './hn-agent-for-lab.controller';
import { HnFileAppModule } from '../file-aggregate/file-app/hn-file-app.module';
import { HnAgentListener } from './hn-agent.listener';

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

    HnUserModule,
  ],
  controllers: [HnAgentController, HnAgentForLabController, HnTempLiveTaskController],
  providers: [
    HnAgentAggregateService,
    HnSpaceAggregateService,
    HnBrickAggregateService,
    HnAgentForLabController,
    HnAgentListener,
  ],
  exports: [HnAgentAggregateService],
})
export class HnAgentAggregateModule {}
