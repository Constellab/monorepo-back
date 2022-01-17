import { Module } from '@nestjs/common';
import { HnBrickVersionService } from './hn-brick-version.service';
import { HnBrickVersionController } from './hn-brick-version.controller';
import {HnFolderModule} from '../folder/hn-folder.module';
import {HnFolderService} from '../folder/hn-folder.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {HnBrickVersion} from './hn-brick-version.entity';
import {HnDocumentationService} from '../documentation/hn-documentation.service';
import {HnDocumentationModule} from '../documentation/hn-documentation.module';

@Module({
  imports: [TypeOrmModule.forFeature([HnBrickVersion]), HnFolderModule, HnDocumentationModule],
  exports: [TypeOrmModule],
  controllers: [HnBrickVersionController],
  providers: [HnBrickVersionService, HnFolderService, HnDocumentationService]
})
export class HnBrickVersionModule {}
