import {Injectable} from '@angular/core';
import {FlApiService, FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {Observable, of} from 'rxjs';
import {BioxResource, BioxResourceDatasource} from '../model/entities/resource/biox-resource.entity';
import {FileResourceService, FileWithContent} from './file-resource.service';
import {ClConstructorFunction, ClCoreJsonConvert, ClPageI} from '@monorepo/core-lib';
import {FileResource} from '../model/entities/resource/file-resource.entity';
import {map} from 'rxjs/operators';
import {BioxLabTypeEntity, BioxLabTypeEntityDatasource} from '../model/entities/lab-type/biox-lab-type.entity';
import {
  bioxGroupResourceViewSpecsByType,
  BioxResourceView,
  BioxResourceViewBase,
  BioxResourceViewConfig,
  BioxResourceViewSpec,
  BioxResourceViewSpecsByType
} from '../model/entities/resource/biox-resource-view.entity';


@Injectable({
  providedIn: 'root'
})
export class BioxResourceService {

  private readonly route: string = 'resource';
  private readonly resourceTypeRoute: string = 'resource-type';

  constructor(private apiService: FlApiService,
              private fileResourceService: FileResourceService) {
  }

  //////////////////////////////////////// RESOURCE ///////////////////////////////////////

  public getByTypingNameAndId(typingName: string, id: string): Observable<BioxResource> {
    if (!typingName || !id) {
      return of(null);
    }

    // get the resource in the correct type
    return this.getResource(typingName, id);
  }

  private getResource(type: string, id: string): Observable<any> {
    return this.apiService.get(`${this.route}/${type}/${id}`, this.instantiateResource);
  }

  /**
   * Method to instantiate the correct resource when getting it from the DB
   * @param json
   */
  private instantiateResource: ClConstructorFunction<BioxResource> = (json: any): BioxResource => {
    // if this is a resource file
    if (json.is_file) {
      return ClCoreJsonConvert.deserializeObject(json, FileResource);
    } else {
      return ClCoreJsonConvert.deserializeObject(json, BioxResource);
    }
  };


  /**
   * Load the content of a FileResource and set the result in data attribute
   */
  private loadFileResourceContent(file: FileResource): Observable<FileResource> {
    return this.fileResourceService.readFileFromResource(file).pipe(
      map((fileContent: FileWithContent) => {
        file.file = fileContent.file;
        file.data = fileContent.content;
        return file;
      })
    );
  }

  public getResourcesByType(type: string, page: number, pageSize: number): Observable<ClPageI<BioxResource>> {
    return this.apiService.get(`${this.route}/${type}`, BioxResource,
      {resultIsPaginated: true, page: page, pageSize: pageSize});
  }

  public getResourcesByTypeDatasource(type: string): BioxResourceDatasource {
    return new FlEntityPaginatedDatasource(
      (page: number, pageSize: number) => this.getResourcesByType(type, page, pageSize),
      20, true);
  }

  //////////////////////////////////////// RESOURCE TYPE///////////////////////////////////////


  // get the list of resource types
  public getResourceTypes(page: number, pageSize: number): Observable<ClPageI<BioxLabTypeEntity>> {
    return this.apiService.get(this.resourceTypeRoute, BioxLabTypeEntity,
      {resultIsPaginated: true, page: page, pageSize: pageSize});
  }

  public getResourceTypesDatasource(): BioxLabTypeEntityDatasource {
    return new FlEntityPaginatedDatasource(
      (page: number, pageSize: number) => this.getResourceTypes(page, pageSize),
      20, true);
  }

  //////////////////////////////////////// RESOURCE VIEWS  ///////////////////////////////////////

  public getResourceViews(type: string): Observable<BioxResourceViewSpec[]> {
    return this.apiService.get(`resource/${type}/views`, BioxResourceViewSpec);
  }

  public getResourceViewsByType(type: string): Observable<BioxResourceViewSpecsByType[]> {
    return this.getResourceViews(type).pipe(
      map(views => bioxGroupResourceViewSpecsByType(views)));
  }

  public callResourceView(type: string, id: string, viewName: string, config: BioxResourceViewConfig): Observable<BioxResourceView> {
    return this.apiService.post(`resource/${type}/${id}/views/${viewName}`, config, BioxResourceViewBase);
  }

}
