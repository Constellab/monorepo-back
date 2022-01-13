import {Injectable} from '@angular/core';
import {FlApiWithCacheService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {LabFlow} from '../model/global/lab-connection.class';
import {LabProtocol} from '../model/entities/process/lab-protocol.entity';
import {LabProcess} from '../model/entities/process/lab-process.entity';
import {LabAddProcessWithLink} from '../../lab-biox/module/lab-experiment-detail-page/model/lab-workflow-action.class';
import {labInstantiateProcess} from '../model/entities/process/lab-process.transform';

@Injectable({
  providedIn: 'root'
})
export class LabProtocolService {

  private readonly baseRoute: string = 'protocol';


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
      labInstantiateProcess);
  }

  private initProtocolFlow(protocol: LabProtocol): LabFlow<LabProtocol> {
    return new LabFlow<LabProtocol>(protocol);
  }

  //////////////////////////////////////// SPECIFIC PROCESS /////////////////////////////////////

  public addSourceToProcessInput(protocolId: string, processName: string,
                                 inputPortName: string, resourceId: string): Observable<LabAddProcessWithLink> {
    return this.apiService.post(`${this.baseRoute}/${protocolId}/add-source/${processName}/${inputPortName}/${resourceId}`,
      null, LabAddProcessWithLink);
  }

  public addSinkToProcessOutput(protocolId: string, processName: string,
                                outputPortName: string): Observable<LabAddProcessWithLink> {
    return this.apiService.post(`${this.baseRoute}/${protocolId}/add-sink/${processName}/${outputPortName}`,
      null, LabAddProcessWithLink);
  }


}
