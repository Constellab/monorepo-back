import {Module} from '@nestjs/common';
import {CnReportsService} from './cn-reports.service';
import {CnCoreModule} from '../../cn-core/cn-core.module';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnReport} from './cn-report.entity';
import {CnExternalLabApiModule} from '../../cn-external-lab-api/cn-external-lab-api.module';
import {CnLabConfigsModule} from '../../cn-lab-configs/cn-lab-configs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnReport]),

    CnCoreModule,
    CnExternalLabApiModule,
    CnLabConfigsModule,
  ],
  providers: [CnReportsService],
  exports: [CnReportsService]
})
export class CnReportsModule {
}
