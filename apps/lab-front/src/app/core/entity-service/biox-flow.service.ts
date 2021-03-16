import {Injectable} from '@angular/core';
import {FlApiService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {BioxFlow} from '../model/entities/biox-flow.entity';
import {map} from 'rxjs/operators';
import {clRxjsDebug} from '@monorepo/core-lib';


@Injectable({
  providedIn: 'root'
})
export class BioxFlowService {


  constructor(private apiService: FlApiService) {
  }


  /////////////////////// FLOW ////////////////////////
  public getExperimentFlow(id: string): Observable<BioxFlow> {
    return this.getFlow(id, 'experiment_uri');

  }

  public getProtocolFlow(id: string): Observable<BioxFlow> {
    return this.getFlow(id, 'protocol_job_uri');
  }

  private getFlow(id: string, objectType: string): Observable<BioxFlow> {
    return this.apiService.get(`job/flow?${objectType}=${id}`, BioxFlow).pipe(
      map(flow => this.initFlowConnections(flow)),
      clRxjsDebug(),
    );
  }

  private initFlowConnections(flow: BioxFlow): BioxFlow {
    console.log(flow);
    flow.initConnectionsAndNodes();
    return flow;
  }


}
