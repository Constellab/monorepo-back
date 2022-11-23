import {BlBaseEntityDto} from '@monorepo/back-core-lib';
import {CnCloudProvider} from '../cn-cloud-providers/cn-cloud-provider.entity';
import {CnOrganization} from '../cn-organizations/cn-organization.entity';


export class CnBucketCredentialsFull extends BlBaseEntityDto {
  name: string = undefined;
  accessKeyId: string = undefined;
  secretAccessKey: string = undefined;
  cloudProvider: CnCloudProvider = undefined;
  organization: CnOrganization = undefined;
}
