import { Module } from '@nestjs/common';
import { DnFolderService } from './dn-folder.service';
import { DnFolderController } from './dn-folder.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DnFolder } from './dn-folder.entity';
import {DnVersionModule} from '../version/dn-version.module';
import {DnVersionService} from '../version/dn-version.service';
import {DnDocumentationService} from '../documentation/dn-documentation.service';
import {DnDocumentationModule} from '../documentation/dn-documentation.module';
import {forwardRef} from '@angular/core';

@Module({
  imports: [TypeOrmModule.forFeature([DnFolder]), DnVersionModule, DnDocumentationModule],
  exports: [TypeOrmModule],
  controllers: [DnFolderController],
  providers: [DnFolderService, DnVersionService, DnDocumentationService]
})
export class DnFolderModule {}

