import {Injectable} from '@angular/core';
import {FlApiService, FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {
  CaBucketCredentialsFull,
  CaBucketCredentialsFullDatasource,
  CaBucketFull,
  CaBucketFullDatasource
} from '../model/entities/ca-object-storage.class';
import {Observable} from 'rxjs';
import {ClPageI} from '@monorepo/core-lib';


@Injectable({
  providedIn: 'root'
})
export class CaObjectStorageService {

  private readonly route: string = 'object-storages';

  private readonly credentialsRoute: string = this.route + '/credentials';
  private readonly bucketRoute: string = this.route + '/buckets';

  constructor(private apiService: FlApiService) {
  }

  ////////////////// BUCKETS //////////////////
  public createBucket(bucket: Partial<CaBucketFull>): Observable<CaBucketFull> {
    return this.apiService.post(this.bucketRoute, bucket, CaBucketFull);
  }

  public updateBucket(bucket: Partial<CaBucketFull>): Observable<CaBucketFull> {
    return this.apiService.put(this.bucketRoute, bucket, CaBucketFull);
  }

  public deleteBucket(id: string): Observable<void> {
    return this.apiService.deleteById(this.bucketRoute, id);
  }

  public getAllBuckets(page: number, size: number): Observable<ClPageI<CaBucketFull>> {
    return this.apiService.get(this.bucketRoute, CaBucketFull, {
      page: page, pageSize: size, resultIsPaginated: true
    });
  }

  public getAllBucketsDatasource(): CaBucketFullDatasource {
    return new FlEntityPaginatedDatasource(
      (page: number, pageSize: number) => this.getAllBuckets(page, pageSize), 20
    );
  }


  //////////////// CREDENTIALS ////////////////
  public createCredentials(credentials: Partial<CaBucketCredentialsFull>): Observable<CaBucketCredentialsFull> {
    return this.apiService.post(this.credentialsRoute, credentials, CaBucketCredentialsFull);
  }

  public updateCredentials(credentials: Partial<CaBucketCredentialsFull>): Observable<CaBucketCredentialsFull> {
    return this.apiService.put(this.credentialsRoute, credentials, CaBucketCredentialsFull);
  }

  public deleteCredentials(id: string): Observable<void> {
    return this.apiService.deleteById(this.credentialsRoute, id);
  }

  public getAllCredentials(page: number, size: number): Observable<ClPageI<CaBucketCredentialsFull>> {
    return this.apiService.get(this.credentialsRoute, CaBucketCredentialsFull, {
      page: page, pageSize: size, resultIsPaginated: true
    });
  }

  public getAllCredentialsDatasource(): CaBucketCredentialsFullDatasource {
    return new FlEntityPaginatedDatasource(
      (page: number, pageSize: number) => this.getAllCredentials(page, pageSize), 20
    );
  }

}
