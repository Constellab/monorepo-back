import { Injectable } from '@angular/core';
import { FlApiService } from '@monorepo/front-core-lib'
import { Observable } from 'rxjs';
import {DaDocumentation, DaDocumentationDTO} from '../da-model/da-entities/da-documentation.class';

/**
 * Service to manage documentation entity
 */
@Injectable({
  providedIn: 'root'
})
export class DaDocumentationService {

    private readonly route: string = 'documentation';
    constructor(private apiService: FlApiService){

    }

    /**
   * Call http create
   * @param object json object
   */
    public create(object: Partial<DaDocumentation>): Observable<DaDocumentation> {
      return this.apiService.post('folder/doc', object, DaDocumentation);
    }

    /**
   * Call http get one by id
   * @param id id of the entity
   */
    public getById(id: string): Observable<DaDocumentation> {
      return this.apiService.getById(this.route, id, DaDocumentation);
    }

    /**
   * Call http get
   * @param path path of the entity
   */
    public getByPath(path: string): Observable<DaDocumentation> {
      return this.apiService.get(`${this.route}/path/?path=${path}`, DaDocumentation);
    }

    /**
   * Call http get
   */
    public get(): Observable<DaDocumentationDTO[]> {
      return this.apiService.get(this.route, DaDocumentationDTO);
    }

    /**
   * Call http update
   * @param object json object
   */
    public update(object: Partial<DaDocumentation>): Observable<DaDocumentation> {
      return this.apiService.put('folder/doc', object, DaDocumentation);
    }

    /**
   * Call http delete
   * @param id id of the entity
   */
    public deleteById(id: string): Observable<DaDocumentation> {
      return this.apiService.deleteById(this.route, id, DaDocumentation);
    }
}
