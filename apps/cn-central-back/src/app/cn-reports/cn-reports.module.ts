import {Module} from '@nestjs/common';
import {CnReportsService} from './cn-reports.service';
import {CnReportsController} from './cn-reports.controller';
import {CnCoreModule} from '../cn-core/cn-core.module';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Report} from './cn-report.entity';
import {CnExperimentsModule} from '../cn-experiments/cn-experiments.module';
import {CnReportsSecurityLayer} from './cn-reports-security.layer';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report]),

    CnCoreModule,
    CnExperimentsModule,
  ],
  providers: [CnReportsService, CnReportsSecurityLayer],
  controllers: [CnReportsController],
  exports: [CnReportsSecurityLayer]
})
export class CnReportsModule {
}
