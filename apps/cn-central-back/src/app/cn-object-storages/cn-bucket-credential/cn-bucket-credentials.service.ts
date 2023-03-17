import {Injectable} from '@nestjs/common';
import {BlAbstractService, BlBadRequestException} from '@monorepo/back-core-lib';
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

    if (credentials.space) {
      const existingCredentials = await this.findBySpaceId(credentials.space.id);
      if (existingCredentials) {
        throw new BlBadRequestException(`There is already a bucket credential for the space ${credentials.space.name}`);
      }
    }

    return super.create(credentials, entityManager);
  }

  public async findBySpaceId(spaceId: string): Promise<CnBucketCredentials | null> {
    return this.repository.findOneBy({space: {id: spaceId}});
  }

  public findAll(page: number, size: number): Promise<ClPage<CnBucketCredentials>> {
    return this.findPaginated(page, size, {
      relations: {
        space: true,
        cloudProvider: true
      }
    });
  }

  public findByName(name: string): Promise<CnBucketCredentials | null> {
    return this.repository.findOneBy({name: name});
  }
}
