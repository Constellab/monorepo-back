import {Module} from '@nestjs/common';
import {HnStoryFileService} from './hn-story-file.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {HnStoryFile} from './hn-story-file.entity';
import {HnCoreModule} from '../core/hn-core.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HnStoryFile]),

    HnCoreModule
  ],
  exports: [
    TypeOrmModule
  ],
  providers: [
    HnStoryFileService
  ],
})
export class HnStoryFileModule {
}
