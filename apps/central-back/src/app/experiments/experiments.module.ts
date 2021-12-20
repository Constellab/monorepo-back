import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Experiment} from './experiment.entity';
import {ExperimentsController} from './experiments.controller';
import {ExperimentsService} from './experiments.service';
import {CoreModule} from '../core/core.module';
import {ExperimentStatusHistory} from './experiment-status-history.entity';
import {ExperimentsSecurityLayer} from './experiments-security-layer.service';
import {LabInstancesModule} from '../lab-instances/lab-instances.module';
import {ExternalLabApiModule} from '../external-lab-api/external-lab-api.module';
import {ProjectsModule} from '../projects/projects.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Experiment, ExperimentStatusHistory]),

    CoreModule,

    // Other modules
    ProjectsModule,
    LabInstancesModule,
    ExternalLabApiModule,
  ],
  controllers: [ExperimentsController],
  providers: [ExperimentsService, ExperimentsSecurityLayer],
  exports: [ExperimentsSecurityLayer]
})
export class ExperimentsModule {
}
