import {Injectable} from '@nestjs/common';
import {CnAbstractSecurityLayer} from '../cn-core/class/cn-abstract-security.layer';
import {CnOrganization} from './cn-organization.entity';
import {CnOrganizationsService} from './cn-organizations.service';
import {CnRefuseAuthorization} from '../cn-core/security/cn-refuse.authorization';
import {CnAcceptAuthorization} from '../cn-core/security/cn-accept.authorization';


@Injectable()
export class CnOrganizationSecurityLayer extends CnAbstractSecurityLayer<CnOrganization>{

  constructor(private service: CnOrganizationsService) {
    super(service);
  }

  async isAuthorizedToCreate(): Promise<boolean> {
    return new CnAcceptAuthorization().isAuthorized();
  }

  async isAuthorizedToDelete(): Promise<boolean> {
    return new CnRefuseAuthorization().isAuthorized();
  }

  async isAuthorizedToFindOne(): Promise<boolean> {
    return new CnAcceptAuthorization().isAuthorized();
  }

  async isAuthorizedToUpdate(): Promise<boolean> {
    return new CnRefuseAuthorization().isAuthorized();
  }


}
