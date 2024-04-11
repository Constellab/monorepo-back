import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {HnSpaceUser, HnSpaceUserRole} from './hn-space-user.entity';
import {BlUnauthorizedException} from '@monorepo/back-core-lib';
import {HnCurrentUserHelper} from '../../core/utils/hn-current-user.helper';

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

  public async findActiveSpaceUsersByUserId(userId: string): Promise<HnSpaceUser[]> {
    return this.spaceUserRepository.find({
      where: {
        userId: userId,
        active: true
      },
      relations: ['space', 'user']
    });
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

  public async checkSpaceUser(spaceId: string, userId: string): Promise<boolean> {
    const spaceUser = await this.findSpaceUserByIds(spaceId, userId);
    return spaceUser != null;
  }

  public async checkCurrentUserIsSpaceUser(spaceId: string): Promise<boolean> {
    const currentUser = HnCurrentUserHelper.getCurrentUser();
    return await this.checkSpaceUser(spaceId, currentUser.id);
  }

  public async assertUserIsSpaceUser(spaceId: string, userId: string): Promise<void> {
    if(!(await this.checkSpaceUser(spaceId, userId))) {
      throw new BlUnauthorizedException('User is not space user');
    }
  }

  public async assertCurrentUserIsSpaceUser(spaceId: string): Promise<void> {
    if(HnCurrentUserHelper.getCurrentUser() == null){
      throw new BlUnauthorizedException('Current user is not authenticated');
    }
    if(!(await this.checkSpaceUser(spaceId, HnCurrentUserHelper.getCurrentUser().id))){
      throw new BlUnauthorizedException('Current user is not space user');
    }
  }


  public async checkSpaceUserAdmin(spaceId: string, userId: string): Promise<boolean> {
    const spaceUser = await this.findSpaceUserByIds(spaceId, userId);
    return spaceUser && spaceUser.role === HnSpaceUserRole.ADMIN;
  }

  public async checkCurrentUserIsSpaceAdmin(spaceId: string): Promise<boolean> {
    return await this.checkSpaceUserAdmin(spaceId, HnCurrentUserHelper.getCurrentUser().id);
  }

  public async assertCurrentUserIsSpaceAdmin(spaceId: string): Promise<void> {
    if(HnCurrentUserHelper.getCurrentUser() == null){
      throw new BlUnauthorizedException('Current user is not authenticated');
    }
    if(!(await this.checkSpaceUserAdmin(spaceId, HnCurrentUserHelper.getCurrentUser().id))){
      throw new BlUnauthorizedException('Current user is not space admin');
    }
  }
}
