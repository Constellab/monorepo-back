import { BlMailService } from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HnInviteStatus } from '../../core/model/config/hn-invite-status.enum';
import { HnFrontService } from '../../core/service/hn-front.service';
import { HnAbstractUserInviteService } from '../../core/service/hn-abstract-user-invite.service';
import { HnUserService } from '../../users/hn-user.service';
import { HnBrick } from '../brick/hn-brick.entity';
import { HnBrickUserInvite } from './hn-brick-user-invite.entity';
import { HnMailTemplate } from '../../core/model/config/hn-mail-template.class';

@Injectable()
export class HnBrickUserInviteService extends HnAbstractUserInviteService<HnBrickUserInvite, HnBrick> {
  constructor(
    @InjectRepository(HnBrickUserInvite)
    private brickUserInviteRepository: Repository<HnBrickUserInvite>,
    userService: HnUserService,
    frontService: HnFrontService,
    mailService: BlMailService
  ) {
    super(brickUserInviteRepository, userService, frontService, mailService);
  }

  protected async getPendingUserInvites(entityId: string): Promise<HnBrickUserInvite[]> {
    return this.brickUserInviteRepository.find({
      where: { brick: { id: entityId }, status: HnInviteStatus.PENDING },
    });
  }

  protected initNewUserInvite(entity: HnBrick): HnBrickUserInvite {
    const brickUserMail = new HnBrickUserInvite();
    brickUserMail.brick = entity;
    return brickUserMail;
  }

  protected getInviteEntityTitle(entity: HnBrick): string {
    return entity.name;
  }

  protected getFrontInviteUrl(token: string): string {
    return this.frontService.getBrickInviteUrl(token);
  }

  protected getExistingUserInviteMailTemplate(): string {
    return HnMailTemplate.brick_invite_existing_user;
  }

  protected getNewUserInviteMailTemplate(): string {
    return HnMailTemplate.brick_invite_new_user;
  }
}
