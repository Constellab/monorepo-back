import {BadRequestException, Injectable} from '@nestjs/common';
import {BlAbstractService} from '@monorepo/back-core-lib';
import {InjectRepository} from '@nestjs/typeorm';
import {EntityManager, Repository} from 'typeorm';
import {CnBucketCredentials} from './cn-bucket-credential.entity';
import {ClPage} from '@monorepo/core-lib';

@Injectable()
export class CnBucketCredentialsService extends BlAbstractService<CnBucketCredentials> {


  constructor(@InjectRepository(CnBucketCredentials) private repository: Repository<CnBucketCredentials>) {
    super(repository, CnBucketCredentials);
  }

  public async create(credentials: CnBucketCredentials, entityManager?: EntityManager): Promise<CnBucketCredentials> {

    if (credentials.organization) {
      const existingCredentials = await this.findByOrganizationId(credentials.organization.id);
      if (existingCredentials) {
        throw new BadRequestException(`There is already a bucket credential for the organization ${credentials.organization.label}`);
      }
    }

    return super.create(credentials, entityManager);
  }

  public async findByOrganizationId(organizationId: string): Promise<CnBucketCredentials | null> {
    return this.repository.findOneBy({organization: {id: organizationId}});
  }

  public async findByOrganizationIdAndCheck(organizationId: string): Promise<CnBucketCredentials> {
    const credential = await this.findByOrganizationId(organizationId);

    if (!credential) {
      throw new BadRequestException(`There is no bucket credential for the organization ${organizationId}`);
    }
    return credential;
  }

  public findAll(page: number, size: number): Promise<ClPage<CnBucketCredentials>> {
    return this.findPaginated(page, size, {
      relations: {
        organization: true,
        cloudProvider: true
      }
    });
  }
}
