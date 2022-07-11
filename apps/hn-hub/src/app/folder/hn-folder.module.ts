import {Module} from '@nestjs/common';
import {HnFolderService} from './hn-folder.service';
import {HnFolderController} from './hn-folder.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {HnFolder} from './hn-folder.entity';
import {HnDocumentationService} from '../documentation/hn-documentation.service';
import {HnDocumentationModule} from '../documentation/hn-documentation.module';
import {HnCoreModule} from '../core/hn-core.module';

@Module({
  imports: [TypeOrmModule.forFeature([HnFolder]), HnDocumentationModule, HnCoreModule],
  exports: [TypeOrmModule],
  controllers: [HnFolderController],
  providers: [HnFolderService, HnDocumentationService]
})
export class HnFolderModule {
}

