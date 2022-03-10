import {Module} from '@nestjs/common';
import {CnReportsService} from './cn-reports.service';
import {CnCoreModule} from '../../cn-core/cn-core.module';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnReport} from './cn-report.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnReport]),

    CnCoreModule,
  ],
  providers: [CnReportsService],
  exports: [CnReportsService]
})
export class CnReportsModule {
}
