import {Injectable} from '@nestjs/common';
import {CnBucketsService} from './cn-buckets/cn-buckets.service';
import {CnBucketCredentialsService} from './cn-bucket-credential/cn-bucket-credentials.service';
import {CnObjectStoragesSecurity} from './cn-object-storages.security';
import {CnBucketCredentials} from './cn-bucket-credential/cn-bucket-credential.entity';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {ClPage} from '@monorepo/core-lib';
import {CnBucket, CnBucketContentType} from './cn-buckets/cn-bucket.entity';
import {CnCloudProviderAggregateService} from '../cn-cloud-providers/cn-cloud-provider-aggregate.service';
import {CnCloudProviderRegion} from '../cn-cloud-providers/cn-cloud-provider-regions/cn-cloud-provider-region.entity';
import {BlBadRequestException, BlSearchParams} from '@monorepo/back-core-lib';
import {CnSpace} from '../cn-spaces/cn-space.entity';
import {EntityManager} from 'typeorm';


@Injectable()
export class CnObjectStoragesAggregateService {

  public static LabBackupCredentialName = 'LAB_BACKUP';


  constructor(private securityService: CnObjectStoragesSecurity,
              private bucketService: CnBucketsService,
              private bucketCredentialsService: CnBucketCredentialsService,
              private cloudProviderService: CnCloudProviderAggregateService) {
  }


  public async getOrCreateLabBackupBucket(labInstanceId: string, labInstanceSpaceId: string): Promise<CnBucket> {
    const region = await this.cloudProviderService.getDefaultRegion();

    return this.getOrCreateObjectBucket(CnObjectStoragesAggregateService.LabBackupCredentialName, region,
      labInstanceId, labInstanceSpaceId,
      CnBucketContentType.LAB_BACKUP, labInstanceId);
  }

  //////////////////////////// OBJECT BUCKET ///////////////////////////
  public findByContentTypeAndObjectId(contentType: CnBucketContentType, objectId: string): Promise<CnBucket> {
    return this.bucketService.findByContentTypeAndObjectId(contentType, objectId);
  }


  public async createObjectBucket(credentialsName: string, region: CnCloudProviderRegion,
                                  bucketName: string, spaceId: string,
                                  contentType: CnBucketContentType, objectId: string): Promise<CnBucket> {
    const bucket = await this.findByContentTypeAndObjectId(contentType, objectId);

    if (bucket) {
      throw new BlBadRequestException(`Bucket for this object already exists`);
    }

    return this.createObjectBucketPrivate(credentialsName, region, bucketName, spaceId, contentType, objectId);
  }

  public async getOrCreateObjectBucket(credentialsName: string, region: CnCloudProviderRegion,
                                       bucketName: string, spaceId: string,
                                       contentType: CnBucketContentType, objectId: string): Promise<CnBucket> {
    const bucket = await this.bucketService.findByContentTypeAndObjectId(contentType, objectId);

    if (bucket) {
      return bucket;
    }

    return this.createObjectBucketPrivate(credentialsName, region, bucketName, spaceId, contentType, objectId);
  }

  private async createObjectBucketPrivate(credentialsName: string, region: CnCloudProviderRegion,
                                          bucketName: string, spaceId: string,
                                          contentType: CnBucketContentType, objectId: string): Promise<CnBucket> {

    const credentials = await this.bucketCredentialsService.findByName(credentialsName);

    if (credentials == null) {
      throw new BlBadRequestException(`Credentials named ${credentialsName} not found`);
    }

    const bucket = new CnBucket();
    bucket.name = bucketName;
    bucket.region = region;
    bucket.credentials = credentials;
    bucket.contentType = contentType;
    const space = new CnSpace();
    space.id = spaceId;
    bucket.space = space;
    bucket.objectId = objectId;

    return this.bucketService.createBucket(bucket);
  }

  public async deleteBucketNotSecure(id: string, entityManager?: EntityManager): Promise<void> {
    await this.bucketService.deleteById(id, entityManager);
  }


  /////////////////////////// BUCKETS ///////////////////////////

  public async createBucket(bucket: CnBucket): Promise<CnBucket> {
    this.checkAuthorizationToModifyEntity();
    return this.bucketService.createBucket(bucket);
  }

  public async updateBucket(bucket: CnBucket): Promise<CnBucket> {
    this.checkAuthorizationToModifyEntity();
    return this.bucketService.update(bucket);
  }

  public async deleteBucket(id: string): Promise<void> {
    this.checkAuthorizationToModifyEntity();
    await this.bucketService.deleteById(id);
  }

  public async searchBuckets(searchParams: BlSearchParams, page: number, size: number): Promise<ClPage<CnBucket>> {
    await this.securityService.checkAuthorizationToGetAllBuckets(CnCurrentUserHelper.getAndCheckCurrentUser());
    return this.bucketService.search(searchParams, page, size);
  }

  /////////////////////////// CREDENTIALS ///////////////////////////

  public async createBucketCredentials(credentials: CnBucketCredentials): Promise<CnBucketCredentials> {
    this.checkAuthorizationToModifyEntity();
    return this.bucketCredentialsService.create(credentials);
  }

  public async updateBucketCredentials(credentials: CnBucketCredentials): Promise<CnBucketCredentials> {
    this.checkAuthorizationToModifyEntity();
    return this.bucketCredentialsService.update(credentials);
  }

  public async deleteBucketCredentials(id: string): Promise<void> {
    this.checkAuthorizationToModifyEntity();
    await this.bucketCredentialsService.deleteById(id);
  }

  public async getBucketCredentials(id: string): Promise<CnBucketCredentials> {
    this.checkAuthorizationToGetCredentials();
    return this.bucketCredentialsService.findByIdAndCheck(id);
  }

  public async getAllBucketCredentials(page: number, size: number): Promise<ClPage<CnBucketCredentials>> {
    this.checkAuthorizationToGetCredentials();
    return this.bucketCredentialsService.findAll(page, size);
  }

  public checkAuthorizationToGetCredentials(): void {
    this.securityService.checkAuthorizationToGetCredentials(CnCurrentUserHelper.getAndCheckCurrentUser());
  }

  //////////////////////////// AUTHORIZATION ////////////////////////////

  public checkAuthorizationToModifyEntity(): void {
    this.securityService.checkAuthorizationToModifyEntity(CnCurrentUserHelper.getAndCheckCurrentUser());
  }

  public checkAuthorizationToGetEntity(): void {
    this.securityService.checkAuthorizationToGetEntity();
  }
}
