import {Injectable} from '@angular/core';
import {FlApiWithCacheService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ClConstructorFunction, ClCoreJsonConvert} from '@monorepo/core-lib';
import {LabFlow} from '../model/global/lab-connection.class';
import {LabProtocol} from '../model/entities/process/lab-protocol.entity';
import {LabProcess} from '../model/entities/process/lab-process.entity';
import {LabTask} from '../model/entities/process/lab-task.entity';
import {LabTypeEntity, LabTypeEntityTree} from '../model/entities/lab-type/lab-type.entity';
import {labCreateTypedTree} from '../model/global/lab-typed-tree.class';
import {LabProtocolType} from '../model/entities/lab-type/lab-protocol-type.entity';

@Injectable({
  providedIn: 'root'
})
export class LabProtocolService {

  private readonly baseRoute: string = 'protocol';
  private readonly typeRoute: string = 'protocol-type';


  constructor(private apiService: FlApiWithCacheService) {
  }

  public getProtocol(protocolId: string): Observable<LabProtocol> {
    return this.apiService.get(`${this.baseRoute}/${protocolId}`, LabProtocol);
  }


  public getProtocolAsFlow(protocolId: string): Observable<LabFlow<LabProtocol>> {
    return this.getProtocol(protocolId).pipe(
      map(flow => this.initProtocolFlow(flow)),
    );
  }

  /**
   * Route to add a process (from type) to an existing protocol (can be a sub protocol)
   * @param protocolId
   * @param process_typing_name
   */
  public addProcessToProtocol(protocolId: string, process_typing_name: string): Observable<LabProcess> {
    return this.apiService.post(`${this.baseRoute}/${protocolId}/add-process/${process_typing_name}`, null,
      this.instantiateProcess);
  }

  /**
   * Method to instantiate the correct process object when getting it from DB
   * @param json
   */
  private instantiateProcess: ClConstructorFunction<LabProcess> = (json: any): LabProcess => {
    // if this is a resource file
    if (json.is_protocol) {
      return ClCoreJsonConvert.deserializeObject(json, LabProtocol);
    } else {
      return ClCoreJsonConvert.deserializeObject(json, LabTask);
    }
  };

  private initProtocolFlow(protocol: LabProtocol): LabFlow<LabProtocol> {
    return new LabFlow<LabProtocol>(protocol);
  }


  //////////////////////////////////// TYPE ////////////////////////////

  public getProtocolTypesTree(): Observable<LabTypeEntityTree[]> {
    return this.apiService.get(`${this.typeRoute}/tree`, labCreateTypedTree(LabTypeEntity));
  }

  public getProtocolType(id: string): Observable<LabProtocolType> {
    return this.apiService.getByIdWithCache(`${this.typeRoute}`, id, LabProtocolType);
  }
}
