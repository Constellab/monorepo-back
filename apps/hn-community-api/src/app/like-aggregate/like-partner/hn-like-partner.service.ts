import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HnPartner } from '../../partner/hn-partner.entity';
import { HnPartnerService } from '../../partner/hn-partner.service';
import { HnAbstractLikeService } from '../like-core/hn-abstract-like.service';
import { HnLikePartner } from './hn-like-partner.entity';

@Injectable()
export class HnLikePartnerService extends HnAbstractLikeService<HnPartner> {
  constructor(
    private partnerService: HnPartnerService,
    @InjectRepository(HnLikePartner) likePartnerRepository: Repository<HnLikePartner>,
    eventEmitter: EventEmitter2
  ) {
    super(likePartnerRepository, eventEmitter);
  }

  async getEntityAndCheckById(entityId: string): Promise<HnPartner> {
    return this.partnerService.findByIdAndCheck(entityId);
  }

  createLike(entity: HnPartner): HnLikePartner {
    const like: HnLikePartner = new HnLikePartner();
    like.entity = entity;
    return like;
  }
}
