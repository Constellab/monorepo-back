import {Controller, Get, Param, Post} from '@nestjs/common';
import {HnLikeAggregateService} from './hn-like-aggregate.service';
import {BlPublic} from '@monorepo/back-core-lib';
import {HnBrick} from '../brick-aggregate/brick/hn-brick.entity';

@Controller('like-brick')
export class HnLikeBrickController {
  constructor(private readonly likeAggregateService: HnLikeAggregateService) {
  }

  @BlPublic()
  @Get(':brickId')
  async checkIfLiked(@Param('brickId') brickId: string): Promise<boolean> {
    return this.likeAggregateService.checkIfBrickIsLiked(brickId);
  }

  @Post(':brickId/like')
  async likeBrick(@Param('brickId') brickId: string): Promise<HnBrick> {
    return this.likeAggregateService.likeBrick(brickId);
  }

  @Post(':brickId/unlike')
  async unlikeBrick(@Param('brickId') brickId: string): Promise<HnBrick> {
    return this.likeAggregateService.unlikeBrick(brickId);
  }

}
