import {Controller} from '@nestjs/common';
import {CnBricksService} from './cn-bricks.service';

@Controller('bricks')
export class CnBricksController {

  constructor(private service: CnBricksService) {
  }


}
