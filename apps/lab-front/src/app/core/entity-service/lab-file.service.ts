import {Injectable} from '@angular/core';
import {FlApiService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LabFileService {

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

  public downloadFile(id: string): Observable<Blob>{
    return this.apiService.downloadFile(`${this.route}/${id}/download`);
  }

}
