import {Injectable} from '@nestjs/common';
import {CnBucketsService} from './cn-buckets/cn-buckets.service';
import {CnBucketCredentialsService} from './cn-bucket-credential/cn-bucket-credentials.service';
import {CnObjectStoragesSecurity} from './cn-object-storages.security';
import {CnBucketCredentials} from './cn-bucket-credential/cn-bucket-credential.entity';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {ClPage} from '@monorepo/core-lib';
import {CnBucket, CnBucketContentType} from './cn-buckets/cn-bucket.entity';
import {CnLabInstance} from '../cn-lab-instances/cn-lab-instance.entity';
import {CnCloudProviderAggregateService} from '../cn-cloud-providers/cn-cloud-provider-aggregate.service';


@Injectable()
export class CnObjectStoragesAggregateService {

  private static LabBackupCredentialName = 'LAB_BACKUP';


  constructor(private securityService: CnObjectStoragesSecurity,
              private bucketService: CnBucketsService,
              private bucketCredentialsService: CnBucketCredentialsService,
              private cloudProviderService: CnCloudProviderAggregateService) {
  }


  public async getOrCreateLabBackupBucket(labInstance: CnLabInstance): Promise<CnBucket> {
    const labBackupBucket = await this.bucketService.findLabBackupBucket(labInstance.id, labInstance.spaceId);

    if (labBackupBucket) {
      return labBackupBucket;
    }

    const credentials = await this.bucketCredentialsService.findByName(CnObjectStoragesAggregateService.LabBackupCredentialName);

    if (credentials == null) {
      throw new Error(`Credentials named ${CnObjectStoragesAggregateService.LabBackupCredentialName} not found`);
    }
    const region = await this.cloudProviderService.getDefaultRegion();

    const bucket = new CnBucket();
    bucket.name = labInstance.id; // use id as bucket name
    bucket.space = labInstance.space;
    bucket.region = region;
    bucket.credentials = credentials;
    bucket.contentType = CnBucketContentType.LAB_BACKUP;
    bucket.objectId = labInstance.id; // link this bucket with the lab instance

    return this.bucketService.createBucket(bucket);
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


  public async getBuckets(page: number, size: number): Promise<ClPage<CnBucket>> {
    await this.securityService.checkAuthorizationToGetAllBuckets(CnCurrentUserHelper.getAndCheckCurrentUser());
    return this.bucketService.findAll(page, size);
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
