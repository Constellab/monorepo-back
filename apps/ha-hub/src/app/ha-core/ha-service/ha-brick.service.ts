import {Injectable} from '@angular/core';
import {FlApiService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {HaBrickDTO, HaBrick} from '../ha-model/ha-entities/ha-brick.class';
import {HaNode} from '../ha-model/ha-entities/ha-node.class';
import {HaDocumentation} from '../ha-model/ha-entities/ha-documentation.class';

@Injectable({
  providedIn: 'root'
})
export class HaBrickService {
  private readonly route: string = 'brick';

  constructor(private apiService: FlApiService) {

  }

  /**
   * Call http create
   * @param object json object
   */
  public create(object: Partial<HaBrickDTO>): Observable<HaBrick> {
    return this.apiService.post(this.route, object, HaBrickDTO);
  }

  /**
   * Call http post to get the brick documentations
   */
  public getBrickDocs(brickId: string): Observable<HaNode> {
    return this.apiService.post(`${this.route}/docs`, {id: brickId, version: 1});
  }

  /**
   * Call http post to get the brick current doc
   */
  public getDocByPath(brickId: string, path: string, version: number = 1): Observable<HaDocumentation> {
    console.log({id: brickId, path: path, version: version});
    return this.apiService.post(`${this.route}/doc`, {id: brickId, path: path, version: version});
  }

  /**
   * Call http get
   */
  public get(): Observable<HaBrick[]> {
    return this.apiService.get(this.route, HaBrick);
  }

  /**
   * Call http get
   * @param name name of the entity
   */
  public getByName(name: string): Observable<HaBrick> {
    return this.apiService.get(`${this.route}/name?name=${name}`, HaBrick);
  }
}
