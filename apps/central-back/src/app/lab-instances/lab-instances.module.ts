import {Module} from '@nestjs/common';
import {LabInstancesService} from './lab-instances.service';
import {LabInstancesController} from './lab-instances.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {LabInstance} from './lab-instance.entity';
import {CoreModule} from '../core/core.module';
import {LabInstanceStatusHistory} from './lab-instance-status-history.entity';
import {LabInstancesSecurityLayer} from './lab-instances-security-layer.service';
import {ExternalLabApiModule} from '../external-lab-api/external-lab-api.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LabInstance, LabInstanceStatusHistory]),

    CoreModule,
    ExternalLabApiModule,
  ],
  providers: [LabInstancesService, LabInstancesSecurityLayer],
  controllers: [LabInstancesController],
  exports: [LabInstancesService, LabInstancesSecurityLayer]
})
export class LabInstancesModule {
}
