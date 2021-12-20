import {Injectable} from '@nestjs/common';
import {CnAbstractService} from '../cn-core/class/cn-abstract.service';
import {CnOrganization} from './cn-organization.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';

@Injectable()
export class CnOrganizationsService extends CnAbstractService<CnOrganization> {

  constructor(@InjectRepository(CnOrganization) private repository: Repository<CnOrganization>) {
    super(repository, CnOrganization);
  }

}
