import { Module } from '@nestjs/common';
import { CnProjectsService } from './cn-projects.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CnCoreModule } from '../../cn-core/cn-core.module';
import { CnProject } from './cn-project.entity';
import { CnProjectBucketService } from './cn-project-bucket.service';
import { CnObjectStoragesModule } from '../../cn-object-storages/cn-object-storages.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnProject]),

    CnCoreModule,
    CnObjectStoragesModule
  ],
  providers: [
    CnProjectsService,
    CnProjectBucketService
  ],
  exports: [
    CnProjectsService,
    CnProjectBucketService
  ]
})
export class CnProjectsModule {
}
