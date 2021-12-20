import {Controller} from '@nestjs/common';
import {CnOrganization} from './cn-organization.entity';
import {CnAbstractSecureController} from '../cn-core/class/cn-abstract-secure.controller';
import {CnOrganizationSecurityLayer} from './cn-organization-security.layer';

@Controller('organizations')
export class CnOrganizationsController extends CnAbstractSecureController<CnOrganization> {

  constructor(private securityLayer: CnOrganizationSecurityLayer) {
    super(securityLayer, CnOrganization);
  }
}
