import {Module} from '@nestjs/common';
import {HnLiveTaskModule} from './live-task/hn-live-task.module';
import {HnLiveTaskVersionModule} from './live-task-version/hn-live-task-version.module';
import {HnLiveTaskController} from './hn-live-task.controller';
import {HnLiveTaskAggregateService} from './hn-live-task-aggregate.service';
import {HnSpaceAggregateModule} from '../space-aggregate/hn-space-aggregate.module';
import {HnSpaceAggregateService} from '../space-aggregate/hn-space-aggregate.service';
import {HnSpaceModule} from '../space-aggregate/space/hn-space.module';
import {HnSpaceUserModule} from '../space-aggregate/space-user/hn-space-user.module';
import {HnUserModule} from '../users/hn-user.module';
import {
  HnLiveTaskVersionBrickDependenciesModule
} from './live-task-version-brick-dependencies/hn-live-task-version-brick-dependencies.module';
import {HnBrickAggregateModule} from '../brick-aggregate/hn-brick-aggregate.module';
import {HnBrickAggregateService} from '../brick-aggregate/hn-brick-aggregate.service';
import {HnBrickVersionModule} from '../brick-aggregate/brick-version/hn-brick-version.module';
import {HnBrickMajorVersionModule} from '../brick-aggregate/brick-major-version/hn-brick-major-version.module';
import {HnBrickModule} from '../brick-aggregate/brick/hn-brick.module';
import {HnFolderModule} from '../brick-aggregate/folder/hn-folder.module';
import {HnDocumentationModule} from '../brick-aggregate/documentation/hn-documentation.module';
import {HnBrickUserModule} from '../brick-aggregate/brick-user/hn-brick-user.module';
import {HnBrickUserInviteModule} from '../brick-aggregate/brick-user-invite/hn-brick-user-invite.module';

@Module({
  imports: [
    HnLiveTaskModule,
    HnLiveTaskVersionModule,
    HnLiveTaskVersionBrickDependenciesModule,
    HnSpaceAggregateModule,
    HnSpaceModule,
    HnSpaceUserModule,

    HnBrickAggregateModule,
    HnBrickVersionModule,
    HnBrickMajorVersionModule,
    HnBrickModule,
    HnFolderModule,
    HnDocumentationModule,
    HnBrickUserModule,
    HnBrickUserInviteModule,

    HnUserModule
  ],
  controllers: [HnLiveTaskController],
  providers: [HnLiveTaskAggregateService, HnSpaceAggregateService, HnBrickAggregateService],
  exports: [HnLiveTaskAggregateService]
})
export class HnLiveTaskAggregateModule {

}
