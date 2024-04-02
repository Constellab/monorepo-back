import {Injectable} from '@nestjs/common';
import {HnAbstractLikeService} from '../like-core/hn-abstract-like.service';
import {HnLikeStory} from './hn-like-story.entity';
import {HnStoryService} from '../../story/hn-story.service';
import {InjectRepository} from '@nestjs/typeorm';
import {DataSource, EntityManager, Repository} from 'typeorm';
import {HnStory} from '../../story/hn-story.entity';
import {HnLikeBrick} from '../like-brick/hn-like-brick.entity';

@Injectable()
export class HnLikeStoryService extends HnAbstractLikeService<HnStory> {
  constructor(
    private storyService: HnStoryService,
    @InjectRepository(HnLikeStory) likeStoryRepository: Repository<HnLikeStory>,
    dataSource: DataSource
  ) {
    super(likeStoryRepository, dataSource);
  }

  async getEntityById(entityId: string): Promise<HnStory> {
    return this.storyService.findById(entityId);
  }

  async addLike(entityManager: EntityManager, entity: HnStory): Promise<HnStory> {
    return this.storyService.addLike(entity, entityManager);
  }

  async removeLike(entityManager: EntityManager, entity: HnStory): Promise<HnStory> {
    return this.storyService.removeLike(entity, entityManager);
  }

  async saveLike(entityManager: EntityManager, like: HnLikeStory): Promise<HnLikeStory> {
    return entityManager.save(like);
  }

  createLike(entity: HnStory): HnLikeStory {
    const like: HnLikeStory = new HnLikeStory();
    like.entity = entity;
    return like;
  }
}
