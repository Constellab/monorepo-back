import {Body, Controller, Post} from '@nestjs/common';
import {CnFrontErrorsService} from './cn-front-errors.service';
import {CnFrontError} from './cn-front-error.entity';
import {BlParsePipe, BlPublic} from '@monorepo/back-core-lib';

@Controller('front-errors')
export class CnFrontErrorsController {

  constructor(private service: CnFrontErrorsService) {
  }

  /**
   * Log a front error
   */
  @BlPublic()
  @Post()
  create(@Body(new BlParsePipe(CnFrontError)) error: CnFrontError): Promise<CnFrontError> {
    return this.service.logFrontError(error);
  }

}
