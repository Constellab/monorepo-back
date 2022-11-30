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

    if (credentials.space) {
      const existingCredentials = await this.findBySpaceId(credentials.space.id);
      if (existingCredentials) {
        throw new BadRequestException(`There is already a bucket credential for the space ${credentials.space.name}`);
      }
    }

    return super.create(credentials, entityManager);
  }

  public async findBySpaceId(spaceId: string): Promise<CnBucketCredentials | null> {
    return this.repository.findOneBy({space: {id: spaceId}});
  }

  public async findBySpaceIdAndCheck(spaceId: string): Promise<CnBucketCredentials> {
    const credential = await this.findBySpaceId(spaceId);

    if (!credential) {
      throw new BadRequestException(`There is no bucket credential for the space ${spaceId}`);
    }
    return credential;
  }

  public findAll(page: number, size: number): Promise<ClPage<CnBucketCredentials>> {
    return this.findPaginated(page, size, {
      relations: {
        space: true,
        cloudProvider: true
      }
    });
  }

  // TODO temporary until we have a better way to handle the bucket credentials
  public findFirst(): Promise<CnBucketCredentials> {
    return this.repository.findOne({});
  }
}
