import {Injectable} from '@nestjs/common';
import {CnOrganization} from './cn-organization.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {BlAbstractService} from '@monorepo/back-core-lib';

@Injectable()
export class CnOrganizationsService extends BlAbstractService<CnOrganization> {

  constructor(@InjectRepository(CnOrganization) private repository: Repository<CnOrganization>) {
    super(repository, CnOrganization);
  }

}
