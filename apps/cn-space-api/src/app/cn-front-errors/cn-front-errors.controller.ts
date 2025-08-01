import { BlParsePipe, BlPublicSecure } from '@monorepo/back-core-lib';
import { Body, Controller, Post } from '@nestjs/common';

import { CnFrontError } from './cn-front-error.entity';
import { CnFrontErrorsService } from './cn-front-errors.service';

@Controller('front-errors')
export class CnFrontErrorsController {
  constructor(private service: CnFrontErrorsService) {}

  /**
   * Log a front error
   */
  @BlPublicSecure()
  @Post()
  create(@Body(new BlParsePipe(CnFrontError)) error: CnFrontError): Promise<CnFrontError> {
    return this.service.logFrontError(error);
  }
}
