import {Injectable} from '@angular/core';
import {FlApiWithCacheService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ClConstructorFunction, ClCoreJsonConvert, clRxjsDebug} from '@monorepo/core-lib';
import {BioxFlow} from '../model/global/biox-connection.class';
import {BioxProtocol} from '../model/entities/process/biox-protocol.entity';
import {BioxProcess} from '../model/entities/process/biox-process.entity';
import {BioxTask} from '../model/entities/process/biox-task.entity';
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
   * Route to add a process (from type) to an existing protocol (can be a sub protocol)
   * @param protocolId
   * @param process_typing_name
   */
  public addProcessToProtocol(protocolId: string, process_typing_name: string): Observable<BioxProcess> {
    return this.apiService.post(`${this.baseRoute}/${protocolId}/add-process/${process_typing_name}`, null,
      this.instantiateProcess);
  }

  /**
   * Method to instantiate the correct process object when getting it from DB
   * @param json
   */
  private instantiateProcess: ClConstructorFunction<BioxProcess> = (json: any): BioxProcess => {
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
