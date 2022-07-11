import {Controller, Get} from '@nestjs/common';
import {HnUserService} from './hn-user.service';
import {HnUser} from './hn-user.entity';

@Controller('user')
export class HnUserController {
  constructor(private readonly userService: HnUserService) {
  }

  @Get()
  async getCurrent(): Promise<HnUser> {
    return await this.userService.getCurrent();
  }
}
