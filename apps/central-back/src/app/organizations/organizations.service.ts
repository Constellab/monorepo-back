import {Injectable} from '@nestjs/common';
import {AbstractService} from '../core/class/abstract.service';
import {Organization} from './organization.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';

@Injectable()
export class OrganizationsService extends AbstractService<Organization> {

  constructor(@InjectRepository(Organization) private repository: Repository<Organization>) {
    super(repository, Organization);
  }

}
