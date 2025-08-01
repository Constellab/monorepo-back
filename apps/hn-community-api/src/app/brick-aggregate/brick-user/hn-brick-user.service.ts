import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HnUser } from '../../users/hn-user.entity';
import { HnBrick } from '../brick/hn-brick.entity';
import { HnBrickUser } from './hn-brick-user.entity';

@Injectable()
export class HnBrickUserService {
  constructor(@InjectRepository(HnBrickUser) private readonly brickUserRepository: Repository<HnBrickUser>) {}

  createBrickUser(brick: HnBrick, user: HnUser): Promise<HnBrickUser> {
    const brickUser = new HnBrickUser();
    brickUser.initBrickUser(brick, user);
    return this.brickUserRepository.save(brickUser);
  }

  async checkAndRemoveBrickUser(brickId: string, brickUserId: string): Promise<void> {
    const brickUser: HnBrickUser = await this.brickUserRepository.findOneBy({
      brick: { id: brickId },
      user: { id: brickUserId },
    });
    if (brickUser) {
      await this.brickUserRepository.remove(brickUser);
    }
  }

  async getBrickUsersByUser(user: HnUser): Promise<HnBrickUser[]> {
    return this.brickUserRepository.find({
      where: {
        user: {
          id: user.id,
        },
      },
      relations: ['brick'],
    });
  }

  async getBrickUsers(brick: HnBrick): Promise<HnBrickUser[]> {
    return this.brickUserRepository.find({
      where: {
        brick: {
          id: brick.id,
        },
      },
      relations: ['user'],
    });
  }
}
