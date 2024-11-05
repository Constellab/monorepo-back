import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CnScenario } from './cn-scenario.entity';
import { CnScenariosService } from './cn-scenarios.service';
import { CnCoreModule } from '../../cn-core/cn-core.module';
import { CnLabConfigsModule } from '../../cn-lab-configs/cn-lab-configs.module';
import { CnUsersModule } from '../../cn-users/cn-users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnScenario]),

    CnCoreModule,

    // Other modules
    CnLabConfigsModule,
    CnUsersModule,
  ],
  providers: [CnScenariosService],
  exports: [CnScenariosService],
})
export class CnScenariosModule {}
