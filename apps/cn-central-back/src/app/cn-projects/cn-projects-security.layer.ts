import {Injectable} from '@nestjs/common';
import {CnAbstractSecurityLayer} from '../cn-core/class/cn-abstract-security.layer';
import {CnProject} from './cn-project.entity';
import {CnProjectsService} from './cn-projects.service';
import {CnAcceptAuthorization} from '../cn-core/security/cn-accept.authorization';
import {CnRefuseAuthorization} from '../cn-core/security/cn-refuse.authorization';
import {CnCreatedByAuthorization} from '../cn-core/security/cn-created-by.authorization';
import {CnProjectStatus} from './cn-project-status.enum';
import {CnProjectStatusHistory} from './cn-project-status-history.entity';
import {ClPageI} from '@monorepo/core-lib';

@Injectable()
export class CnProjectsSecurityLayer extends CnAbstractSecurityLayer<CnProject> {

  constructor(private service: CnProjectsService) {
    super(service);
  }

  async isAuthorizedToCreate(): Promise<boolean> {
    return new CnAcceptAuthorization().isAuthorized();
  }

  async isAuthorizedToDelete(): Promise<boolean> {
    return new CnRefuseAuthorization().isAuthorized();
  }

  async isAuthorizedToFindOne(dbEntity: CnProject): Promise<boolean> {
    return new CnCreatedByAuthorization().isAuthorized(dbEntity);
  }

  async isAuthorizedToUpdate(dbEntity: CnProject): Promise<boolean> {
    return new CnCreatedByAuthorization().isAuthorized(dbEntity);
  }

  getCurrentProjects(page: number, size: number): Promise<ClPageI<CnProject>> {
    // no security because we filter on user id
    return this.service.getCurrentProjects(page, size);
  }

  getProjectsOfUser(userId: string): Promise<CnProject[]> {
    // no security because we filter on user id
    return this.service.getProjectsOfUser(userId);
  }

  async updateCurrentStatus(status: CnProjectStatus, id: string): Promise<CnProject> {
    const project: CnProject = await this.getAndCheckAuthorizationToUpdateById(id);

    return this.service.updateCurrentStatusWithDbEntity(status, project);
  }

  async getStatusHistory(id: string): Promise<CnProjectStatusHistory[]> {
    // check that the user can get experiment
    await this.getAndCheckAuthorizationToFindById(id);

    return await this.service.getStatusHistory(id) as CnProjectStatusHistory[];
  }

}
