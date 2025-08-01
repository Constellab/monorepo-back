import { BlAbstractService } from '@monorepo/back-core-lib';
import { ClPage, ClStringHelper } from '@monorepo/core-lib';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CnHierarchyObject } from '../cn-hierarchy-objects/cn-hierarchy-object.entity';
import { CnHierarchyObjectTokenSaveDTO } from './cn-hierarchy-object-token.dto';
import { CnHierarchyObjectToken, CnHierarchyObjectTokenEntity } from './cn-hierarchy-object-token.entity';

@Injectable()
export class CnHierarchyObjectTokenService extends BlAbstractService<CnHierarchyObjectTokenEntity> {
  constructor(
    @InjectRepository(CnHierarchyObjectTokenEntity)
    private repository: Repository<CnHierarchyObjectTokenEntity>
  ) {
    super(repository, CnHierarchyObjectTokenEntity);
  }

  async findByIdAndCheckBasic(id: string): Promise<CnHierarchyObjectToken> {
    return super.findByIdAndCheck(id);
  }

  async createAccessToken(
    hierarchyObject: CnHierarchyObject,
    saveDTO: CnHierarchyObjectTokenSaveDTO
  ): Promise<CnHierarchyObjectToken> {
    const accessToken = new CnHierarchyObjectTokenEntity();
    accessToken.hierarchyObject = hierarchyObject;
    accessToken.token = ClStringHelper.generateUUID() + '_' + new Date().getTime();
    accessToken.expirationDate = saveDTO.expirationDate;

    return this.repository.save(accessToken);
  }

  async updateAccessToken(
    accessTokenId: string,
    saveDTO: CnHierarchyObjectTokenSaveDTO
  ): Promise<CnHierarchyObjectToken> {
    return this.updatePartial(accessTokenId, { expirationDate: saveDTO.expirationDate });
  }

  async findByToken(token: string): Promise<CnHierarchyObjectTokenEntity | null> {
    return this.repository.findOne({
      where: {
        token,
      },
      relations: {
        hierarchyObject: true,
      },
    });
  }

  async findByHierarchyObjectId(
    hierarchyObjectId: string,
    page: number,
    size: number
  ): Promise<ClPage<CnHierarchyObjectToken>> {
    return this.findPaginated(page, size, {
      where: {
        hierarchyObject: {
          id: hierarchyObjectId,
        },
      },
      order: { expirationDate: 'ASC' },
    });
  }
}
