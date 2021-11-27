import {Injectable} from '@angular/core';
import {FlApiService, FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {BioxFileType} from '../model/entities/resource/biox-file-type';
import {ClPageI} from '@monorepo/core-lib';
import {BioxResource, BioxResourceDatasource} from '../model/entities/resource/biox-resource.entity';
import {HttpEvent} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FileResourceService {

  public static readonly uploadFileActon = 'uploadFile';

  private readonly route: string = 'fs-node';
  private readonly fileTypeRoute: string = 'file-type';

  constructor(private apiService: FlApiService) {
  }

  /**
   * Upload a file to the serveur. This watch the http events to follow progress.
   */
  public uploadFiles(files: File[], typingNames?: string[]): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    files.forEach(file => formData.append('files', file));

    if (typingNames) {
      typingNames.forEach(type => formData.append('typing_names', type));
    }

    return this.apiService.post(`${this.route}/upload-files`, formData, null,
      {observe: 'events', reportProgress: true});
  }

  /**
   * Upload a folder to the serveur. This watch the http events to follow progress.
   */
  public uploadFolder(files: File[]): Observable<BioxResource> {
    const formData: FormData = new FormData();
    files.forEach(file => formData.append('files', file));

    return this.apiService.post(`${this.route}/upload-folder`, formData, null,
      {observe: 'events', reportProgress: true});
  }

  public downloadFileUrl(type: string, id: string): string {
    return this.apiService.getBaseRouteUrl(`${this.route}/${type}/${id}/download`);
  }

  public downloadFile(type: string, id: string, filename: string): Observable<Blob> {
    return this.apiService.downloadFile(`${this.route}/${type}/${id}/download`, filename);
  }

  public getDownloadFileRoute(type: string, id: string): string {
    return this.apiService.getBaseRouteUrl(`${this.route}/${type}/${id}/download`);
  }


  public getAll(page: number, pageSize: number): Observable<ClPageI<BioxResource>> {
    return this.apiService.get(this.route, BioxResource,
      {resultIsPaginated: true, page: page, pageSize: pageSize});
  }

  public getAllDatasource(): BioxResourceDatasource {
    return new FlEntityPaginatedDatasource(((page, pageSize) => this.getAll(page, pageSize)),
      20, true);
  }


  public updateFileType(id: string, fileType: string): Observable<BioxResource> {
    return this.apiService.put(`${this.route}/${id}/${fileType}`, BioxResource);
  }


  //////////////////////////////////////////// FILE TYPE ////////////////////////////////////////
  // return the list of all file types
  public getFileTypes(): Observable<BioxFileType[]> {
    return this.apiService.get(this.fileTypeRoute, BioxFileType);
  }
}
