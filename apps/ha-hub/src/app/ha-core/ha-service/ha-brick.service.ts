import {Injectable} from '@angular/core';
import {FlApiService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {HaBrick} from '../ha-model/ha-entities/ha-brick.class';
import {HaNode} from '../ha-model/ha-entities/ha-node.class';
import {HaDocumentation} from '../ha-model/ha-entities/ha-documentation.class';
import {HaNewVersionDTO} from '../ha-model/ha-entities/ha-version.class';

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
  public create(object: any): Observable<HaBrick> {
    object.version = '1.0.0';
    return this.apiService.post(this.route, object, HaBrick);
  }

  /**
   * Call http get to get the brick documentations
   */
  public getBrickDocs(brickId: string, version: string): Observable<HaNode> {
    return this.apiService.get(`${this.route}/docs/${brickId}/${version}`);
  }

  /**
   * Call http post to get the brick current doc
   */
  public getDocByPath(brickId: string, path: string, version: string): Observable<HaDocumentation> {
    return this.apiService.post(`${this.route}/doc/${brickId}/${version}`, {path: path});
  }

  /**
   * Call http get
   */
  public get(): Observable<HaBrick[]> {
    return this.apiService.get(this.route, HaBrick);
  }

  /**
   * Call http get
   * @param id id of the entity
   */
  public getById(id: string): Observable<HaBrick> {
    return this.apiService.get(`${this.route}/${id}`, HaBrick);
  }

  /**
   * Call http get
   * @param name name of the entity
   */
  public getByName(name: string): Observable<HaBrick> {
    return this.apiService.get(`${this.route}/name/${name}`, HaBrick);
  }

  public getRootFolderId(brickId: string, version: string): Observable<any>{
    return this.apiService.get(this.route + `/root-folder/${brickId}/${version}`);
  }

  public createNewVersion(newVersion: Partial<HaNewVersionDTO>): Observable<any>{
    return this.apiService.post(this.route + '/new-version', newVersion);
  }
}
