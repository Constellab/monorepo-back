import {Injectable} from '@angular/core';
import {FlApiService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {HaBrick, HaBrickDTO} from '../ha-model/ha-entities/ha-brick.class';
import {HaNode} from '../ha-model/ha-entities/ha-node.class';
import {HaDocumentation} from '../ha-model/ha-entities/ha-documentation.class';
import {HaNewVersionDTO, HaVersionType} from '../ha-model/ha-entities/ha-version.class';
import {HaBrickVersion} from '../ha-model/ha-entities/ha-brick-version.class';
import {CmVersion} from '@monorepo/common-model';

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
    let versionArray: string[] = ['1', '0', '0']
    if (!(object.version instanceof CmVersion)) {
      versionArray = object.version.split('.');
    }
    object.version = object.versionType === HaVersionType.BETA ?
      new CmVersion(+versionArray[0], +versionArray[1], +versionArray[2], object.subPatch)
      : new CmVersion(+versionArray[0], +versionArray[1], +versionArray[2])
    return this.apiService.post(this.route, object, HaBrick);
    return null;
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
  public getDocByPath(brickName: string, path: string, version: string): Observable<HaDocumentation> {
    return this.apiService.post(`${this.route}/doc/${brickName}/${version}`, {path: path});
  }

  /**
   * Call http get to get the brick first doc
   */
  public getFirstDoc(brickName: string, version: string): Observable<HaDocumentation> {
    return this.apiService.get(`${this.route}/first-doc/${brickName}/${version}`);
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

  public getLastVersion(brickName: string): Observable<HaBrickVersion>{
    return this.apiService.get(`${this.route}/latest/${brickName}`)
  }

  /*Import the technical documentation of the brick*/
  public importTechnicalDocumentation(object: any): Observable<boolean>{
    return this.apiService.post(this.route + '/create-technical-doc', object);
  }

  public getTechnicalDocumentation(brickId: string, version: string): Observable<HaNode>{
    return this.apiService.get(`${this.route}/technical-doc/${brickId}/${version}`);;
  }
}
