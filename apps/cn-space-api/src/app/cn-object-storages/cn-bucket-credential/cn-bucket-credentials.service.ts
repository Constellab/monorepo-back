import { Injectable } from '@nestjs/common';
import { BlAbstractService, BlBadRequestException } from '@monorepo/back-core-lib';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CnBucketCredentials } from './cn-bucket-credential.entity';
import { ClPage } from '@monorepo/core-lib';

@Injectable()
export class CnBucketCredentialsService extends BlAbstractService<CnBucketCredentials> {
  constructor(@InjectRepository(CnBucketCredentials) repository: Repository<CnBucketCredentials>) {
    super(repository, CnBucketCredentials);
  }

  async create(entity: CnBucketCredentials, entityManager?: EntityManager): Promise<CnBucketCredentials> {
    await this.checkBucketBeforeSave(entity);
    return super.create(entity, entityManager);
  }

  async update(entity: CnBucketCredentials, entityManager?: EntityManager): Promise<CnBucketCredentials> {
    await this.checkBucketBeforeSave(entity);
    return super.update(entity, entityManager);
  }

  private async checkBucketBeforeSave(credentials: CnBucketCredentials): Promise<void> {
    if (credentials.cloudProvider == null && credentials.space == null) {
      throw new BlBadRequestException('Cloud provider or space must be defined');
    }
  }

  public findAll(page: number, size: number): Promise<ClPage<CnBucketCredentials>> {
    return this.findPaginated(page, size, {
      relations: CnBucketCredentials.completeRelations,
    });
  }

  public findAllBySpaceId(spaceId: string, page: number, size: number): Promise<ClPage<CnBucketCredentials>> {
    return this.findPaginated(page, size, {
      relations: CnBucketCredentials.completeRelations,
      where: {
        space: { id: spaceId },
      },
    });
  }

  public async findCompleteByIdAndCheck(id: string): Promise<CnBucketCredentials> {
    return this.findByIdAndCheck(id, CnBucketCredentials.completeRelations);
  }
}
