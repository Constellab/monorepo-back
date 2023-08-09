import {Module} from '@nestjs/common';
import {CnProjectsService} from './cn-projects.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnCoreModule} from '../../cn-core/cn-core.module';
import {CnProject} from './cn-project.entity';
import {CnProjectStatusHistory} from './cn-project-status-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnProject, CnProjectStatusHistory]),

    CnCoreModule,
  ],
  providers: [
    CnProjectsService,
  ],
  exports: [
    CnProjectsService,
  ]
})
export class CnProjectsModule {
}
