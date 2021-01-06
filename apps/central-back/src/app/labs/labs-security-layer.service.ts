import {Injectable} from '@nestjs/common';
import {AbstractSecurityLayer} from '../core/class/abstract-security.layer';
import {Lab} from './lab.entity';
import {LabsService} from './labs.service';
import {AdminAuthorization} from '../core/security/admin.authorization';
import {OwnerAuthorization} from '../core/security/owner.authorization';
import {AcceptAuthorization} from '../core/security/accept.authorization';

@Injectable()
export class LabsSecurityLayer extends AbstractSecurityLayer<Lab> {

  constructor(private service: LabsService) {
    super(service);
  }

  async isAuthorizedToCreate(): Promise<boolean> {
    return new AcceptAuthorization().isAuthorized();
  }

  async isAuthorizedToDelete(dbEntity: Lab): Promise<boolean> {
    return new OwnerAuthorization().isAuthorized(dbEntity);
  }

  async isAuthorizedToFindOne(): Promise<boolean> {
    return Promise.resolve(false);
  }

  async isAuthorizedToUpdate(dbEntity: Lab): Promise<boolean> {
    return new OwnerAuthorization().isAuthorized(dbEntity);
  }

  getCurrentLabs(): Promise<Lab[]> {
    // no security because it is filtered by user id
    return this.service.getCurrentLabs();
  }

  // need to be an admin to get all
  async findAll(): Promise<Lab[]> {
    await new AdminAuthorization().checkAuthorization();

    return this.service.findAll();
  }

}
