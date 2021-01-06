import {Controller, Get} from '@nestjs/common';
import {Lab} from './lab.entity';
import {UserCategories} from '../core/decorators/user-category.decorator';
import {UserCategory} from '../users/user-category.enum';
import {LabsSecurityLayer} from './labs-security-layer.service';
import {AbstractSecureController} from '../core/class/abstract-secure.controller';

@Controller('labs')
export class LabsController extends AbstractSecureController<Lab> {

  constructor(private securityLayer: LabsSecurityLayer) {
    super(securityLayer, Lab);
  }

  /**
   * return the list of labs created by the current user
   */
  @Get('current')
  public getCurrentLabs(): Promise<Lab[]> {
    return this.securityLayer.getCurrentLabs();
  }

  /**
   * return the list of all labs
   */
  @UserCategories(UserCategory.ADMIN)
  @Get('')
  public findAll(): Promise<Lab[]> {
    return this.securityLayer.findAll();
  }
}
