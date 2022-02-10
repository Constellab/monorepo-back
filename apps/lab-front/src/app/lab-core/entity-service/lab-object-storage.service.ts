import {Injectable} from '@angular/core';
import {FlApiService, FlTextEditorImageService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';


@Injectable({providedIn: 'root'})
export class LabObjectStorageService extends FlTextEditorImageService {

  private readonly route = 'object-storage';

  constructor(private apiService: FlApiService) {
    super();
  }

  public uploadObject(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('object', file);
    return this.apiService.post(this.route, formData).pipe(
      map(filename => this.getFilePath(filename))
    );
  }

  public getFilePath(filename: string): string {
    return this.apiService.getBaseRouteUrl(`${this.route}/${filename}`);
  }

  public deleteObject(objectName: string): Observable<void> {
    return this.apiService.delete(`${this.route}/${objectName}`);
  }

  deleteFile(filename: string): Observable<void> {
    return this.deleteObject(filename);
  }

  uploadImage(file: File): Observable<string> {
    return this.uploadObject(file);
  }


}
