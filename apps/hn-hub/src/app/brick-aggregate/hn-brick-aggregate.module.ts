import { Module } from "@nestjs/common";
import {HnBrickController} from './hn-brick.controller';
import {HnBrickModule} from './brick/hn-brick.module';
import {HnBrickMajorVersionModule} from './brick-major-version/hn-brick-major-version.module';
import {HnBrickVersionController} from './hn-brick-version.controller';
import {HnBrickVersionModule} from './brick-version/hn-brick-version.module';
import {HnBrickAggregateService} from './hn-brick-aggregate.service';
import {HnFolderController} from './hn-folder.controller';
import {HnFolderModule} from './folder/hn-folder.module';
import {HnDocumentationController} from './hn-documentation.controller';
import {HnDocumentationModule} from './documentation/hn-documentation.module';

@Module({
  imports: [HnBrickModule, HnBrickMajorVersionModule, HnBrickVersionModule, HnFolderModule, HnDocumentationModule],
  controllers: [HnBrickController, HnBrickVersionController, HnFolderController, HnDocumentationController],
  providers: [HnBrickAggregateService],
  exports: [HnBrickAggregateService]
})
export class HnBrickAggregateModule {
}
