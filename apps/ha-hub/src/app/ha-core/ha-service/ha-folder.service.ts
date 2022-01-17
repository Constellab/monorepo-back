import { Injectable } from '@angular/core';
import { FlApiService } from '@monorepo/front-core-lib'
import { Observable } from 'rxjs';
import {HaFolder, HaFolderDTO} from '../ha-model/ha-entities/ha-folder.class';
import {HaNode} from '../ha-model/ha-entities/ha-node.class';

/**
 * Service to manage documentation entity
 */
@Injectable({
  providedIn: 'root'
})
export class HaFolderService {

  private readonly route: string = 'folder';
  constructor(private apiService: FlApiService){

  }

  /**
   * Call http create
   * @param object json object
   */
  public create(object: Partial<HaFolderDTO>): Observable<HaFolder> {
    return this.apiService.post(this.route, object, HaFolderDTO);
  }

  /**
   * Call http get one by id
   * @param id id of the entity
   */
  public getById(id: string): Observable<HaFolder> {
    return this.apiService.getById(this.route, id, HaFolder);
  }

  /**
   * Call http get
   */
  public get(): Observable<HaFolder[]> {
    return this.apiService.get(this.route, HaFolder);
  }

  /**
   * Call http update
   * @param object json object
   */
  public update(object: Partial<HaFolderDTO>): Observable<HaFolder> {
    return this.apiService.put(this.route, object, HaFolderDTO);
  }

  /**
   * Call http delete
   * @param id id of the entity
   */
  public deleteById(id: string): Observable<HaFolder> {
    return this.apiService.deleteById(this.route, id, HaFolder);
  }
}
