import {Module} from '@nestjs/common';
import {ReportsService} from './reports.service';
import {ReportsController} from './reports.controller';
import {CoreModule} from '../core/core.module';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Report} from './report.entity';
import {ExperimentsModule} from '../experiments/experiments.module';
import {ReportsSecurityLayer} from './reports-security.layer';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report]),

    CoreModule,
    ExperimentsModule,
  ],
  providers: [ReportsService, ReportsSecurityLayer],
  controllers: [ReportsController],
  exports: [ReportsSecurityLayer]
})
export class ReportsModule {
}
