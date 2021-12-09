import { Module } from '@nestjs/common';
import { DnFolderService } from './dn-folder.service';
import { DnFolderController } from './dn-folder.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DnFolder } from './dn-folder.entity';
import {DnDocumentationService} from '../documentation/dn-documentation.service';
import {DnDocumentationModule} from '../documentation/dn-documentation.module';
import {forwardRef} from '@angular/core';

@Module({
  imports: [TypeOrmModule.forFeature([DnFolder]), DnDocumentationModule],
  exports: [TypeOrmModule],
  controllers: [DnFolderController],
  providers: [DnFolderService, DnDocumentationService]
})
export class DnFolderModule {}

