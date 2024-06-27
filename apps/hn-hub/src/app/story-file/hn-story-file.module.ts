import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {HnStoryFile} from './hn-story-file.entity';
import {HnCoreModule} from '../core/hn-core.module';
import {HnStoryFileService} from './hn-story-file.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([HnStoryFile]),
    HnCoreModule,
  ],
  exports: [TypeOrmModule, HnStoryFileService],
  providers: [HnStoryFileService],
})
export class HnStoryFileModule {

}
