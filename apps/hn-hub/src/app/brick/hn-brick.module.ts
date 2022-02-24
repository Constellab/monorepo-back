import {Module} from '@nestjs/common';
import {HnBrickService} from './hn-brick.service';
import {HnBrickController} from './hn-brick.controller';
import {HnBrickVersionModule} from '../brick-version/hn-brick-version.module';
import {TypeOrmModule} from '@nestjs/typeorm';
import {HnBrick} from './hn-brick.entity';
import {HnFolderService} from '../folder/hn-folder.service';
import {HnFolderModule} from '../folder/hn-folder.module';
import {HnDocumentationModule} from '../documentation/hn-documentation.module';
import {HnDocumentationService} from '../documentation/hn-documentation.service';
import {HnBrickMajorVersionService} from '../brick-major-version/hn-brick-major-version.service';
import {HnBrickMajorVersionModule} from '../brick-major-version/hn-brick-major-version.module';
import {HnBrickVersionService} from '../brick-version/hn-brick-version.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnBrick]), HnBrickMajorVersionModule, HnBrickVersionModule, HnFolderModule, HnDocumentationModule],
  exports: [TypeOrmModule],
  controllers: [HnBrickController],
  providers: [HnBrickService, HnBrickMajorVersionService, HnBrickVersionService, HnFolderService, HnDocumentationService]
})
export class HnBrickModule {
}
