import { BlBaseEntityDto } from '@monorepo/back-core-lib';
import { CnCloudProvider } from '../cn-cloud-providers/cn-cloud-provider.entity';
import { CnSpace } from '../cn-spaces/cn-space.entity';

export class CnBucketCredentialsFull extends BlBaseEntityDto {
  name: string = undefined;
  accessKeyId: string = undefined;
  secretAccessKey: string = undefined;
  cloudProvider: CnCloudProvider = undefined;
  space: CnSpace = undefined;
  s3Username: string = undefined;
  shortDescription: string = undefined;
}
