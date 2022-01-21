import {Controller, Get, Req, Res} from '@nestjs/common';
import {HnUserService} from './hn-user.service';
import {BlPublic} from '@monorepo/back-core-lib';
import {HnUser} from './hn-user.entity';

@Controller('user')
export class HnUserController {
  constructor(private readonly userService: HnUserService) {
  }

  @Get()
  async getCurrent(): Promise<HnUser> {
    const u: HnUser = await this.userService.getCurrent();
    return u;
  }
}
