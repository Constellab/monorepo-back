import {Injectable} from '@nestjs/common';
import {CnBucketsService} from './cn-buckets/cn-buckets.service';
import {CnBucketCredentialsService} from './cn-bucket-credential/cn-bucket-credentials.service';
import {CnObjectStoragesSecurity} from './cn-object-storages.security';
import {CnBucketCredentials} from './cn-bucket-credential/cn-bucket-credential.entity';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {ClPage} from '@monorepo/core-lib';
import {CnBucket, CnBucketContentType} from './cn-buckets/cn-bucket.entity';
import {
  BlBadRequestException,
  BlCredentials,
  BlDtoHelper,
  BlSearchParams,
  BlUnauthorizedException
} from '@monorepo/back-core-lib';
import {CnAuthService} from '../cn-auth/cn-auth.service';
import {CnBucketCredentialsFull} from './cn-object-storage.dto';
import {CnErrorText} from '../cn-core/model/config/cn-error-text.class';
import {CnCloudProviderAggregateService} from '../cn-cloud-providers/cn-cloud-provider-aggregate.service';
import {CnCloudProviderRegion} from '../cn-cloud-providers/cn-cloud-provider-regions/cn-cloud-provider-region.entity';


@Injectable()
export class CnObjectStoragesAggregateService {

  constructor(private securityService: CnObjectStoragesSecurity,
              private bucketService: CnBucketsService,
              private bucketCredentialsService: CnBucketCredentialsService,
              private authService: CnAuthService,
              private cloudProviderService: CnCloudProviderAggregateService) {
  }


  /////////////////////////// BUCKETS ///////////////////////////

  public async createBucket(bucket: CnBucket): Promise<CnBucket> {
    this.checkAuthorizationToModifyEntity();
    bucket.credentials = await this.bucketCredentialsService.findByIdAndCheck(bucket.credentials.id);
    return this.bucketService.createBucket(bucket);
  }

  public async updateBucket(bucket: CnBucket): Promise<CnBucket> {
    this.checkAuthorizationToModifyEntity();
    return this.bucketService.update(bucket);
  }

  public async deleteBucket(id: string): Promise<void> {
    this.checkAuthorizationToModifyEntity();
    const bucket = await this.bucketService.findCompleteById(id);
    await this.bucketService.deleteBucket(bucket);
  }

  public async searchBuckets(searchParams: BlSearchParams, page: number, size: number): Promise<ClPage<CnBucket>> {
    this.securityService.checkAuthorizationToGetAllBuckets(CnCurrentUserHelper.getAndCheckCurrentUser());
    return this.bucketService.search(searchParams, page, size);
  }

  public async searchByContentTypeAndSpaceNotSecure(contentType: CnBucketContentType, spaceId: string,
                                                    page: number, size: number): Promise<ClPage<CnBucket>> {
    return this.bucketService.searchByContentTypeAndSpace(contentType, spaceId, page, size);
  }

  public async getBucketByContentTypeAndRegionNotSecure(contentType: CnBucketContentType, regionId: string): Promise<CnBucket> {
    const bucket = await this.bucketService.findByContentTypeAndRegion(contentType, regionId);

    if (bucket == null) {
      throw new BlBadRequestException(`No bucket found for content type ${contentType} and region ${regionId}`);
    }

    return bucket;
  }

  public async getBucketByIdNotSecure(id: string): Promise<CnBucket> {
    return await this.bucketService.findByIdAndCheck(id, CnBucket.configRelation);
  }

  public async getDefaultProjectBucketStorage1(): Promise<CnBucket> {
    const defaultRegion = await this.cloudProviderService.getDefaultS3Region1();

    return await this.getAndCheckProjectBucketForRegion(defaultRegion);
  }

  public async getDefaultProjectBucketStorage2(): Promise<CnBucket> {
    const defaultRegion = await this.cloudProviderService.getDefaultS3Region2();

    return await this.getAndCheckProjectBucketForRegion(defaultRegion);
  }

  private async getAndCheckProjectBucketForRegion(region: CnCloudProviderRegion): Promise<CnBucket> {
    const bucket = await this.bucketService.findByContentTypeAndRegion(CnBucketContentType.PROJECT, region.id);

    if (bucket == null) {
      // eslint-disable-next-line max-len
      throw new BlBadRequestException(`No bucket found for content type ${CnBucketContentType.PROJECT} and region ${region.technicalName}`);
    }

    return bucket;
  }


  /////////////////////////// CREDENTIALS ///////////////////////////

  public async createBucketCredentials(credentials: CnBucketCredentials): Promise<CnBucketCredentials> {
    this.checkAuthorizationForCredentials(credentials);
    return this.bucketCredentialsService.create(credentials);
  }

  public async updateBucketCredentials(credentials: CnBucketCredentials): Promise<CnBucketCredentials> {
    const credentialsDb = await this.bucketCredentialsService.findCompleteByIdAndCheck(credentials.id);
    this.checkAuthorizationForCredentials(credentialsDb);
    await this.bucketCredentialsService.update(credentials);
    return this.bucketCredentialsService.findCompleteByIdAndCheck(credentials.id);
  }

  public async deleteBucketCredentials(id: string): Promise<void> {
    const credentials = await this.bucketCredentialsService.findCompleteByIdAndCheck(id);
    this.checkAuthorizationForCredentials(credentials);
    await this.bucketCredentialsService.deleteById(id);
  }

  public async getAllBucketCredentials(page: number, size: number): Promise<ClPage<CnBucketCredentials>> {
    this.securityService.checkAuthorizationForGenericCredentials(CnCurrentUserHelper.getAndCheckCurrentUser());
    return this.bucketCredentialsService.findAll(page, size);
  }

  public async getAllBucketCredentialsByCurrentSpace(page: number, size: number): Promise<ClPage<CnBucketCredentials>> {
    this.securityService.checkAuthorizationForSpaceCredentials(CnCurrentUserHelper.getAndCheckUserSpaceInfo().spaceId,
      CnCurrentUserHelper.getAndCheckUserSpaceInfo());
    return this.bucketCredentialsService.findAllBySpaceId(CnCurrentUserHelper.getAndCheckUserSpaceInfo().spaceId, page, size);
  }

  /**
   * Get the credentials with the keys, this requires the user password and the user need to be an admin
   */
  public async getCredentialsData(credentialsId: string, userCredentials: BlCredentials): Promise<CnBucketCredentialsFull> {

    const credentials = await this.bucketCredentialsService.findCompleteByIdAndCheck(credentialsId);
    this.checkAuthorizationForCredentials(credentials);

    const user = await this.authService.checkCredentialsAndUser(userCredentials, false);

    if (user.id !== CnCurrentUserHelper.getAndCheckCurrentUser().id) {
      throw new BlUnauthorizedException(CnErrorText.WRONG_CREDENTIALS);
    }

    return BlDtoHelper.toDto(CnBucketCredentialsFull, credentials);
  }

  public checkAuthorizationForCredentials(credentials: CnBucketCredentials): void {
    this.securityService.checkAuthorizationForCredentials(credentials, CnCurrentUserHelper.getAndCheckUserSpaceInfo());
  }


  //////////////////////////// AUTHORIZATION ////////////////////////////

  public checkAuthorizationToModifyEntity(): void {
    this.securityService.checkAuthorizationToModifyEntity(CnCurrentUserHelper.getAndCheckCurrentUser());
  }

  public checkAuthorizationToGetEntity(): void {
    this.securityService.checkAuthorizationToGetEntity();
  }
}
