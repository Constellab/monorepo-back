import {Injectable} from '@nestjs/common';
import {ExternalLabApiService} from './external-lab-api.service';
import {LabServerInfo} from '../core/model/config/lab-server-info.class';
import {Experiment} from '../experiments/experiment.entity';
import {AxiosResponse} from 'axios';
import {ExternalExperimentClass} from './external-lab-api.class';

/**
 * Service to route in a lab about the experiment
 */
@Injectable()
export class ExternalLabExperimentService {

  private readonly route: string = 'experiment';

  constructor(private externalLabService: ExternalLabApiService) {
  }

  public async createExperiment(experiment: Experiment): Promise<any> {
    // build the experiment in lab format
    const externalExperiment: ExternalExperimentClass = {
      uri: experiment.id,
      protocol: {
        uri: experiment.protocol.id,
        graph: JSON.parse(experiment.protocol.json)
      }
    };
    return await this.externalLabService.postStatusResponse(experiment.labInstance, `${this.route}/create`,
      externalExperiment).toPromise();
  }

  public closeExperiment(labInfo: LabServerInfo, experimentId: string): Promise<AxiosResponse<void>> {
    return this.externalLabService.put(labInfo, `api/${this.route}/${experimentId}/close`, experimentId).toPromise();
  }
}

