import {Module} from '@nestjs/common';
import {CnProjectBucketService} from './cn-project-bucket.service';
import {CnObjectStoragesModule} from '../../cn-object-storages/cn-object-storages.module';


@Module({
  imports: [
    CnObjectStoragesModule
  ],
  providers: [CnProjectBucketService],
  exports: [CnProjectBucketService]
})
export class CnProjectBucketModule {

}
