import {Module} from '@nestjs/common';
import {CnProjectsController} from './cn-projects.controller';
import {CnProjectsService} from './cn-projects.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnCoreModule} from '../cn-core/cn-core.module';
import {CnProject} from './cn-project.entity';
import {CnProjectStatusHistory} from './cn-project-status-history.entity';
import {CnProjectsSecurityLayer} from './cn-projects-security.layer';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnProject, CnProjectStatusHistory]),

    CnCoreModule,
  ],
  controllers: [CnProjectsController],
  providers: [CnProjectsService, CnProjectsSecurityLayer],
  exports: [
    CnProjectsService,
    CnProjectsSecurityLayer
  ]
})
export class CnProjectsModule {
}
