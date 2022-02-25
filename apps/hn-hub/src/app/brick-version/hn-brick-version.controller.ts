import {Controller, Put} from '@nestjs/common';
import {HnBrickVersionService} from './hn-brick-version.service';

@Controller('brick-version')
export class HnBrickVersionController {
  constructor(private readonly brickVersionService: HnBrickVersionService) {
  }


  /**
   * Route to send all the brick version to the queue
   */
  @Put('send-all-to-queue')
  sendAllToQueue(): Promise<void> {
    return this.brickVersionService.sendAllBrickVersionToQueue();
  }

}
