import {Injectable} from '@angular/core';
import {FlApiWithCacheService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {LabFlow} from '../model/global/lab-connection.class';
import {LabProtocol} from '../model/entities/process/lab-protocol.entity';
import {LabProcess} from '../model/entities/process/lab-process.entity';
import {LabAddProcessWithLink} from '../../lab-biox/module/lab-experiment-detail-page/model/lab-workflow-action.class';
import {labInstantiateProcess} from '../model/entities/process/lab-process.transform';
import {LabConfigValues} from '../model/entities/lab-config.entity';

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


  private initProtocolFlow(protocol: LabProtocol): LabFlow<LabProtocol> {
    return new LabFlow<LabProtocol>(protocol);
  }

  //////////////////////////////////////// PROCESS /////////////////////////////////////
  /**
   * Route to add a process (from type) to an existing protocol (can be a sub protocol)
   * @param protocolId
   * @param processTypingName
   */
  public addProcessToProtocol(protocolId: string, processTypingName: string): Observable<LabProcess> {
    return this.apiService.post(`${this.baseRoute}/${protocolId}/add-process/${processTypingName}`, null,
      (result) => labInstantiateProcess(result));
  }

  public deleteProcessInProtocol(protocolId: string, processInstanceName: string): Observable<any> {
    return this.apiService.delete(`${this.baseRoute}/${protocolId}/process/${processInstanceName}`);
  }

  //////////////////////////////////////// CONNECTION /////////////////////////////////////

  public addConnection(protocolId: string, connection: {
    output_process_name: string
    output_port_name: string
    input_process_name: string
    input_port_name: string
  }): Observable<void> {
    return this.apiService.post(`${this.baseRoute}/${protocolId}/connector`, connection);
  }

  public deleteConnection(protocolId: string, inputProcessName: string, inputPortName: string): Observable<void> {
    return this.apiService.delete(`${this.baseRoute}/${protocolId}/connector/${inputProcessName}/${inputPortName}`);
  }

  //////////////////////////////////////// CONFIG /////////////////////////////////////

  public saveProcessConfig(protocolId: string, processInstanceName: string, config: LabConfigValues): Observable<void> {
    return this.apiService.put(`${this.baseRoute}/${protocolId}/process/${processInstanceName}/config`, config);
  }

  //////////////////////////////////////// INTERFACE / OUTERFACE /////////////////////////////////////

  public deleteInterface(protocolId: string, interfaceName: string): Observable<void> {
    return this.apiService.delete(`${this.baseRoute}/${protocolId}/interface/${interfaceName}`);
  }

  public deleteOuterface(protocolId: string, outerfaceName: string): Observable<void> {
    return this.apiService.delete(`${this.baseRoute}/${protocolId}/outerface/${outerfaceName}`);
  }

  //////////////////////////////////////// SPECIFIC PROCESS /////////////////////////////////////

  public addSourceToProcessInput(protocolId: string, processName: string,
                                 inputPortName: string, resourceId: string): Observable<LabAddProcessWithLink> {
    return this.apiService.post(`${this.baseRoute}/${protocolId}/add-source/${processName}/${inputPortName}/${resourceId}`,
      null, LabAddProcessWithLink);
  }

  public addTaskOutput(protocolId: string, processName: string,
                       outputPortName: string): Observable<LabAddProcessWithLink> {
    return this.apiService.post(`${this.baseRoute}/${protocolId}/add-sink/${processName}/${outputPortName}`,
      null, LabAddProcessWithLink);
  }


}
