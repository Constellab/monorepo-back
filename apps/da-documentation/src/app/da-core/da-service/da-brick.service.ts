import {Injectable} from '@angular/core';
import {FlApiService} from '@monorepo/front-core-lib';
import {DaFolder, DaFolderDTO} from '../da-model/da-entities/da-folder.class';
import {Observable} from 'rxjs';
import {DaBrick, DaBrickDTO} from '../da-model/da-entities/da-brick.class';

@Injectable({
  providedIn: 'root'
})
export class DaBrickService {
  private readonly route: string = 'brick';
  constructor(private apiService: FlApiService){

  }

  /**
   * Call http create
   * @param object json object
   */
  public create(object: Partial<DaBrickDTO>): Observable<DaBrick> {
    return this.apiService.post(this.route, object, DaBrickDTO);
  }

  /**
   * Call http get
   */
  public get(): Observable<DaBrick[]> {
    return this.apiService.get(this.route, DaBrick);
  }

  /**
   * Call http get
   * @param name name of the entity
   */
  public getByName(name: string): Observable<DaBrick> {
    return this.apiService.get(`${this.route}/name?name=${name}`, DaBrick);
  }
}
