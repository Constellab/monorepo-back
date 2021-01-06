import {Module} from '@nestjs/common';
import {ProjectsController} from './projects.controller';
import {ProjectsService} from './projects.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CoreModule} from '../core/core.module';
import {Project} from './project.entity';
import {ProjectStatusHistory} from './project-status-history.entity';
import {ProjectsSecurityLayer} from './projects-security.layer';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, ProjectStatusHistory]),

    CoreModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectsSecurityLayer],
  exports: [
    ProjectsService,
    ProjectsSecurityLayer
  ]
})
export class ProjectsModule {
}
