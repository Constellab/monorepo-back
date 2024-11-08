import { BlBaseEntityDto } from '@monorepo/back-core-lib';
import { CnCloudProvider } from '../cn-cloud-providers/cn-cloud-provider.entity';
import { CnSpace } from '../cn-spaces/cn-space.entity';
import { CnBucketCredentials } from './cn-bucket-credential/cn-bucket-credential.entity';

export class CnBucketCredentialsFull extends BlBaseEntityDto {
  name: string;
  accessKeyId: string;
  secretAccessKey: string;
  cloudProvider: CnCloudProvider;
  space: CnSpace;
  s3Username: string;
  shortDescription: string;

  constructor(entity: CnBucketCredentials) {
    super(entity);
    this.name = entity.name;
    this.accessKeyId = entity.accessKeyId;
    this.secretAccessKey = entity.secretAccessKey;
    this.cloudProvider = entity.cloudProvider;
    this.space = entity.space;
    this.s3Username = entity.s3Username;
    this.shortDescription = entity.shortDescription;
  }
}
