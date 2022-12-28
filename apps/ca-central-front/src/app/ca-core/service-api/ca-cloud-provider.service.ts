import {Injectable} from '@angular/core';
import {FlApiService, FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {
  CaCloudProvider,
  CaCloudProviderDatasource,
  CaCloudProviderRegion,
  CaCloudProviderRegionDatasource
} from '../model/entities/ca-cloud-provider.class';
import {ClPageI} from '@monorepo/core-lib';


@Injectable({providedIn: 'root'})
export class CaCloudProviderService {

  private readonly route = 'cloud-providers';
  private readonly regionsRoute: string = this.route + '/regions';


  constructor(private apiService: FlApiService) {
  }

  ////////////////// CLOUD PROVIDER //////////////////


  public create(cloudProvider: Partial<CaCloudProvider>): Observable<CaCloudProvider> {
    return this.apiService.post(this.route, cloudProvider, CaCloudProvider);
  }

  public update(cloudProvider: Partial<CaCloudProvider>): Observable<CaCloudProvider> {
    return this.apiService.put(this.route, cloudProvider, CaCloudProvider);
  }

  public delete(id: string): Observable<CaCloudProvider> {
    return this.apiService.deleteById(this.route, id, CaCloudProvider);
  }

  public findAll(page: number, size: number): Observable<ClPageI<CaCloudProvider>> {
    return this.apiService.get(this.route, CaCloudProvider,
      {page: page, pageSize: size, resultIsPaginated: true});
  }

  public findAllDatasource(): CaCloudProviderDatasource {
    return new FlEntityPaginatedDatasource(
      (page: number, pageSize: number) => this.findAll(page, pageSize), 20
    );
  }

  ////////////////// REGIONS //////////////////
  public createRegion(region: Partial<CaCloudProviderRegion>): Observable<CaCloudProviderRegion> {
    return this.apiService.post(this.regionsRoute, region, CaCloudProviderRegion);
  }

  public updateRegion(region: Partial<CaCloudProviderRegion>): Observable<CaCloudProviderRegion> {
    return this.apiService.put(this.regionsRoute, region, CaCloudProviderRegion);
  }

  public deleteRegion(id: string): Observable<void> {
    return this.apiService.deleteById(this.regionsRoute, id);
  }

  public getAllRegions(page: number, size: number): Observable<ClPageI<CaCloudProviderRegion>> {
    return this.apiService.get(this.regionsRoute, CaCloudProviderRegion, {
      page: page, pageSize: size, resultIsPaginated: true
    });
  }

  public getAllRegionsDatasource(): CaCloudProviderRegionDatasource {
    return new FlEntityPaginatedDatasource(
      (page: number, pageSize: number) => this.getAllRegions(page, pageSize), 20
    );
  }
}
