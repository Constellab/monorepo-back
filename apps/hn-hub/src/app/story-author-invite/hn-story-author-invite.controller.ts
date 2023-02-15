import { Controller } from '@nestjs/common';
import { HnStoryAuthorInviteService } from './hn-story-author-invite.service';

@Controller('hn-story-author-mail')
export class HnStoryAuthorInviteController {
  constructor(
    private readonly hnStoryAuthorMailService: HnStoryAuthorInviteService
  ) {}
}
