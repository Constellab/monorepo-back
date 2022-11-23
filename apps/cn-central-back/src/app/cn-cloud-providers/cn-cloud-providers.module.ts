import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnCloudProvider} from './cn-cloud-provider.entity';
import {CnCoreModule} from '../cn-core/cn-core.module';
import {CnCloudProvidersService} from './cn-cloud-providers.service';
import {CnCloudProvidersController} from './cn-cloud-providers.controller';
import {CnCloudProvidersSecurity} from './cn-cloud-providers.security';


@Module({
  imports: [
    TypeOrmModule.forFeature([CnCloudProvider]),

    CnCoreModule,
  ],
  providers: [
    CnCloudProvidersService,
    CnCloudProvidersSecurity,
  ],
  controllers: [
    CnCloudProvidersController
  ],
})
export class CnCloudProvidersModule {

}
