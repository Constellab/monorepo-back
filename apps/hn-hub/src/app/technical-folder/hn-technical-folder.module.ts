import {Module} from '@nestjs/common';
import {HnTechnicalFolderService} from './hn-technical-folder.service';
import {HnTechnicalFolderController} from './hn-technical-folder.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {HnTechnicalFolder} from './hn-technical-folder.entity';
import {HnResourceModule} from '../resource/hn-resource.module';
import {HnResourceService} from '../resource/hn-resource.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnTechnicalFolder]), HnResourceModule],
  controllers: [HnTechnicalFolderController],
  exports: [TypeOrmModule],
  providers: [HnTechnicalFolderService, HnResourceService],
})
export class HnTechnicalFolderModule {
}
