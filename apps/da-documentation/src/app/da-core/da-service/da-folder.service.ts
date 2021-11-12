import { Injectable } from '@angular/core';
import { FlApiService } from '@monorepo/front-core-lib'
import { Observable } from 'rxjs';
import {DaFolder, DaFolderDTO} from '../da-model/da-entities/da-folder.class';
import {DaNode} from '../da-model/da-entities/da-node.class';

/**
 * Service to manage documentation entity
 */
@Injectable({
  providedIn: 'root'
})
export class DaFolderService {

  private readonly route: string = 'folder';
  constructor(private apiService: FlApiService){

  }

  /**
   * Call http create
   * @param object json object
   */
  public create(object: Partial<DaFolderDTO>): Observable<DaFolder> {
    return this.apiService.post(this.route, object, DaFolderDTO);
  }

  /**
   * Call http get one by id
   * @param id id of the entity
   */
  public getById(id: string): Observable<DaFolder> {
    return this.apiService.getById(this.route, id, DaFolder);
  }

  /**
   * Call http get
   */
  public get(): Observable<DaFolder[]> {
    return this.apiService.get(this.route, DaFolder);
  }

  /**
   * Call http get
   */
  public getTree(): Observable<DaNode> {
    return this.apiService.get(`${this.route}/tree`);
  }

  /**
   * Call http update
   * @param object json object
   */
  public update(object: Partial<DaFolderDTO>): Observable<DaFolder> {
    return this.apiService.put(this.route, object, DaFolderDTO);
  }

  /**
   * Call http delete
   * @param id id of the entity
   */
  public deleteById(id: string): Observable<DaFolder> {
    return this.apiService.deleteById(this.route, id, DaFolder);
  }
}
