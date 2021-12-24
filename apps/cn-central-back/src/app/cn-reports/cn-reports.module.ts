import {forwardRef, Module} from '@nestjs/common';
import {CnReportsService} from './cn-reports.service';
import {CnReportsController} from './cn-reports.controller';
import {CnCoreModule} from '../cn-core/cn-core.module';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnReport} from './cn-report.entity';
import {CnExperimentsModule} from '../cn-experiments/cn-experiments.module';
import {CnReportsSecurityLayer} from './cn-reports-security.layer';
import {CnProjectsModule} from '../cn-projects/cn-projects.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnReport]),

    CnCoreModule,
    CnProjectsModule,
    forwardRef(() => CnExperimentsModule),
  ],
  providers: [CnReportsService, CnReportsSecurityLayer],
  controllers: [CnReportsController],
  exports: [CnReportsSecurityLayer, CnReportsService]
})
export class CnReportsModule {
}
