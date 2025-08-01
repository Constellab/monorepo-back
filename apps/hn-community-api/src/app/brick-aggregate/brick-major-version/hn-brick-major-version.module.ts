import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnBrickVersionReferenceModule } from '../../brick-version-reference/hn-brick-version-reference.module';
import { HnBrickVersionReferenceService } from '../../brick-version-reference/hn-brick-version-reference.service';
import { HnCoreModule } from '../../core/hn-core.module';
import { HnProtocolModule } from '../../protocol/hn-protocol.module';
import { HnProtocolService } from '../../protocol/hn-protocol.service';
import { HnResourceModule } from '../../resource/hn-resource.module';
import { HnResourceService } from '../../resource/hn-resource.service';
import { HnTaskModule } from '../../task/hn-task.module';
import { HnTaskService } from '../../task/hn-task.service';
import { HnTechnicalDocOtherClassModule } from '../../technical-doc-other-class/hn-technical-doc-other-class.module';
import { HnTechnicalFolderModule } from '../../technical-folder/hn-technical-folder.module';
import { HnTechnicalFolderService } from '../../technical-folder/hn-technical-folder.service';
import { HnUserModule } from '../../users/hn-user.module';
import { HnUserService } from '../../users/hn-user.service';
import { HnBrickVersionModule } from '../brick-version/hn-brick-version.module';
import { HnDocumentationModule } from '../documentation/hn-documentation.module';
import { HnFolderModule } from '../folder/hn-folder.module';
import { HnBrickMajorVersion } from './hn-brick-major-version.entity';
import { HnBrickMajorVersionService } from './hn-brick-major-version.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([HnBrickMajorVersion]),
    HnBrickVersionModule,
    HnFolderModule,
    HnDocumentationModule,
    HnTechnicalDocOtherClassModule,
    HnCoreModule,
    HnTechnicalFolderModule,
    HnResourceModule,
    HnTaskModule,
    HnProtocolModule,
    HnBrickVersionReferenceModule,
    HnUserModule,
  ],
  exports: [TypeOrmModule, HnBrickMajorVersionService],
  providers: [
    HnBrickMajorVersionService,
    HnTechnicalFolderService,
    HnResourceService,
    HnTaskService,
    HnProtocolService,
    HnBrickVersionReferenceService,
    HnUserService,
  ],
})
export class HnBrickMajorVersionModule {}
