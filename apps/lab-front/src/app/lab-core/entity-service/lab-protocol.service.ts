import {Injectable} from '@angular/core';
import {FlApiWithCacheService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
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

  /**
   * Route to add a process (from type) to an existing protocol (can be a sub protocol),
   * and link it to the output of an existing process
   * @param protocolId
   * @param processTypingName
   * @param outputProcessName name of the process to link to
   * @param outputPortName name of the port to link to
   */
  public addProcessConnectedToOutput(protocolId: string, processTypingName: string,
                                     outputProcessName: string, outputPortName: string): Observable<LabAddProcessWithLink> {
    return this.apiService.post(
      `${this.baseRoute}/${protocolId}/add-process/${processTypingName}/connected-to-output/${outputProcessName}/${outputPortName}`,
      null, LabAddProcessWithLink);
  }

  /**
   * Route to add a process (from type) to an existing protocol (can be a sub protocol),
   * and link it to the output of an existing process
   * @param protocolId
   * @param processTypingName
   * @param inputProcessName name of the process to link to
   * @param inputPortName name of the port to link to
   */
  public addProcessConnectedToInput(protocolId: string, processTypingName: string,
                                    inputProcessName: string, inputPortName: string): Observable<LabAddProcessWithLink> {
    return this.apiService.post(
      `${this.baseRoute}/${protocolId}/add-process/${processTypingName}/connected-to-input/${inputProcessName}/${inputPortName}`,
      null, LabAddProcessWithLink);
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

  public addSourceToProcessInput(protocolId: string, resourceId: string,
                                 processName: string, inputPortName: string,): Observable<LabAddProcessWithLink> {
    return this.apiService.post(`${this.baseRoute}/${protocolId}/add-source/${resourceId}/${processName}/${inputPortName}`,
      null, LabAddProcessWithLink);
  }

  public addSource(protocolId: string, resourceId: string): Observable<LabProcess> {
    return this.apiService.post(`${this.baseRoute}/${protocolId}/add-source/${resourceId}`,
      null, (result) => labInstantiateProcess(result));
  }

  public addTaskOutput(protocolId: string, processName: string,
                       outputPortName: string): Observable<LabAddProcessWithLink> {
    return this.apiService.post(`${this.baseRoute}/${protocolId}/add-sink/${processName}/${outputPortName}`,
      null, LabAddProcessWithLink);
  }

  public addViewerToProcessOutput(protocolId: string, processName: string,
                                  outputPortName: string): Observable<LabAddProcessWithLink> {
    return this.apiService.post(`${this.baseRoute}/${protocolId}/add-viewer/${processName}/${outputPortName}`,
      null, LabAddProcessWithLink);
  }
}
