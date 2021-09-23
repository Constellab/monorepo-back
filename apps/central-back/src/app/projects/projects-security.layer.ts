import {Injectable} from '@nestjs/common';
import {AbstractSecurityLayer} from '../core/class/abstract-security.layer';
import {Project} from './project.entity';
import {ProjectsService} from './projects.service';
import {AcceptAuthorization} from '../core/security/accept.authorization';
import {RefuseAuthorization} from '../core/security/refuse.authorization';
import {CreatedByAuthorization} from '../core/security/created-by.authorization';
import {ProjectStatus} from './project-status.enum';
import {ProjectStatusHistory} from './project-status-history.entity';
import {ClPage} from '@monorepo/core-lib';

@Injectable()
export class ProjectsSecurityLayer extends AbstractSecurityLayer<Project> {

  constructor(private service: ProjectsService) {
    super(service);
  }

  async isAuthorizedToCreate(): Promise<boolean> {
    return new AcceptAuthorization().isAuthorized();
  }

  async isAuthorizedToDelete(): Promise<boolean> {
    return new RefuseAuthorization().isAuthorized();
  }

  async isAuthorizedToFindOne(dbEntity: Project): Promise<boolean> {
    return new CreatedByAuthorization().isAuthorized(dbEntity);
  }

  async isAuthorizedToUpdate(dbEntity: Project): Promise<boolean> {
    return new CreatedByAuthorization().isAuthorized(dbEntity);
  }

  getCurrentProjects(page: number, size: number): Promise<ClPage<Project>> {
    // no security because we filter on user id
    return this.service.getCurrentProjects(page, size);
  }

  async updateCurrentStatus(status: ProjectStatus, id: string): Promise<Project> {
    const project: Project = await this.getAndCheckAuthorizationToUpdateById(id);

    return this.service.updateCurrentStatusWithDbEntity(status, project);
  }

  async getStatusHistory(id: string): Promise<ProjectStatusHistory[]> {
    // check that the user can get experiment
    await this.getAndCheckAuthorizationToFindById(id);

    return await this.service.getStatusHistory(id) as ProjectStatusHistory[];
  }

}
