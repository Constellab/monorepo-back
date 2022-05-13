import {Module} from '@nestjs/common';
import {HnTechnicalFolderService} from './hn-technical-folder.service';
import {HnTechnicalFolderController} from './hn-technical-folder.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {HnTechnicalFolder} from './hn-technical-folder.entity';
import {HnResourceModule} from '../resource/hn-resource.module';
import {HnResourceService} from '../resource/hn-resource.service';
import {HnTaskModule} from '../task/hn-task.module';
import {HnTaskService} from '../task/hn-task.service';
import {HnProtocolService} from '../protocol/hn-protocol.service';
import {HnProtocolModule} from '../protocol/hn-protocol.module';

@Module({
  imports: [TypeOrmModule.forFeature([HnTechnicalFolder]), HnResourceModule, HnTaskModule, HnProtocolModule],
  controllers: [HnTechnicalFolderController],
  exports: [TypeOrmModule],
  providers: [HnTechnicalFolderService, HnResourceService, HnTaskService, HnProtocolService],
})
export class HnTechnicalFolderModule {
}
