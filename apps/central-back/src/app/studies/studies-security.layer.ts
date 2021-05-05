import {Injectable} from '@nestjs/common';
import {AbstractSecurityLayer} from '../core/class/abstract-security.layer';
import {Study} from './study.entity';
import {StudiesService} from './studies.service';
import {RefuseAuthorization} from '../core/security/refuse.authorization';
import {CreatedByAuthorization} from '../core/security/created-by.authorization';
import {ProjectsSecurityLayer} from '../projects/projects-security.layer';
import {StudyStatus} from './study-status.enum';
import {StudyStatusHistory} from './study-status-history.entity';

@Injectable()
export class StudiesSecurityLayer extends AbstractSecurityLayer<Study> {

  constructor(private service: StudiesService,
              private projectSecurityLayer: ProjectsSecurityLayer) {
    super(service);
  }

  // not used see createStudy
  async isAuthorizedToCreate(): Promise<boolean> {
    return new RefuseAuthorization().isAuthorized();
  }

  async isAuthorizedToDelete(): Promise<boolean> {
    return new RefuseAuthorization().isAuthorized();
  }

  async isAuthorizedToFindOne(dbEntity: Study): Promise<boolean> {
    return new CreatedByAuthorization().isAuthorized(dbEntity);
  }

  async isAuthorizedToUpdate(dbEntity: Study): Promise<boolean> {
    return new CreatedByAuthorization().isAuthorized(dbEntity);
  }

  async createStudy(study: Study, projectId: string): Promise<Study> {
    // check that the user can update the project
    study.project = await this.projectSecurityLayer.getAndCheckAuthorizationToUpdateById(projectId);

    return this.service.createWithStatus(study, StudyStatus.STARTED);
  }

  async getStudiesOfProject(projectId: string): Promise<Study[]> {
    // check that the user can get the project
    await this.projectSecurityLayer.getAndCheckAuthorizationToFindById(projectId);

    return this.service.getStudiesOfProject(projectId);
  }


  /////////////////////// STATUS ////////////////////////////
  async updateCurrentStatus(status: StudyStatus, id: string): Promise<Study> {
    const study: Study = await this.getAndCheckAuthorizationToUpdateById(id);

    return this.service.updateCurrentStatusWithDbEntity(status, study);
  }

  async getStatusHistory(id: string): Promise<StudyStatusHistory[]> {
    // check that the user can get study
    await this.getAndCheckAuthorizationToFindById(id);

    return await this.service.getStatusHistory(id) as StudyStatusHistory[];
  }

}
