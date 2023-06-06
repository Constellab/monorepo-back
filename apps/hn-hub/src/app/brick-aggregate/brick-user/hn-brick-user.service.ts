import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {HnBrickUser, HnBrickUserStatus} from './hn-brick-user.entity';
import {EntityManager, Repository} from 'typeorm';
import {HnBrick} from '../brick/hn-brick.entity';
import {HnUser} from '../../users/hn-user.entity';

@Injectable()
export class HnBrickUserService {
  constructor(@InjectRepository(HnBrickUser) private readonly brickUserRepository: Repository<HnBrickUser>) {
  }

  createCreatorBrickUser(brick: HnBrick, user: HnUser, entityManager: EntityManager): Promise<HnBrickUser> {
    const brickUser = new HnBrickUser();
    brickUser.initBrickUser(brick, user, HnBrickUserStatus.CREATOR);
    return entityManager.save(brickUser);
  }

  createSimpleBrickUser(brick: HnBrick, user: HnUser): Promise<HnBrickUser> {
    const brickUser = new HnBrickUser();
    brickUser.initBrickUser(brick, user, HnBrickUserStatus.SIMPLE_USER);
    return this.brickUserRepository.save(brickUser);
  }

  async checkAndRemoveBrickUser(brickUserId: string): Promise<boolean> {
    const brickUser = await this.brickUserRepository.findOneBy({id: brickUserId});

    if(!brickUser){
      return false;
    }

    return (await this.brickUserRepository.remove(brickUser)) != null;
  }

  async getBrickUsers(brick: HnBrick): Promise<HnBrickUser[]> {
    return this.brickUserRepository.find({
      where: {
        brick: {
          id: brick.id
        },
        status: HnBrickUserStatus.SIMPLE_USER
      },
      relations: ['user']
    });
  }
}
