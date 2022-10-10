import {Injectable} from '@nestjs/common';
import {CnAbstractSecurityLayer} from '../cn-core/class/cn-abstract-security.layer';
import {CnLabConfig} from './cn-lab-config.entity';
import {CnLabConfigsService} from './cn-lab-configs.service';
import {CnAdminAuthorization} from '../cn-core/security/cn-admin.authorization';

@Injectable()
export class CnLabConfigsSecurityLayer extends CnAbstractSecurityLayer<CnLabConfig> {

  constructor(private service: CnLabConfigsService) {
    super(service);
  }

  async isAuthorizedToCreate(): Promise<boolean> {
    return false;
  }

  async isAuthorizedToDelete(): Promise<boolean> {
    return false;
  }

  async isAuthorizedToFindOne(): Promise<boolean> {
    return false;
  }

  async isAuthorizedToUpdate(): Promise<boolean> {
    return false;
  }


  // need to be an admin to get all
  async findAll(): Promise<CnLabConfig[]> {
    await new CnAdminAuthorization().checkAuthorization();

    return this.service.findAll();
  }

}
