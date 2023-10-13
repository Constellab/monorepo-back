import {Injectable} from '@nestjs/common';
import {CnBucketsService} from './cn-buckets/cn-buckets.service';
import {CnBucketCredentialsService} from './cn-bucket-credential/cn-bucket-credentials.service';
import {CnObjectStoragesSecurity} from './cn-object-storages.security';
import {CnBucketCredentials} from './cn-bucket-credential/cn-bucket-credential.entity';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {ClPage} from '@monorepo/core-lib';
import {CnBucket, CnBucketContentType} from './cn-buckets/cn-bucket.entity';
import {CnCloudProviderRegion} from '../cn-cloud-providers/cn-cloud-provider-regions/cn-cloud-provider-region.entity';
import {
  BlBadRequestException,
  BlCredentials,
  BlDtoHelper,
  BlSearchParams,
  BlUnauthorizedException
} from '@monorepo/back-core-lib';
import {CnSpace} from '../cn-spaces/cn-space.entity';
import {EntityManager} from 'typeorm';
import {CnAuthService} from '../cn-auth/cn-auth.service';
import {CnBucketCredentialsFull} from './cn-object-storage.dto';
import {CnErrorText} from '../cn-core/model/config/cn-error-text.class';


@Injectable()
export class CnObjectStoragesAggregateService {

  public static LabBackupCredentialName = 'LAB_BACKUP';


  constructor(private securityService: CnObjectStoragesSecurity,
              private bucketService: CnBucketsService,
              private bucketCredentialsService: CnBucketCredentialsService,
              private authService: CnAuthService) {
  }

  //////////////////////////// OBJECT BUCKET ///////////////////////////
  public findByContentTypeAndObjectId(contentType: CnBucketContentType, objectId: string): Promise<CnBucket[]> {
    return this.bucketService.findByContentTypeAndObjectId(contentType, objectId);
  }


  public async createObjectBucket(credentialsName: string, region: CnCloudProviderRegion,
                                  bucketName: string, spaceId: string,
                                  contentType: CnBucketContentType, objectId: string,
                                  additionalInfo?: string,
                                  entityManager?: EntityManager): Promise<CnBucket> {

    return this.createObjectBucketPrivate(credentialsName, region, bucketName, spaceId,
      contentType, objectId, additionalInfo, entityManager);
  }


  private async createObjectBucketPrivate(credentialsName: string, region: CnCloudProviderRegion,
                                          bucketName: string, spaceId: string,
                                          contentType: CnBucketContentType, objectId: string,
                                          additionalInfo?: string,
                                          entityManager?: EntityManager): Promise<CnBucket> {

    const credentials = await this.bucketCredentialsService.findByName(credentialsName);

    if (credentials == null) {
      throw new BlBadRequestException(`Credentials named ${credentialsName} not found`);
    }

    const bucket = new CnBucket();
    bucket.name = bucketName;
    bucket.region = region;
    bucket.credentials = credentials;
    bucket.contentType = contentType;
    bucket.additionalInfo = additionalInfo;
    const space = new CnSpace();
    space.id = spaceId;
    bucket.space = space;
    bucket.objectId = objectId;

    return this.bucketService.createBucket(bucket, entityManager);
  }

  public async deleteBucketNotSecure(completeBucket: CnBucket, entityManager?: EntityManager): Promise<void> {
    await this.bucketService.deleteBucket(completeBucket, entityManager);
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
    const bucket = await this.bucketService.findCompleteById(id);
    await this.bucketService.deleteBucket(bucket);
  }

  public async searchBuckets(searchParams: BlSearchParams, page: number, size: number): Promise<ClPage<CnBucket>> {
    this.securityService.checkAuthorizationToGetAllBuckets(CnCurrentUserHelper.getAndCheckCurrentUser());
    return this.bucketService.search(searchParams, page, size);
  }

  public async getBucketByContentTypeNotSecure(contentType: CnBucketContentType): Promise<CnBucket[]> {
    return this.bucketService.findByContentType(contentType);
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

    if(user.id !== CnCurrentUserHelper.getAndCheckCurrentUser().id){
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
