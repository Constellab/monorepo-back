import {Body, Controller, Post} from '@nestjs/common';
import {FrontErrorsService} from './front-errors.service';
import {FrontError} from './front-error.entity';
import {BlParsePipe, BlPublic} from '@monorepo/back-core-lib';

@Controller('front-errors')
export class FrontErrorsController {

  constructor(private service: FrontErrorsService) {
  }

  /**
   * Log a front error
   */
  @BlPublic()
  @Post()
  create(@Body(new BlParsePipe(FrontError)) error: FrontError): Promise<FrontError> {
    return this.service.logFrontError(error);
  }

}
