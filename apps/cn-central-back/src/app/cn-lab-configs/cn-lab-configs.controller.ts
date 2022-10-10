import {Controller, Get} from '@nestjs/common';
import {CnLabConfig} from './cn-lab-config.entity';
import {CnUserCategories} from '../cn-core/decorators/cn-user-category.decorator';
import {CnLabConfigsSecurityLayer} from './cn-lab-configs-security-layer.service';
import {CmUserCategory} from '@monorepo/common-model';

@Controller('lab-configs')
export class CnLabConfigsController {

  constructor(private securityLayer: CnLabConfigsSecurityLayer) {
  }

  /**
   * return the list of all labs
   */
  @CnUserCategories(CmUserCategory.ADMIN)
  @Get('')
  public findAll(): Promise<CnLabConfig[]> {
    return this.securityLayer.findAll();
  }
}
