import {Injectable} from '@angular/core';
import {FlApiService, FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {Observable, of} from 'rxjs';
import {
  BioxBasicResource,
  BioxResource,
  BioxResourceDatasource,
  BioxResourceType,
  BioxResourceTypeDatasource
} from '../model/entities/resource/biox-resource.entity';
import {FileResourceService, FileWithContent} from './file-resource.service';
import {ClClassReference, ClPage} from '@monorepo/core-lib';
import {FileResource} from '../model/entities/resource/file-resource.entity';
import {map, mergeMap} from 'rxjs/operators';
import {LabBaseEntity} from '../model/global/lab-entity.entity';


@Injectable({
  providedIn: 'root'
})
export class BioxResourceService {

  private readonly route: string = 'resource';
  private readonly resourceTypeRoute: string = 'resource-type';

  constructor(private apiService: FlApiService,
              private fileResourceService: FileResourceService) {
  }

  public getByTypingNameAndId(typingName: string, id: string): Observable<BioxResource> {
    if (!typingName || !id) {
      return of(null);
    }

    // todo ne fonctionne pas si class fille de File
    if (typingName === 'RESOURCE.gws_core.File') {
      return this.getFileResource(typingName, id);
    } else {
      return this.getResource(typingName, id, BioxBasicResource);
    }
  }

  private getResource(type: string, id: string, classReference: ClClassReference): Observable<any> {
    return this.apiService.get(`${this.route}/${type}/${id}`, classReference);
  }

  /**
   * Load FileResource and load file content
   */
  private getFileResource(type: string, id: string): Observable<FileResource> {
    return this.getResource(type, id, FileResource).pipe(
      mergeMap((fileResource: FileResource) => this.loadFileResourceContent(fileResource))
    );
  }

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

  public getResourcesByType(type: string, page: number, pageSize: number): Observable<ClPage<LabBaseEntity>> {
    return this.apiService.get(`${this.route}/${type}`, LabBaseEntity,
      {resultIsPaginated: true, page: (page + 1), pageSize: pageSize});
  }

  public getResourcesByTypeDatasource(type: string): BioxResourceDatasource {
    return new FlEntityPaginatedDatasource(
      (page: number, pageSize: number) => this.getResourcesByType(type, page, pageSize),
      20, true);

  }

  // get the list of resource types
  public getResourceTypes(page: number, pageSize: number): Observable<ClPage<BioxResourceType>> {
    return this.apiService.get(this.resourceTypeRoute, BioxResourceType,
      {resultIsPaginated: true, page: (page + 1), pageSize: pageSize});
  }

  public getResourceTypesDatasource(): BioxResourceTypeDatasource {
    return new FlEntityPaginatedDatasource(
      (page: number, pageSize: number) => this.getResourceTypes(page, pageSize),
      20, true);

  }
}
