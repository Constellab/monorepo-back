import {Injectable} from '@angular/core';
import {FlApiService, FlTextEditorUploadedImage} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {HaDocumentation, HaDocumentationContentFormDTO} from '../ha-model/ha-entities/ha-documentation.class';
import {HaNodeDTO} from '../ha-model/ha-entities/ha-node.class';

/**
 * Service to manage documentation entity
 */
@Injectable({
  providedIn: 'root'
})
export class HaDocumentationService {

  private readonly route: string = 'documentation';

  constructor(private apiService: FlApiService) {
  }


  /**
   * Call http get one by id
   * @param id id of the entity
   */
  public getById(id: string): Observable<HaDocumentation> {
    return this.apiService.getById(this.route, id, HaDocumentation);
  }

  /**
   * Call http updateContent
   * @param object json object
   */
  public updateContent(object: HaDocumentationContentFormDTO): Observable<HaDocumentation> {
    return this.apiService.put(this.route + '/content/' + object.id, object.content);
  }

  /**
   * Call http update
   * @param object json object
   */
  public update(object: Partial<HaNodeDTO>): Observable<HaDocumentation> {
    return this.apiService.put(this.route, object, HaDocumentation);
  }

  /**
   * Call http delete
   * @param id id of the entity
   */
  public deleteById(id: string): Observable<HaDocumentation> {
    return this.apiService.deleteById(this.route, id, HaDocumentation);
  }

  ///////////////////////////////////////////// IMAGE /////////////////////////////////////////////


  public getFilePath(filename: string): string {
    return this.apiService.getBaseRouteUrl(`${this.route}/image/${filename}`);
  }

  uploadImage(file: File): Observable<FlTextEditorUploadedImage> {
    const formData = new FormData();
    formData.append('file', file);
    return this.apiService.put(`${this.route}/image`, formData);
  }

  getImageUrl(filename: string): string {
    return this.getFilePath(filename);
  }

}
