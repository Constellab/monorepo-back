import {Injectable} from '@nestjs/common';
import {Study} from './study.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {AbstractWithStatusService} from '../core/class/abstract-with-status.service';
import {StudyStatus} from './study-status.enum';
import {StudyStatusHistory} from './study-status-history.entity';

@Injectable()
export class StudiesService extends AbstractWithStatusService<Study, StudyStatus> {

  constructor(@InjectRepository(Study) private repository: Repository<Study>,
              @InjectRepository(StudyStatusHistory) statusHistoRepository: Repository<StudyStatusHistory>) {
    super(repository, Study, statusHistoRepository, StudyStatusHistory);
  }

  getStudiesOfProject(projectId: string): Promise<Study[]> {
    return this.repository.find({
      where: {
        project: {id: projectId}
      },
      order: {lastModifiedAt: 'DESC'}
    });
  }

  getStudiesOfUser(userId: string): Promise<Study[]> {
    return this.repository.find({
      where: {
        createdBy: {id: userId}
      },
      order: {lastModifiedAt: 'DESC'}
    });
  }
}
