import { BlUserCategory } from '@monorepo/back-core-lib';
import { Controller, Get } from '@nestjs/common';

import { CnUserCategories } from '../cn-core/decorators/cn-user-category.decorator';
import { CnLabConfig } from './cn-lab-config.entity';
import { CnLabConfigsService } from './cn-lab-configs.service';

@Controller('lab-configs')
export class CnLabConfigsController {
  constructor(private service: CnLabConfigsService) {}

  /**
   * return the list of all labs
   */
  @CnUserCategories(BlUserCategory.ADMIN)
  @Get('')
  public findAll(): Promise<CnLabConfig[]> {
    return this.service.findAll();
  }
}
