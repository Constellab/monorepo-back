import {Injectable} from '@nestjs/common';
import {CnAbstractService} from '../cn-core/class/cn-abstract.service';
import {CnLab} from './cn-lab.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';

@Injectable()
export class CnLabsService extends CnAbstractService<CnLab> {

  constructor(@InjectRepository(CnLab) private repository: Repository<CnLab>) {
    super(repository, CnLab);
  }

  public getCurrentLabs(): Promise<CnLab[]> {
    const user: CnUser = CnCurrentUserHelper.getAndCheckCurrentUser();

    return this.repository.find({
      where: {
        createdBy: {id: user.id},
      },
      order: {label: 'ASC'}
    });
  }

  public findAll(): Promise<CnLab[]> {
    return this.repository.find({
      order: {label: 'ASC'}
    });
  }
}
