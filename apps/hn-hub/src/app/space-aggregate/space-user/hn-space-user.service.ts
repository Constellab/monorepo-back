import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {HnSpaceUser} from './hn-space-user.entity';

@Injectable()
export class HnSpaceUserService {

  constructor(
    @InjectRepository(HnSpaceUser)
    private spaceUserRepository: Repository<HnSpaceUser>,
  ) {
  }

  public async findSpaceUserByIds(spaceId: string, userId: string): Promise<HnSpaceUser> {
    return this.spaceUserRepository.findOneBy({spaceId: spaceId, userId: userId});
  }

  public async createSpaceUser(spaceUser: HnSpaceUser): Promise<HnSpaceUser> {
    return this.spaceUserRepository.save(spaceUser);
  }

  public async updateSpaceUser(spaceUser: HnSpaceUser): Promise<HnSpaceUser> {
    await this.spaceUserRepository.update({spaceId: spaceUser.spaceId, userId: spaceUser.userId}, {
      role: spaceUser.role,
      active: spaceUser.active
    })
    return this.spaceUserRepository.findOneBy({spaceId: spaceUser.spaceId, userId: spaceUser.userId});
  }

  public async deleteSpaceUser(spaceUser: HnSpaceUser): Promise<void> {
    await this.spaceUserRepository.delete({spaceId: spaceUser.spaceId, userId: spaceUser.userId});
  }

}
