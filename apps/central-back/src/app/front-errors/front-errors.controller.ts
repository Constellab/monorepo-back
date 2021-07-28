import {Body, Controller, Post} from '@nestjs/common';
import {ParsePipe} from '../core/pipes/parse.pipe';
import {FrontErrorsService} from './front-errors.service';
import {FrontError} from './front-error.entity';
import {Public} from '../core/decorators/public.decorator';

@Controller('front-errors')
export class FrontErrorsController {

  constructor(private service: FrontErrorsService) {
  }

  /**
   * Log a front error
   */
  @Public()
  @Post()
  create(@Body(new ParsePipe(FrontError)) error: FrontError): Promise<FrontError> {
    return this.service.logFrontError(error);
  }

}
