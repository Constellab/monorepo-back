import { BlNotFoundException } from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HnTagKey } from '../../tag-aggregate/tag-key/hn-tag-key.entity';
import { HnTagKeyService } from '../../tag-aggregate/tag-key/hn-tag-key.service';
import { HnAbstractLikeService } from '../like-core/hn-abstract-like.service';
import { HnLikeTag } from './hn-like-tag.entity';

@Injectable()
export class HnLikeTagService extends HnAbstractLikeService<HnTagKey> {
  constructor(
    private tagKeyService: HnTagKeyService,
    @InjectRepository(HnLikeTag) likeTagRepository: Repository<HnLikeTag>,
    eventEmitter: EventEmitter2
  ) {
    super(likeTagRepository, eventEmitter);
  }

  async getEntityAndCheckById(entityId: string): Promise<HnTagKey> {
    const tagKey = await this.tagKeyService.getTagKeyById(entityId);
    if (!tagKey) {
      throw new BlNotFoundException(`TagKey with id ${entityId} not found`);
    }
    return tagKey;
  }

  createLike(entity: HnTagKey): HnLikeTag {
    const tagLike: HnLikeTag = new HnLikeTag();
    tagLike.entity = entity;
    return tagLike;
  }
}
