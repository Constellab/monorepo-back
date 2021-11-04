import { Module } from '@nestjs/common';
import { DnFolderService } from './dn-folder.service';
import { DnFolderController } from './dn-folder.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DnFolder } from './dn-folder.entity';
import {DnVersionModule} from '../version/dn-version.module';
import {DnVersionService} from '../version/dn-version.service';

@Module({
  imports: [TypeOrmModule.forFeature([DnFolder]), DnVersionModule],
  exports: [TypeOrmModule],
  controllers: [DnFolderController],
  providers: [DnFolderService, DnVersionService]
})
export class DnFolderModule {}
