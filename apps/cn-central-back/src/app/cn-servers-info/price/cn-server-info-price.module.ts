import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnCoreModule} from '../../cn-core/cn-core.module';
import {CnServerInfoPrice} from './cn-server-info-price.entity';
import {CnServerInfoPriceService} from './cn-server-info-price.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnServerInfoPrice]),

    CnCoreModule,
  ],
  providers: [CnServerInfoPriceService],
  exports: [CnServerInfoPriceService],
})
export class CnServerInfoPriceModule {
}
