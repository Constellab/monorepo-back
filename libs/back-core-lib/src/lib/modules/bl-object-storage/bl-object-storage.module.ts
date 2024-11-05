import { Global, Module } from '@nestjs/common';
import { BlObjectStorageService } from './bl-object-storage.service';
import { BlExternalApiModule } from '../bl-external-api/bl-external-api.module';

@Global()
@Module({
  imports: [BlExternalApiModule],
  providers: [BlObjectStorageService],
  exports: [BlObjectStorageService],
})
export class BlObjectStorageModule {}
