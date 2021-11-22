import {Injectable} from '@angular/core';
import {FlApiService, FlEntityPaginatedDatasource, FlFileHelper} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {
  BioxFileType,
  FileResourceDatasource,
  FileResourcePreview
} from '../model/entities/resource/file-resource.entity';
import {ClPageI} from '@monorepo/core-lib';
import {map, mergeMap} from 'rxjs/operators';
import {BioxResource} from '../model/entities/resource/biox-resource.entity';

export interface FileWithContent {
  file: Blob;
  content: any;
}

@Injectable({
  providedIn: 'root'
})
export class FileResourceService {

  public static readonly uploadFileActon = 'uploadFile';

  private readonly route: string = 'file';
  private readonly fileTypeRoute: string = 'file-type';

  constructor(private apiService: FlApiService) {
  }

  public uploadFiles(files: File[], typingNames: string[]): Observable<FileResourcePreview[]> {
    const formData: FormData = new FormData();
    files.forEach(file => formData.append('files', file));
    typingNames.forEach(type => formData.append('typing_names', type));

    return this.apiService.post(`${this.route}/upload`, formData, FileResourcePreview);
  }

  public downloadFileUrl(type: string, id: string): string {
    return this.apiService.getBaseRouteUrl(`${this.route}/${type}/${id}/download`);
  }

  public downloadFile(type: string, id: string, filename: string): Observable<Blob> {
    return this.apiService.downloadFile(`${this.route}/${type}/${id}/download`, filename);
  }

  public readFile(type: string, id: string, extension: string): Observable<FileWithContent> {
    return this.apiService.get(`${this.route}/${type}/${id}/download`, null, {responseType: 'blob'}).pipe(
      mergeMap((file: Blob) => this.readBlobContent(file, extension === 'json')),
    );
  }

  private readBlobContent(file: Blob, parseResultToJson: boolean): Observable<FileWithContent> {
    return FlFileHelper.readBlobContent(file, parseResultToJson).pipe(
      map(content => {
        return {file: file, content: content};
      })
    );
  }

  public readFileFromResource(file: FileResourcePreview): Observable<FileWithContent> {
    return this.readFile(file.typingName, file.id, file.getExtension());
  }

  public getAll(page: number, pageSize: number): Observable<ClPageI<FileResourcePreview>> {
    return this.apiService.get(this.route, FileResourcePreview,
      {resultIsPaginated: true, page: page, pageSize: pageSize});
  }

  public getAllDatasource(): FileResourceDatasource {
    return new FlEntityPaginatedDatasource(((page, pageSize) => this.getAll(page, pageSize)),
      20, true);
  }



  public updateFileType(id: string, fileType: string): Observable<BioxResource> {
    return this.apiService.put(`${this.route}/${id}/${fileType}`, BioxResource)
  }


  //////////////////////////////////////////// FILE TYPE ////////////////////////////////////////
  // return the list of all file types
  public getFileTypes(): Observable<BioxFileType[]> {
    return this.apiService.get(this.fileTypeRoute, BioxFileType);
  }
}
