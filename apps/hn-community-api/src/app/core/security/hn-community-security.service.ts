import { BlUnauthorizedException } from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';

import { HnSpaceAggregateService } from '../../space-aggregate/hn-space-aggregate.service';

@Injectable()
export class HnCommunitySecurity {
  constructor(private spaceAggregateService: HnSpaceAggregateService) {}

  isCreator(entity: { createdBy?: { id: string } }, userId: string): boolean {
    return entity.createdBy?.id === userId;
  }

  assertIsCreator(entity: { createdBy?: { id: string } }, userId: string): void {
    if (!this.isCreator(entity, userId)) {
      throw new BlUnauthorizedException('You are not the creator of this resource');
    }
  }

  isCoAuthor(coAuthors: { user: { id: string } }[], userId: string): boolean {
    return coAuthors?.some((coAuthor) => coAuthor.user.id === userId) ?? false;
  }

  isCreatorOrCoAuthor(
    entity: { createdBy?: { id: string } },
    coAuthors: { user: { id: string } }[],
    userId: string
  ): boolean {
    return this.isCreator(entity, userId) || this.isCoAuthor(coAuthors, userId);
  }

  assertIsCreatorOrCoAuthor(
    entity: { createdBy?: { id: string } },
    coAuthors: { user: { id: string } }[],
    userId: string
  ): void {
    if (!this.isCreatorOrCoAuthor(entity, coAuthors, userId)) {
      throw new BlUnauthorizedException('You are not authorized to perform this action');
    }
  }

  assertIsAdmin(user: { isAdmin(): boolean }): void {
    if (!user.isAdmin()) {
      throw new BlUnauthorizedException();
    }
  }

  async assertSpaceMembership(entity: { space?: { id: string } }, userId: string): Promise<void> {
    if (entity.space) {
      await this.spaceAggregateService.assertCheckSpaceUser(entity.space.id, userId);
    }
  }
}
