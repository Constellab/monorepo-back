import {Controller} from '@nestjs/common';
import {DnUserService} from './dn-user.service';

@Controller('user')
export class DnUserController {
  constructor(private readonly userService: DnUserService) {
  }
}
