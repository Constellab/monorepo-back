import {Controller} from '@nestjs/common';
import {HnUserService} from './hn-user.service';

@Controller('user')
export class HnUserController {
  constructor(private readonly userService: HnUserService) {
  }
}
