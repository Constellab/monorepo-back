import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {HnUser} from './hn-user.entity';
import {BlUserService} from '@monorepo/back-core-lib';
import {HnCurrentUserHelper} from '../core/utils/hn-current-user.helper';

@Injectable()
export class HnUserService implements BlUserService{

  constructor(
    @InjectRepository(HnUser)
    private userRepository: Repository<HnUser>
  ){}

  createOrUpdate(user: HnUser): Promise<HnUser>{
    return this.userRepository.save(user);
  }

  async findOne(id: string): Promise<HnUser> {
    return await this.userRepository.findOneBy({id: id});
  }

  async getCurrent(): Promise<HnUser>{
    return HnCurrentUserHelper.getCurrentUser();
  }
}
