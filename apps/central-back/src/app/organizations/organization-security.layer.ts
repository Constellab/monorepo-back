import {Injectable} from '@nestjs/common';
import {AbstractSecurityLayer} from '../core/class/abstract-security.layer';
import {Organization} from './organization.entity';
import {OrganizationsService} from './organizations.service';
import {RefuseAuthorization} from '../core/security/refuse.authorization';
import {AcceptAuthorization} from '../core/security/accept.authorization';


@Injectable()
export class OrganizationSecurityLayer extends AbstractSecurityLayer<Organization>{

  constructor(private service: OrganizationsService) {
    super(service);
  }

  async isAuthorizedToCreate(): Promise<boolean> {
    return new AcceptAuthorization().isAuthorized();
  }

  async isAuthorizedToDelete(): Promise<boolean> {
    return new RefuseAuthorization().isAuthorized();
  }

  async isAuthorizedToFindOne(): Promise<boolean> {
    return new AcceptAuthorization().isAuthorized();
  }

  async isAuthorizedToUpdate(): Promise<boolean> {
    return new RefuseAuthorization().isAuthorized();
  }


}
