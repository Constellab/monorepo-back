import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnBrickVersionReferenceModule } from '../../brick-version-reference/hn-brick-version-reference.module';
import { HnBrickVersionReferenceService } from '../../brick-version-reference/hn-brick-version-reference.service';
import { HnCoreModule } from '../../core/hn-core.module';
import { HnProtocolModule } from '../../protocol/hn-protocol.module';
import { HnProtocolService } from '../../protocol/hn-protocol.service';
import { HnResourceModule } from '../../resource/hn-resource.module';
import { HnResourceService } from '../../resource/hn-resource.service';
import { HnSpaceUserModule } from '../../space-aggregate/space-user/hn-space-user.module';
import { HnTaskModule } from '../../task/hn-task.module';
import { HnTaskService } from '../../task/hn-task.service';
import { HnTechnicalDocOtherClassModule } from '../../technical-doc-other-class/hn-technical-doc-other-class.module';
import { HnTechnicalFolderModule } from '../../technical-folder/hn-technical-folder.module';
import { HnTechnicalFolderService } from '../../technical-folder/hn-technical-folder.service';
import { HnUserModule } from '../../users/hn-user.module';
import { HnUserService } from '../../users/hn-user.service';
import { HnBrickMajorVersionModule } from '../brick-major-version/hn-brick-major-version.module';
import { HnBrickVersionModule } from '../brick-version/hn-brick-version.module';
import { HnDocumentationModule } from '../documentation/hn-documentation.module';
import { HnFolderModule } from '../folder/hn-folder.module';
import { HnBrickEntity } from './hn-brick.entity';
import { HnBrickService } from './hn-brick.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([HnBrickEntity]),
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
    HnUserModule,
    HnSpaceUserModule,
    HnTechnicalDocOtherClassModule,
  ],
  exports: [TypeOrmModule, HnBrickService],
  providers: [
    HnBrickService,
    HnTechnicalFolderService,
    HnResourceService,
    HnTaskService,
    HnProtocolService,
    HnBrickVersionReferenceService,
    HnUserService,
  ],
})
export class HnBrickModule {}
