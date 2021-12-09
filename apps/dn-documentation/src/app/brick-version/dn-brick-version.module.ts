import { Module } from '@nestjs/common';
import { DnBrickVersionService } from './dn-brick-version.service';
import { DnBrickVersionController } from './dn-brick-version.controller';
import {DnFolderModule} from '../folder/dn-folder.module';
import {DnFolderService} from '../folder/dn-folder.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {DnBrickVersion} from './dn-brick-version.entity';
import {DnDocumentationService} from '../documentation/dn-documentation.service';
import {DnDocumentationModule} from '../documentation/dn-documentation.module';

@Module({
  imports: [TypeOrmModule.forFeature([DnBrickVersion]), DnFolderModule, DnDocumentationModule],
  exports: [TypeOrmModule],
  controllers: [DnBrickVersionController],
  providers: [DnBrickVersionService, DnFolderService, DnDocumentationService]
})
export class DnBrickVersionModule {}
