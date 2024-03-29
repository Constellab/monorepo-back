import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnCoreModule} from '../../cn-core/cn-core.module';
import {CnServerPrice} from './cn-server-price.entity';
import {CnServerPriceService} from './cn-server-price.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnServerPrice]),

    CnCoreModule,
  ],
  providers: [CnServerPriceService],
  exports: [CnServerPriceService],
})
export class CnServerPriceModule {
}
