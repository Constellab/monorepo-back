import {Controller, Get} from '@nestjs/common';
import {HnUserService} from './hn-user.service';
import {HnUser, HnUserConstellabDTO} from './hn-user.entity';
import {EventPattern} from '@nestjs/microservices';

@Controller('user')
export class HnUserController {
  constructor(private readonly userService: HnUserService) {
  }

  @Get()
  async getCurrent(): Promise<HnUser> {
    return await this.userService.getCurrent();
  }

  @EventPattern('user')
  handleUserCreated(userDto: HnUserConstellabDTO): Promise<void> {
    return this.userService.createOrUpdate(userDto);
  }
}
