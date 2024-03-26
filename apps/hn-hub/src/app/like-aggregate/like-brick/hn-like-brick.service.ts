import {Injectable} from '@nestjs/common';
import {HnAbstractLikeService} from '../like-core/hn-abstract-like.service';
import {HnLikeBrick} from './hn-like-brick.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {DataSource, Repository} from 'typeorm';
import {HnCurrentUserHelper} from '../../core/utils/hn-current-user.helper';
import {HnBrick} from '../../brick-aggregate/brick/hn-brick.entity';
import {HnBrickAggregateService} from '../../brick-aggregate/hn-brick-aggregate.service';

@Injectable()
export class HnLikeBrickService extends HnAbstractLikeService<HnBrick> {
  constructor(
    @InjectRepository(HnLikeBrick)
    private likeBrickRepository: Repository<HnLikeBrick>,
    private brickAggregateService: HnBrickAggregateService,
    private dataSource: DataSource
  ) {
    super();
  }

  async like(brickId: string): Promise<HnBrick> {
    if (await this.checkIfLiked(brickId)) {
      throw new Error('Brick already liked');
    }
    const brick = await this.brickAggregateService.findBrickById(brickId);

    if (!brick) {
      throw new Error('Brick not found');
    }

    const like = new HnLikeBrick();
    like.brick = brick;

    return await this.dataSource.transaction(async entityManager => {
      const newLike = await entityManager.save(like);
      if (!newLike) {
        throw new Error('Error while liking the brick');
      }
      return this.brickAggregateService.addLike(newLike.brick, entityManager);
    });
  }

  async unlike(brickId: string): Promise<HnBrick> {
    if (!await this.checkIfLiked(brickId)) {
      throw new Error('Brick not liked');
    }
    const like = await this.likeBrickRepository.findOne({
      where: {
        brick: {
          id: brickId
        },
        likedBy: {
          id: HnCurrentUserHelper.getCurrentUser().id
        }
      }
    });

    return await this.dataSource.transaction(async entityManager => {
      const removedLike = await entityManager.remove(like);
      if (!removedLike) {
        throw new Error('Error while liking the brick');
      }
      return await this.brickAggregateService.removeLike(removedLike.brick, entityManager);
    });
  }

  async checkIfLiked(brickId: string): Promise<boolean> {
    const like = await this.likeBrickRepository.findOne({
      where: {
        brick: {
          id: brickId
        },
        likedBy: {
          id: HnCurrentUserHelper.getCurrentUser().id
        }
      }
    });
    return like != null;
  }

}
