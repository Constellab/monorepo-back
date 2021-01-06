import {Controller} from '@nestjs/common';
import {BricksService} from './bricks.service';

@Controller('bricks')
export class BricksController {

  constructor(private service: BricksService) {
  }


}
