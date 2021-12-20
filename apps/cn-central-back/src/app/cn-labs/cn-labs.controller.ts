import {Controller, Get} from '@nestjs/common';
import {CnLab} from './cn-lab.entity';
import {CnUserCategories} from '../cn-core/decorators/cn-user-category.decorator';
import {CnLabsSecurityLayer} from './cn-labs-security.layer';
import {CnAbstractSecureController} from '../cn-core/class/cn-abstract-secure.controller';
import {CmUserCategory} from '@monorepo/common-model';

@Controller('labs')
export class CnLabsController extends CnAbstractSecureController<CnLab> {

  constructor(private securityLayer: CnLabsSecurityLayer) {
    super(securityLayer, CnLab);
  }

  /**
   * return the list of labs created by the current user
   */
  @Get('current')
  public getCurrentLabs(): Promise<CnLab[]> {
    return this.securityLayer.getCurrentLabs();
  }

  /**
   * return the list of all labs
   */
  @CnUserCategories(CmUserCategory.ADMIN)
  @Get('')
  public findAll(): Promise<CnLab[]> {
    return this.securityLayer.findAll();
  }
}
