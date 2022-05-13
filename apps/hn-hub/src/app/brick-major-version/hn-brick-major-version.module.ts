import {Module} from '@nestjs/common';
import {HnBrickMajorVersionService} from './hn-brick-major-version.service';
import {HnBrickMajorVersionController} from './hn-brick-major-version.controller';
import {HnFolderModule} from '../folder/hn-folder.module';
import {HnFolderService} from '../folder/hn-folder.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {HnBrickMajorVersion} from './hn-brick-major-version.entity';
import {HnDocumentationService} from '../documentation/hn-documentation.service';
import {HnDocumentationModule} from '../documentation/hn-documentation.module';
import {HnBrickVersionModule} from '../brick-version/hn-brick-version.module';
import {HnBrickVersionService} from '../brick-version/hn-brick-version.service';
import {HnCoreModule} from '../core/hn-core.module';
import {HnTechnicalFolderModule} from '../technical-folder/hn-technical-folder.module';
import {HnTechnicalFolderService} from '../technical-folder/hn-technical-folder.service';
import {HnResourceModule} from '../resource/hn-resource.module';
import {HnResourceService} from '../resource/hn-resource.service';
import {HnTaskService} from '../task/hn-task.service';
import {HnTaskModule} from '../task/hn-task.module';
import {HnProtocolService} from '../protocol/hn-protocol.service';
import {HnProtocolModule} from '../protocol/hn-protocol.module';

@Module({
  imports: [TypeOrmModule.forFeature([HnBrickMajorVersion]),
    HnBrickVersionModule, HnFolderModule, HnDocumentationModule,
    HnCoreModule, HnTechnicalFolderModule, HnResourceModule, HnTaskModule, HnProtocolModule],
  exports: [TypeOrmModule],
  controllers: [HnBrickMajorVersionController],
  providers: [HnBrickMajorVersionService, HnBrickVersionService, HnFolderService,
    HnDocumentationService, HnTechnicalFolderService, HnResourceService,
    HnTaskService, HnProtocolService]
})
export class HnBrickMajorVersionModule {
}
