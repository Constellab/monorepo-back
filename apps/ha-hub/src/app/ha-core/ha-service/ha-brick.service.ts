import {Injectable} from '@angular/core';
import {FlApiService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {HaBrick, HaBrickCreationDTO, HaBrickDTO, HaEditBrickDTO} from '../ha-model/ha-entities/ha-brick.class';
import {HaNode} from '../ha-model/ha-entities/ha-node.class';
import {HaDocumentation, HaDocumentationSearchDTO} from '../ha-model/ha-entities/ha-documentation.class';
import {HaNewVersionDTO, HaReferenceDTO, HaVersionType} from '../ha-model/ha-entities/ha-version.class';
import {HaBrickVersion} from '../ha-model/ha-entities/ha-brick-version.class';
import {CmVersion} from '@monorepo/common-model';
import {TdTypeEntity} from '@monorepo/technical-doc';

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
  public create(object: Partial<HaBrickCreationDTO>): Observable<HaBrick> {
    object.version = object.isBeta ?
      CmVersion.fromString(object.version + '-beta.' + object.subPatch)
      : CmVersion.fromString(object.version as string);
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

  public getRootFolderId(brickId: string, version: string): Observable<any> {
    return this.apiService.get(this.route + `/root-folder/${brickId}/${version}`);
  }

  public createNewVersion(newVersion: Partial<HaNewVersionDTO>, technicalInfo: Record<string, any>,
                          references?: HaReferenceDTO[]): Observable<any> {
    if (references && references.length > 0) {
      newVersion.references = references;
    }
    newVersion.technicalInfo = technicalInfo;
    return this.apiService.post(this.route + '/new-version', newVersion);
  }

  public getLastVersion(brickName: string): Observable<HaBrickVersion> {
    return this.apiService.get(`${this.route}/latest/${brickName}`)
  }

  /*Import the technical documentation of the brick*/
  public importTechnicalDocumentation(object: any): Observable<boolean> {
    return this.apiService.post(this.route + '/create-technical-doc', object);
  }

  public getTechnicalDocumentation(brickId: string, version: string): Observable<HaNode> {
    return this.apiService.get(`${this.route}/technical-doc/${brickId}/${version}`);
    ;
  }

  public getTechDocByPath(brickName: string, brickVersion: string,
                          techDocType: string, techDocUniqueName: string): Observable<TdTypeEntity> {
    return this.apiService.post(`${this.route}/technical-doc-by-path`, {
      brickName: brickName,
      brickVersion: brickVersion,
      techDocType: techDocType,
      techDocUniqueName: techDocUniqueName
    });
  }


  //EDIT BRICK
  public editBrick(editedBrick: HaEditBrickDTO): Observable<HaBrick> {
    return this.apiService.put(`${this.route}/edit`, editedBrick);
  }

  //VERIFY IF BRICK IT'S A NEW BRICK VERSION
  public isActualBrickAndNewVersion(brickId: string, inputBrickName: string, inputBrickVersion: string): Observable<[boolean, boolean]> {
    return this.apiService.post(`${this.route}/is-actual-brick-and-new-version`, {
      brickId,
      inputBrickName,
      inputBrickVersion
    });
  }

  public findDocumentationByBrickNameMajor(brickName: string, major: string): Observable<HaDocumentationSearchDTO[]>{
    return this.apiService.get(`${this.route}/get-docs-by-name/${brickName}/${major}`);
  }

  public findDocumentationByLink(link: string): Observable<HaDocumentationSearchDTO>{
    return this.apiService.post(`${this.route}/get-doc-by-link`, {link: link});
  }
}
