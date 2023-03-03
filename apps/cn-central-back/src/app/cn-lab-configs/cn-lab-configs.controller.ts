import {Controller, Get} from '@nestjs/common';
import {CnLabConfig} from './cn-lab-config.entity';
import {CnUserCategories} from '../cn-core/decorators/cn-user-category.decorator';
import {CmUserCategory} from '@monorepo/common-model';
import {CnLabConfigsService} from './cn-lab-configs.service';

@Controller('lab-configs')
export class CnLabConfigsController {

  constructor(private service: CnLabConfigsService) {
  }

  /**
   * return the list of all labs
   */
  @CnUserCategories(CmUserCategory.ADMIN)
  @Get('')
  public findAll(): Promise<CnLabConfig[]> {
    return this.service.findAll();
  }
}
