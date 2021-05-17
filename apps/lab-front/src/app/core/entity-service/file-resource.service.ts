import {Injectable} from '@angular/core';
import {FlApiService, FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {FileResource, FileResourceDatasource} from '../model/entities/file-resource.entity';
import {ClPage} from '@monorepo/core-lib';

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

    return this.apiService.put(`${this.route}/upload`, formData);
  }

  public downloadFile(id: string): Observable<Blob> {
    return this.apiService.downloadFile(`${this.route}/${id}/download`);
  }

  public getAll(page: number, pageSize: number): Observable<ClPage<FileResource>> {
    return this.apiService.get(`view/gws.file.File/all`, FileResource,
      {resultIsPaginated: true, page: page + 1, pageSize: pageSize});
  }

  public getAllDatasource(): FileResourceDatasource {
    return new FlEntityPaginatedDatasource(((page, pageSize) => this.getAll(page, pageSize)),
      20, true);
  }


}
