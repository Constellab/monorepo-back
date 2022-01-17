import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {DnUser} from './hn-user.entity';
import {BlUserService} from '@monorepo/back-core-lib';

@Injectable()
export class HnUserService implements BlUserService{

  constructor(
    @InjectRepository(DnUser)
    private userRepository: Repository<DnUser>,
  ){}

  createOrUpdate(user: DnUser): Promise<DnUser>{
    return this.userRepository.save(user);
  }

  findOne(id: string): Promise<DnUser> {
    return this.userRepository.findOne(id);
  }
}
