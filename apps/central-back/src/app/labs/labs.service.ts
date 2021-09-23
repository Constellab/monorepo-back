import {Injectable} from '@nestjs/common';
import {AbstractService} from '../core/class/abstract.service';
import {Lab} from './lab.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {User} from '../users/user.entity';
import {CurrentUserHelper} from '../core/utils/current-user.helper';

@Injectable()
export class LabsService extends AbstractService<Lab> {

  constructor(@InjectRepository(Lab) private repository: Repository<Lab>) {
    super(repository, Lab);
  }

  public getCurrentLabs(): Promise<Lab[]> {
    const user: User = CurrentUserHelper.getAndCheckCurrentUser();

    return this.repository.find({
      where: {
        createdBy: {id: user.id},
      },
      order: {label: 'ASC'}
    });
  }

  public findAll(): Promise<Lab[]> {
    return this.repository.find({
      order: {label: 'ASC'}
    });
  }
}
