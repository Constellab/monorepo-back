import {Injectable} from '@nestjs/common';
import {AbstractSecurityLayer} from '../core/class/abstract-security.layer';
import {Protocol} from './protocol.entity';
import {ProtocolsService} from './protocols.service';
import {OwnerAuthorization} from '../core/security/owner.authorization';
import {Page} from '../core/model/config/page.class';

@Injectable()
export class ProtocolsSecurityLayer extends AbstractSecurityLayer<Protocol> {

  constructor(private service: ProtocolsService) {
    super(service);
  }

  async isAuthorizedToCreate(newEntity: Protocol): Promise<boolean> {
    return Promise.resolve(true);
  }

  async isAuthorizedToDelete(dbEntity: Protocol): Promise<boolean> {
    return new OwnerAuthorization().isAuthorized(dbEntity);
  }

  async isAuthorizedToFindOne(dbEntity: Protocol): Promise<boolean> {
    return new OwnerAuthorization().isAuthorized(dbEntity);
  }

  async isAuthorizedToUpdate(dbEntity: Protocol): Promise<boolean> {
    return Promise.resolve(false);
  }

  // for the check update we need to load the protocol with the list of experiments
  protected async getDbEntityForCheckUpdate(id: string): Promise<Protocol> {
    return this.service.findByIdWithExperiments(id);
  }

// no check because the protocols are filtered by userId
  getCurrentProtocols(page: number, size: number): Promise<Page<Protocol>> {
    return this.service.getCurrentProtocols(page, size);
  }


}
