import {Global, Module} from '@nestjs/common';
import {BlObjectStorageService} from './bl-object-storage.service';

@Global()
@Module({
  providers: [BlObjectStorageService],
  exports: [BlObjectStorageService]
})
export class BlObjectStorageModule {
}
