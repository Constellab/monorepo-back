import {Injectable} from '@nestjs/common';
import {HnAbstractLikeService} from '../like-core/hn-abstract-like.service';
import {HnLikeStory} from './hn-like-story.entity';
import {HnStoryService} from '../../story/hn-story.service';
import {InjectRepository} from '@nestjs/typeorm';
import {DataSource, Repository} from 'typeorm';
import {HnCurrentUserHelper} from '../../core/utils/hn-current-user.helper';
import {HnStory} from '../../story/hn-story.entity';

@Injectable()
export class HnLikeStoryService extends HnAbstractLikeService<HnStory> {
  constructor(
    @InjectRepository(HnLikeStory)
    private likeStoryRepository: Repository<HnLikeStory>,
    private storyService: HnStoryService,
    private dataSource: DataSource
  ) {
    super();
  }

  async like(storyId: string): Promise<HnStory> {
    if (await this.checkIfLiked(storyId)) {
      throw new Error('Story already liked');
    }
    const story = await this.storyService.findById(storyId);
    const like = new HnLikeStory();
    like.story = story;

    return await this.dataSource.transaction(async entityManager => {
      const newLike = await entityManager.save(like);
      if (!newLike) {
        throw new Error('Error while liking the story');
      }
      return this.storyService.addLike(newLike.story, entityManager);
    });
  }

  async unlike(storyId: string): Promise<HnStory> {
    if (!await this.checkIfLiked(storyId)) {
      throw new Error('Story not liked');
    }
    const like = await this.likeStoryRepository.findOne({
      where: {
        story: {
          id: storyId
        },
        likedBy: {
          id: HnCurrentUserHelper.getCurrentUser().id
        }
      }
    });

    return await this.dataSource.transaction(async entityManager => {
      const removedLike = await entityManager.remove(like);
      if (!removedLike) {
        throw new Error('Error while liking the story');
      }
      return await this.storyService.removeLike(removedLike.story, entityManager);
    });
  }

  async checkIfLiked(storyId: string): Promise<boolean> {
    const like = await this.likeStoryRepository.findOne({
      where: {
        story: {
          id: storyId
        },
        likedBy: {
          id: HnCurrentUserHelper.getCurrentUser().id
        }
      }
    });
    return like != null;
  }

}
