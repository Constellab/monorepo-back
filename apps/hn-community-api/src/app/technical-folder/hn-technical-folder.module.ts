import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnProtocolModule } from '../protocol/hn-protocol.module';
import { HnProtocolService } from '../protocol/hn-protocol.service';
import { HnResourceModule } from '../resource/hn-resource.module';
import { HnResourceService } from '../resource/hn-resource.service';
import { HnTaskModule } from '../task/hn-task.module';
import { HnTaskService } from '../task/hn-task.service';
import { HnTechnicalDocOtherClassModule } from '../technical-doc-other-class/hn-technical-doc-other-class.module';
import { HnTechnicalFolderController } from './hn-technical-folder.controller';
import { HnTechnicalFolder } from './hn-technical-folder.entity';
import { HnTechnicalFolderService } from './hn-technical-folder.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([HnTechnicalFolder]),
    HnTechnicalDocOtherClassModule,
    HnResourceModule,
    HnTaskModule,
    HnProtocolModule,
  ],
  controllers: [HnTechnicalFolderController],
  providers: [HnTechnicalFolderService, HnResourceService, HnTaskService, HnProtocolService],
  exports: [TypeOrmModule, HnTechnicalFolderService],
})
export class HnTechnicalFolderModule {}
