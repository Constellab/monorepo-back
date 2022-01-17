import {Module} from '@nestjs/common';
import {HnBrickService} from './hn-brick.service';
import {HnBrickController} from './hn-brick.controller';
import {HnBrickVersionModule} from '../brick-version/hn-brick-version.module';
import {TypeOrmModule} from '@nestjs/typeorm';
import {HnBrick} from './hn-brick.entity';
import {HnBrickVersionService} from '../brick-version/hn-brick-version.service';
import {HnFolderService} from '../folder/hn-folder.service';
import {HnFolderModule} from '../folder/hn-folder.module';
import {HnDocumentationModule} from '../documentation/hn-documentation.module';
import {HnDocumentationService} from '../documentation/hn-documentation.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnBrick]), HnBrickVersionModule, HnFolderModule, HnDocumentationModule],
  exports: [TypeOrmModule],
  controllers: [HnBrickController],
  providers: [HnBrickService, HnBrickVersionService, HnFolderService, HnDocumentationService]
})
export class HnBrickModule {
}
