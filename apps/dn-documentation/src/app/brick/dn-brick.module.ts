import {Module} from '@nestjs/common';
import {DnBrickService} from './dn-brick.service';
import {DnBrickController} from './dn-brick.controller';
import {DnBrickVersionModule} from '../brick-version/dn-brick-version.module';
import {TypeOrmModule} from '@nestjs/typeorm';
import {DnBrick} from './dn-brick.entity';
import {DnBrickVersionService} from '../brick-version/dn-brick-version.service';
import {DnFolderService} from '../folder/dn-folder.service';
import {DnFolderModule} from '../folder/dn-folder.module';
import {DnDocumentationModule} from '../documentation/dn-documentation.module';
import {DnDocumentationService} from '../documentation/dn-documentation.service';

@Module({
  imports: [TypeOrmModule.forFeature([DnBrick]), DnBrickVersionModule, DnFolderModule, DnDocumentationModule],
  exports: [TypeOrmModule],
  controllers: [DnBrickController],
  providers: [DnBrickService, DnBrickVersionService, DnFolderService, DnDocumentationService]
})
export class DnBrickModule {
}
