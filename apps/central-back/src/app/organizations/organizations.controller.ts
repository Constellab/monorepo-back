import {Controller} from '@nestjs/common';
import {Organization} from './organization.entity';
import {AbstractSecureController} from '../core/class/abstract-secure.controller';
import {OrganizationSecurityLayer} from './organization-security.layer';

@Controller('organizations')
export class OrganizationsController extends AbstractSecureController<Organization> {

  constructor(private securityLayer: OrganizationSecurityLayer) {
    super(securityLayer, Organization);
  }
}
