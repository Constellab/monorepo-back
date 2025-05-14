import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CnScenarioEntity } from './cn-scenario.entity';
import { CnScenariosService } from './cn-scenarios.service';
import { CnCoreModule } from '../../cn-core/cn-core.module';
import { CnLabConfigsModule } from '../../cn-lab-configs/cn-lab-configs.module';
import { CnUsersModule } from '../../cn-users/cn-users.module';
import { CnHierarchyObjectModule } from '../cn-hierarchy-objects/cn-hierarchy-object.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnScenarioEntity]),

    CnCoreModule,

    // Other modules
    CnLabConfigsModule,
    CnUsersModule,
    CnHierarchyObjectModule,
  ],
  providers: [CnScenariosService],
  exports: [CnScenariosService],
})
export class CnScenariosModule {}
