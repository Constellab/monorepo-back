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


@Injectable()
export class CnObjectStoragesAggregateService {

  constructor(private securityService: CnObjectStoragesSecurity,
              private bucketService: CnBucketsService,
              private bucketCredentialsService: CnBucketCredentialsService,
              private authService: CnAuthService) {
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

  public async getBucketByContentTypeAndRegionNotSecure(contentType: CnBucketContentType, regionId: string): Promise<CnBucket> {
    const bucket = await this.bucketService.findByContentTypeAndRegion(contentType, regionId);

    if (bucket == null) {
      throw new BlBadRequestException(`No bucket found for content type ${contentType} and region ${regionId}`);
    }

    return bucket;
  }

  /////////////////////////// CREDENTIALS ///////////////////////////

  public async createBucketCredentials(credentials: CnBucketCredentials): Promise<CnBucketCredentials> {
    this.checkAuthorizationToModifyEntity();
    return this.bucketCredentialsService.create(credentials);
  }

  public async updateBucketCredentials(credentials: CnBucketCredentials): Promise<CnBucketCredentials> {
    this.checkAuthorizationToModifyEntity();
    await this.bucketCredentialsService.update(credentials);
    return this.bucketCredentialsService.findCompleteByIdAndCheck(credentials.id);
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

  /**
   * Get the credentials with the keys, this requires the user password and the user need to be an admin
   */
  public async getCredentialsData(credentialsId: string, userCredentials: BlCredentials): Promise<CnBucketCredentialsFull> {
    this.checkAuthorizationToGetCredentials();

    const user = await this.authService.checkCredentialsAndUser(userCredentials, false);

    if (user.id !== CnCurrentUserHelper.getAndCheckCurrentUser().id) {
      throw new BlUnauthorizedException(CnErrorText.WRONG_CREDENTIALS);
    }

    const credentials = await this.bucketCredentialsService.findCompleteByIdAndCheck(credentialsId);
    return BlDtoHelper.toDto(CnBucketCredentialsFull, credentials);
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
