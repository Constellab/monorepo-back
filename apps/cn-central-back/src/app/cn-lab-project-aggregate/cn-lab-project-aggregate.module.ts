import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CnCoreModule } from '../cn-core/cn-core.module';
import { CnExternalLabApiModule } from '../cn-external-lab-api/cn-external-lab-api.module';
import { CnProjectsAggregateModule } from '../cn-projects-aggregate/cn-project-aggregate.module';
import { CnLabProjectAggregateService } from './cn-lab-project-aggregate.service';
import { CnLabInstancesModule } from '../cn-lab-instances/cn-lab-instances.module';
import { CnLabProjectListener } from './cn-lab-project.listener';
import { CnLabProjectService } from './cn-lab-project.service';
import { CnLabProject } from './cn-lab-project.entity';
import { CnProjectsModule } from '../cn-projects-aggregate/cn-projects/cn-projects.module';
import { CnLabProjectController } from './cn-lab-project.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnLabProject]),

    CnCoreModule,
    CnExternalLabApiModule,

    CnProjectsAggregateModule,
    CnLabInstancesModule,
    CnProjectsModule
  ],
  providers: [
    CnLabProjectAggregateService,
    CnLabProjectListener,
    CnLabProjectService
  ],
  exports: [
    CnLabProjectAggregateService
  ],
  controllers: [CnLabProjectController]
})
export class CnLabProjectAggregateModule {
}
