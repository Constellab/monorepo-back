import {CaBaseEntity} from './ca-base-entity.class';
import {CaCloudProvider} from './ca-cloud-provider.class';
import {CaCity} from './ca-city.entity';
import {Type} from 'class-transformer';
import {CaOrganization} from './ca-organization.class';
import {FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';

export class CaBucketRegion extends CaBaseEntity {

  technicalName: string;

  endpoint: string;

  @Type(() => CaCloudProvider)
  cloudProvider: CaCloudProvider;

  @Type(() => CaCity)
  city: CaCity;

}

export class CaBucketCredentials extends CaBaseEntity {

  name: string;

}

/**
 * Complete credential (only accessible for admin)
 */
export class CaBucketCredentialsFull extends CaBucketCredentials {

  accessKeyId: string;

  secretAccessKey: string;

  @Type(() => CaCloudProvider)
  cloudProvider: CaCloudProvider;

  @Type(() => CaOrganization)
  organization: CaOrganization;
}

export type CaBucketCredentialsFullDatasource = FlEntityPaginatedDatasource<CaBucketCredentialsFull>;

export enum CaBucketContentType {
  LAB_BACKUP = 'LAB_BACKUP',
  ORGANIZATION_IMAGE = 'ORGANIZATION_IMAGE',
  USER_IMAGE = 'USER_IMAGE',
  REPORT_IMAGE = 'REPORT_IMAGE',
  REPORT_VIEW = 'REPORT_VIEW',
  COMMENT_IMAGE = 'COMMENT_IMAGE',
}

export class CaBucket extends CaBaseEntity {

  name: string;

  contentType: CaBucketContentType;

  objectId: string;

}


export class CaBucketFull extends CaBucket {

  @Type(() => CaBucketRegion)
  region: CaBucketRegion;

  @Type(() => CaBucketCredentials)
  credentials: CaBucketCredentials;

  @Type(() => CaOrganization)
  organization: CaOrganization;
}
