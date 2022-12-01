import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {CnLabInstanceProject} from './cn-lab-instance-project.entity';
import {EntityManager, Repository} from 'typeorm';
import {CnLabInstance} from '../cn-lab-instance.entity';
import {CnProject} from '../../cn-projects-aggregate/cn-projects/cn-project.entity';
import {CnErrorText} from '../../cn-core/model/config/cn-error-text.class';
import {BlBadRequestException} from '@monorepo/back-core-lib';


@Injectable()
export class CnLabInstanceProjectService {

  constructor(@InjectRepository(CnLabInstanceProject) private repository: Repository<CnLabInstanceProject>) {
  }


  public async createLabInstanceProject(labInstance: CnLabInstance, project: CnProject,
                                        entityManager: EntityManager): Promise<CnLabInstanceProject> {
    const labInstanceProjectDb = await this.findByLabInstanceIdAndProjectId(labInstance.id, project.id);

    if (labInstanceProjectDb) {
      throw new BlBadRequestException(CnErrorText.PROJECT_ALREADY_SHARED_WITH_LAB);
    }

    const labInstanceProject = new CnLabInstanceProject();
    labInstanceProject.labInstance = labInstance;
    labInstanceProject.project = project;

    return entityManager.save(labInstanceProject);
  }

  public async deleteLabInstanceProject(labInstanceId: string, projectId: string, entityManager: EntityManager): Promise<void> {
    const labInstanceProject = await this.findByLabInstanceIdAndProjectId(labInstanceId, projectId);

    if (labInstanceProject == null) {
      throw new BlBadRequestException(CnErrorText.PROJECT_NOT_SHARED_WITH_LAB);
    }

    await entityManager.remove(labInstanceProject);
  }

  private async findByLabInstanceIdAndProjectId(labInstanceId: string, projectId: string): Promise<CnLabInstanceProject> {
    return this.repository.findOneBy({labInstanceId, projectId});
  }

  public async findByLabInstanceId(labInstanceId: string): Promise<CnLabInstanceProject[]> {
    return this.repository.find({
      where: {
        labInstanceId: labInstanceId
      },
      relations: {
        project: true
      }
    });
  }
}
