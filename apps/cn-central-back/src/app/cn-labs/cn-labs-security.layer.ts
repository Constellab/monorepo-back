import {Injectable} from '@nestjs/common';
import {CnAbstractSecurityLayer} from '../cn-core/class/cn-abstract-security.layer';
import {CnLab} from './cn-lab.entity';
import {CnLabsService} from './cn-labs.service';
import {CnAdminAuthorization} from '../cn-core/security/cn-admin.authorization';
import {CnCreatedByAuthorization} from '../cn-core/security/cn-created-by.authorization';
import {CnAcceptAuthorization} from '../cn-core/security/cn-accept.authorization';

@Injectable()
export class CnLabsSecurityLayer extends CnAbstractSecurityLayer<CnLab> {

  constructor(private service: CnLabsService) {
    super(service);
  }

  async isAuthorizedToCreate(): Promise<boolean> {
    return new CnAcceptAuthorization().isAuthorized();
  }

  async isAuthorizedToDelete(dbEntity: CnLab): Promise<boolean> {
    return new CnCreatedByAuthorization().isAuthorized(dbEntity);
  }

  async isAuthorizedToFindOne(): Promise<boolean> {
    return Promise.resolve(false);
  }

  async isAuthorizedToUpdate(dbEntity: CnLab): Promise<boolean> {
    return new CnCreatedByAuthorization().isAuthorized(dbEntity);
  }

  getCurrentLabs(): Promise<CnLab[]> {
    // no security because it is filtered by user id
    return this.service.getCurrentLabs();
  }

  // need to be an admin to get all
  async findAll(): Promise<CnLab[]> {
    await new CnAdminAuthorization().checkAuthorization();

    return this.service.findAll();
  }

}
