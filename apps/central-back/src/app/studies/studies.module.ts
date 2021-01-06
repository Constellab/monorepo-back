import {Module} from '@nestjs/common';
import {StudiesController} from './studies.controller';
import {StudiesService} from './studies.service';
import {CoreModule} from '../core/core.module';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Study} from './study.entity';
import {StudiesSecurityLayer} from './studies-security.layer';
import {ProjectsModule} from '../projects/projects.module';
import {StudyStatusHistory} from './study-status-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Study, StudyStatusHistory]),

    CoreModule,

    ProjectsModule,
  ],
  controllers: [StudiesController],
  providers: [StudiesService, StudiesSecurityLayer],
  exports: [StudiesService, StudiesSecurityLayer]
})
export class StudiesModule {
}
