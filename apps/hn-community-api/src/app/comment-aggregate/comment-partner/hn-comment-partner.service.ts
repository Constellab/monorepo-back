import { TeRichText } from '@monorepo/te-text-editor';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HnPartner } from '../../partner/hn-partner.entity';
import { HnPartnerService } from '../../partner/hn-partner.service';
import { HnAbstractCommentService } from '../comment-core/hn-abstract-comment.service';
import { HnCommentPartner } from './hn-comment-partner.entity';

@Injectable()
export class HnCommentPartnerService extends HnAbstractCommentService<HnPartner> {
  constructor(
    private partnerService: HnPartnerService,
    @InjectRepository(HnCommentPartner) commentPartnerRepository: Repository<HnCommentPartner>,
    eventEmitter: EventEmitter2
  ) {
    super(commentPartnerRepository, eventEmitter);
  }

  async getEntityByIdAndCheck(entityId: string): Promise<HnPartner> {
    return this.partnerService.findByIdAndCheck(entityId);
  }

  getEntityClass(): typeof HnCommentPartner {
    return HnCommentPartner;
  }

  createComment(entity: HnPartner, commentData: TeRichText): HnCommentPartner {
    const comment: HnCommentPartner = new HnCommentPartner();
    comment.entityId = entity.id;
    comment.entity = entity;
    comment.setContentRichText(commentData);
    return comment;
  }
}
