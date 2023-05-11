import {Module} from '@nestjs/common';
import {HnBrickService} from './hn-brick.service';
import {HnBrickVersionModule} from '../brick-version/hn-brick-version.module';
import {TypeOrmModule} from '@nestjs/typeorm';
import {HnBrick} from './hn-brick.entity';
import {HnFolderModule} from '../folder/hn-folder.module';
import {HnDocumentationModule} from '../documentation/hn-documentation.module';
import {HnBrickMajorVersionModule} from '../brick-major-version/hn-brick-major-version.module';
import {HnCoreModule} from '../../core/hn-core.module';
import {HnTechnicalFolderModule} from '../../technical-folder/hn-technical-folder.module';
import {HnTechnicalFolderService} from '../../technical-folder/hn-technical-folder.service';
import {HnResourceModule} from '../../resource/hn-resource.module';
import {HnResourceService} from '../../resource/hn-resource.service';
import {HnTaskService} from '../../task/hn-task.service';
import {HnTaskModule} from '../../task/hn-task.module';
import {HnProtocolService} from '../../protocol/hn-protocol.service';
import {HnProtocolModule} from '../../protocol/hn-protocol.module';
import {HnBrickVersionReferenceModule} from '../../brick-version-reference/hn-brick-version-reference.module';
import {HnBrickVersionReferenceService} from '../../brick-version-reference/hn-brick-version-reference.service';
import {HnUserService} from '../../users/hn-user.service';
import {HnUserModule} from '../../users/hn-user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HnBrick]),
    HnBrickMajorVersionModule,
    HnBrickVersionModule,
    HnFolderModule,
    HnDocumentationModule,
    HnCoreModule,
    HnTechnicalFolderModule,
    HnResourceModule,
    HnTaskModule,
    HnProtocolModule,
    HnBrickVersionReferenceModule,
    HnUserModule
  ],
  exports: [TypeOrmModule, HnBrickService],
  providers: [HnBrickService, HnTechnicalFolderService, HnResourceService,
    HnTaskService, HnProtocolService, HnBrickVersionReferenceService, HnUserService]
})
export class HnBrickModule {
}
