import {Injectable} from '@nestjs/common';
import {CnExternalLabApiService} from './cn-external-lab-api.service';
import {CnExternalApiInfo} from '../cn-core/model/config/cn-config.class';
import {lastValueFrom} from 'rxjs';
import {CnProject} from '../cn-projects-aggregate/cn-projects/cn-project.entity';


/**
 * Service to call route for lab in the lab instance
 */
@Injectable()
export class CnExternalLabProjectService {

  private readonly route: string = 'project';

  constructor(private externalLabApiService: CnExternalLabApiService) {
  }


  public async addProjectInLab(labInfo: CnExternalApiInfo, projectTree: CnProject): Promise<void> {
    return lastValueFrom(this.externalLabApiService.post(labInfo, this.route, projectTree));
  }

  public async deleteProjectInLab(labInfo: CnExternalApiInfo, projectId: string): Promise<void> {
    return lastValueFrom(this.externalLabApiService.delete(labInfo, `${this.route}/${projectId}`));
  }
}

