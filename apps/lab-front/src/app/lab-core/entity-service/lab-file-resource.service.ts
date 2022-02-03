import {Injectable} from '@angular/core';
import {FlApiService, FlEntityPaginatedDatasource, FlFileHelper} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {LabFileType} from '../model/entities/resource/lab-file-type';
import {ClPageI} from '@monorepo/core-lib';
import {LabResource, LabResourceDatasource} from '../model/entities/resource/lab-resource.entity';
import {HttpEvent} from '@angular/common/http';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LabFileResourceService {

  public static readonly uploadFileActon = 'uploadFile';

  private readonly route: string = 'fs-node';

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
   * Upload a file to the serveur. This watch the http events to follow progress.
   */
  public uploadFile(file: File, typingName?: string): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    formData.append('file', file);
    formData.append('typing_name', typingName);

    return this.apiService.post(`${this.route}/upload-file`, formData, null,
      {observe: 'events', reportProgress: true});
  }

  /**
   * Upload a folder to the serveur. This watch the http events to follow progress.
   */
  public uploadFolder(folderTypingName: string, files: File[]): Observable<LabResource> {
    const formData: FormData = new FormData();
    files.forEach(file => formData.append('files', file));

    return this.apiService.post(`${this.route}/upload-folder/${folderTypingName}`, formData, null,
      {observe: 'events', reportProgress: true});
  }


  public downloadFile(id: string): Observable<void> {
    // get the download file url
    return this.getDownloadFileUrl(id).pipe(
      map(url => {
        // download the file from the url
        const fullUrl = this.apiService.getBaseRouteUrl(url);
        FlFileHelper.downloadUrl(fullUrl);
      })
    );
  }

  public getDownloadFileUrl(id: string): Observable<string> {
    return this.apiService.get(`${this.route}/${id}/get-download-url`);
  }


  public getAll(page: number, pageSize: number): Observable<ClPageI<LabResource>> {
    return this.apiService.get(this.route, LabResource,
      {resultIsPaginated: true, page: page, pageSize: pageSize});
  }

  public getAllDatasource(): LabResourceDatasource {
    return new FlEntityPaginatedDatasource(((page, pageSize) => this.getAll(page, pageSize)),
      20, true);
  }

  //////////////////////////////////////////// FILE TYPE ////////////////////////////////////////
  // return the list of all file types
  public getFileTypes(): Observable<LabFileType[]> {
    return this.apiService.get(`${this.route}/file-type`, LabFileType);
  }

  // return the list of all folder types
  public getFolderTypes(): Observable<LabFileType[]> {
    return this.apiService.get(`${this.route}/folder-type`, LabFileType);
  }
}
