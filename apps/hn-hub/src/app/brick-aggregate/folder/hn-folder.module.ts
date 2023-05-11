import {Module} from '@nestjs/common';
import {HnFolderService} from './hn-folder.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {HnFolder} from './hn-folder.entity';
import {HnDocumentationModule} from '../documentation/hn-documentation.module';
import {HnCoreModule} from '../../core/hn-core.module';

@Module({
  imports: [TypeOrmModule.forFeature([HnFolder]), HnDocumentationModule, HnCoreModule],
  exports: [TypeOrmModule, HnFolderService],
  providers: [HnFolderService]
})
export class HnFolderModule {
}

