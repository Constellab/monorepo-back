import {Injectable} from '@nestjs/common';
import {CnOrganization} from './cn-organization.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {BlAbstractService} from '@monorepo/back-core-lib';
import {ClPage} from '@monorepo/core-lib';

@Injectable()
export class CnOrganizationsService extends BlAbstractService<CnOrganization> {

  constructor(@InjectRepository(CnOrganization) private repository: Repository<CnOrganization>) {
    super(repository, CnOrganization);
  }


  public async getAll(page: number, size: number): Promise<ClPage<CnOrganization>> {
    return this.findPaginated(page, size, {order: {label: 'ASC'}});
  }


  public findByDomain(domain: string): Promise<CnOrganization | null> {
    return this.repository.findOneBy({domain});
  }
}
