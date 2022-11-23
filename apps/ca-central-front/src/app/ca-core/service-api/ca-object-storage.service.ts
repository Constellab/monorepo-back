import {Injectable} from '@angular/core';
import {FlApiService, FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {
  CaBucketCredentialsFull,
  CaBucketCredentialsFullDatasource,
  CaBucketRegion,
  CaBucketRegionDatasource
} from '../model/entities/ca-object-storage.class';
import {Observable} from 'rxjs';
import {ClPageI} from '@monorepo/core-lib';


@Injectable({
  providedIn: 'root'
})
export class CaObjectStorageService {

  private readonly route: string = 'object-storages';

  private readonly credentialsRoute: string = this.route + '/credentials';
  private readonly regionsRoute: string = this.route + '/regions';
  private readonly bucketRoute: string = this.route + '/buckets';

  constructor(private apiService: FlApiService) {
  }


  ////////////////// REGIONS //////////////////
  public createRegion(bucketRegion: Partial<CaBucketRegion>): Observable<CaBucketRegion> {
    return this.apiService.post(this.regionsRoute, bucketRegion, CaBucketRegion);
  }

  public updateRegion(bucketRegion: Partial<CaBucketRegion>): Observable<CaBucketRegion> {
    return this.apiService.put(this.regionsRoute, bucketRegion, CaBucketRegion);
  }

  public deleteRegion(id: string): Observable<void> {
    return this.apiService.deleteById(this.regionsRoute, id);
  }

  public getAllRegions(page: number, size: number): Observable<ClPageI<CaBucketRegion>> {
    return this.apiService.get(this.regionsRoute, CaBucketRegion, {
      page: page, pageSize: size, resultIsPaginated: true
    });
  }

  public getAllRegionsDatasource(): CaBucketRegionDatasource {
    return new FlEntityPaginatedDatasource(
      (page: number, pageSize: number) => this.getAllRegions(page, pageSize), 20
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
