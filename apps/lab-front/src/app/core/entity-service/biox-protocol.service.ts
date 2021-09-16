import {Injectable} from '@angular/core';
import {FlApiWithCacheService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ClConstructorFunction, ClCoreJsonConvert, clRxjsDebug} from '@monorepo/core-lib';
import {BioxFlow} from '../model/global/biox-connection.class';
import {BioxProtocol} from '../model/entities/proccesable/biox-protocol.entity';
import {BioxProcessable} from '../model/entities/proccesable/biox-processable.entity';
import {BioxTask} from '../model/entities/proccesable/biox-task.entity';
import {BioxLabTypeEntity, BioxLabTypeEntityTree} from '../model/entities/lab-type/biox-lab-type.entity';
import {createTypedTree} from '../model/global/typed-tree.class';
import {BioxProtocolType} from '../model/entities/lab-type/biox-protocol-type.entity';

@Injectable({
  providedIn: 'root'
})
export class BioxProtocolService {

  private readonly baseRoute: string = 'protocol';
  private readonly typeRoute: string = 'protocol-type';


  constructor(private apiService: FlApiWithCacheService) {
  }

  public getProtocol(protocolId: string): Observable<BioxProtocol> {
    return this.apiService.get(`${this.baseRoute}/${protocolId}`, BioxProtocol);
  }


  public getProtocolAsFlow(protocolId: string): Observable<BioxFlow<BioxProtocol>> {
    return this.getProtocol(protocolId).pipe(
      map(flow => this.initProtocolFlow(flow)),
      clRxjsDebug(),
    );
  }

  /**
   * Route to add a processable (from type) to an existing protocol (can be a sub protocol)
   * @param protocolId
   * @param processable_typing_name
   */
  public addProcessableToProtocol(protocolId: string, processable_typing_name: string): Observable<BioxProcessable> {
    return this.apiService.post(`${this.baseRoute}/${protocolId}/add-process/${processable_typing_name}`, null,
      this.instantiateProcessable);
  }

  /**
   * Method to instantiate the correct processable object when getting it from DB
   * @param json
   */
  private instantiateProcessable: ClConstructorFunction<BioxProcessable> = (json: any): BioxProcessable => {
    // if this is a resource file
    if (json.is_protocol) {
      return ClCoreJsonConvert.deserializeObject(json, BioxProtocol);
    } else {
      return ClCoreJsonConvert.deserializeObject(json, BioxTask);
    }
  };

  private initProtocolFlow(protocol: BioxProtocol): BioxFlow<BioxProtocol> {
    console.log(protocol);
    return new BioxFlow<BioxProtocol>(protocol);
  }


  //////////////////////////////////// TYPE ////////////////////////////

  public getProtocolTypesTree(): Observable<BioxLabTypeEntityTree[]> {
    return this.apiService.get(`${this.typeRoute}/tree`, createTypedTree(BioxLabTypeEntity));
  }

  public getProtocolType(id: string): Observable<BioxProtocolType> {
    return this.apiService.getByIdWithCache(`${this.typeRoute}`, id, BioxProtocolType);
  }
}
