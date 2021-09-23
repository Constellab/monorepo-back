import {HttpModule, Module} from '@nestjs/common';
import {BlExternalApiService} from './bl-external-api.service';
import {BlExternalApiErrorService} from './bl-external-api-error.service';

@Module({
  imports: [HttpModule],
  providers: [BlExternalApiService, BlExternalApiErrorService],
  exports: [BlExternalApiService, BlExternalApiErrorService]
})
export class BlExternalApiModule {
}
