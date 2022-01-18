import { Injectable } from '@angular/core';
import { FlApiService } from '@monorepo/front-core-lib'
import { Observable } from 'rxjs';
import {HaDocumentation, HaDocumentationDTO} from '../ha-model/ha-entities/ha-documentation.class';
import {HaNodeDTO} from '../ha-model/ha-entities/ha-node.class';

/**
 * Service to manage documentation entity
 */
@Injectable({
  providedIn: 'root'
})
export class HaDocumentationService {

    private readonly route: string = 'documentation';
    constructor(private apiService: FlApiService){

    }

    /**
   * Call http create
   * @param object json object
   */
    public create(object: Partial<HaDocumentation>): Observable<HaDocumentation> {
      return this.apiService.post('folder/doc', object, HaDocumentation);
    }

    /**
   * Call http get one by id
   * @param id id of the entity
   */
    public getById(id: string): Observable<HaDocumentation> {
      return this.apiService.getById(this.route, id, HaDocumentation);
    }

    /**
   * Call http get
   * @param path path of the entity
   */
    public getByPath(path: string): Observable<HaDocumentation> {
      return this.apiService.get(`${this.route}/path/?path=${path}`, HaDocumentation);
    }

    public updateContent(object: any): Observable<HaDocumentation>{
      return this.apiService.put(this.route + '/content', object, HaDocumentation);
    }

    /**
   * Call http get
   */
    public get(): Observable<HaDocumentationDTO[]> {
      return this.apiService.get(this.route, HaDocumentationDTO);
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

}
