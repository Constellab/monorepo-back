import {Module} from "@nestjs/common";
import {HnBrickController} from './hn-brick.controller';
import {HnBrickModule} from './brick/hn-brick.module';
import {HnBrickMajorVersionModule} from './brick-major-version/hn-brick-major-version.module';
import {HnBrickVersionController} from './hn-brick-version.controller';
import {HnBrickVersionModule} from './brick-version/hn-brick-version.module';
import {HnBrickAggregateService} from './hn-brick-aggregate.service';
import {HnFolderController} from './hn-folder.controller';
import {HnFolderModule} from './folder/hn-folder.module';
import {HnDocumentationController} from './hn-documentation.controller';
import {HnDocumentationModule} from './documentation/hn-documentation.module';
import {HnBrickUserModule} from './brick-user/hn-brick-user.module';
import {HnBrickUserInviteModule} from './brick-user-invite/hn-brick-user-invite.module';
import {HnTechnicalFolderModule} from '../technical-folder/hn-technical-folder.module';
import {HnCoreConfigModule} from '../core/modules/core-config/hn-core-config.module';
import {HnSpaceUserModule} from '../space-aggregate/space-user/hn-space-user.module';
import {HnCoreModule} from '../core/hn-core.module';
import {HnSpaceAggregateModule} from '../space-aggregate/hn-space-aggregate.module';
import {HnUserModule} from '../users/hn-user.module';
import {HnFileDocumentationModule} from '../file-aggregate/file-documentation/hn-file-documentation.module';

@Module({
  imports: [
    HnCoreModule,
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
    HnFileDocumentationModule
  ],
  controllers: [
    HnBrickController,
    HnBrickVersionController,
    HnFolderController,
    HnDocumentationController
  ],
  providers: [HnBrickAggregateService],
  exports: [HnBrickAggregateService]
})
export class HnBrickAggregateModule {
}
