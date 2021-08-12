import {Injectable} from '@angular/core';
import {FlApiService, FlEntityPaginatedDatasource, FlFileHelper} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {FileResourceDatasource, FileResourcePreview} from '../model/entities/resource/file-resource.entity';
import {ClPage} from '@monorepo/core-lib';
import {map, mergeMap} from 'rxjs/operators';

export interface FileWithContent {
  file: Blob;
  content: any;
}

@Injectable({
  providedIn: 'root'
})
export class FileResourceService {

  private readonly route: string = 'file';

  constructor(private apiService: FlApiService) {
  }

  public uploadFiles(files: File[]): Observable<any> {
    const formData: FormData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }

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

  public getAll(page: number, pageSize: number): Observable<ClPage<FileResourcePreview>> {
    return this.apiService.get(`file/gws.file.File`, FileResourcePreview,
      {resultIsPaginated: true, page: page + 1, pageSize: pageSize});
  }

  public getAllDatasource(): FileResourceDatasource {
    return new FlEntityPaginatedDatasource(((page, pageSize) => this.getAll(page, pageSize)),
      20, true);
  }


}
