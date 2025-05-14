import { Injectable } from '@nestjs/common';
import { CnHierarchyObjectTokenService } from './cn-hierarchy-object-token.service';
import { CnFoldersSecurityService } from '../cn-security/cn-folders-security.service';
import { CnHierarchyObject } from '../cn-hierarchy-objects/cn-hierarchy-object.entity';
import { CnCurrentUserHelper } from '../../cn-core/utils/cn-current-user.helper';
import { BlUnauthorizedException } from '@monorepo/back-core-lib';
import { CnHierarchyObjectToken } from './cn-hierarchy-object-token.entity';
import { CnHierarchyObjectTokenDTO, CnHierarchyObjectTokenSaveDTO } from './cn-hierarchy-object-token.dto';
import { CnFrontService } from '../../cn-core/services/cn-front.service';
import { ClPageI } from '@monorepo/core-lib';

@Injectable()
export class CnHierarchyObjectTokenAggregateService {
  constructor(
    private hierarchyObjectTokenService: CnHierarchyObjectTokenService,
    private securityService: CnFoldersSecurityService,
    private frontService: CnFrontService
  ) {}

  public getHierarchyObjectByAccessToken(): CnHierarchyObject {
    return this.getCurrentHierarchyObject();
  }

  private getCurrentHierarchyObject(): CnHierarchyObject {
    const authContext = CnCurrentUserHelper.getAndCheckAuthContext();
    if (authContext.type !== 'hierarchyObjectToken') {
      throw new BlUnauthorizedException();
    }
    return authContext.hierarchyObject;
  }

  /////////////////////////////////////// TOKEN MANAGEMENT ///////////////////////////////////////

  public async createAccessToken(
    hierarchyObjectId: string,
    saveDTO: CnHierarchyObjectTokenSaveDTO
  ): Promise<CnHierarchyObjectTokenDTO> {
    const hierarchyObject = await this.securityService.getAndCheckAuthorizationForUpdate(hierarchyObjectId);
    const hierarchyObjectToken = await this.hierarchyObjectTokenService.createAccessToken(
      hierarchyObject,
      saveDTO
    );
    return this.toDTO(hierarchyObjectToken);
  }

  public async updateAccessToken(
    accessTokenId: string,
    saveDTO: CnHierarchyObjectTokenSaveDTO
  ): Promise<CnHierarchyObjectTokenDTO> {
    await this.getByAccessTokenIdAndCheckAuthorization(accessTokenId);
    const hierarchyObjectToken = await this.hierarchyObjectTokenService.updateAccessToken(
      accessTokenId,
      saveDTO
    );
    return this.toDTO(hierarchyObjectToken);
  }

  public async deleteAccessToken(accessTokenId: string): Promise<void> {
    await this.getByAccessTokenIdAndCheckAuthorization(accessTokenId);
    await this.hierarchyObjectTokenService.deleteById(accessTokenId);
  }

  public async findByHierarchyObjectId(
    hierarchyObjectId: string,
    page: number,
    size: number
  ): Promise<ClPageI<CnHierarchyObjectTokenDTO>> {
    await this.securityService.getAndCheckAuthorizationForUpdate(hierarchyObjectId);
    const tokens = await this.hierarchyObjectTokenService.findByHierarchyObjectId(
      hierarchyObjectId,
      page,
      size
    );

    return tokens.map((token) => this.toDTO(token));
  }

  private toDTO(hierarchyObjectToken: CnHierarchyObjectToken): CnHierarchyObjectTokenDTO {
    const spaceDomain = CnCurrentUserHelper.getAndCheckCurrentSpace().domain;
    return new CnHierarchyObjectTokenDTO(
      hierarchyObjectToken,
      this.frontService.getHierarchyObjectTokenUrl(spaceDomain, hierarchyObjectToken.token)
    );
  }

  private async getByAccessTokenIdAndCheckAuthorization(
    accessTokenId: string
  ): Promise<CnHierarchyObjectToken> {
    const hierarchyObjectToken = await this.hierarchyObjectTokenService.findByIdAndCheckBasic(accessTokenId);

    await this.securityService.getAndCheckAuthorizationForUpdate(hierarchyObjectToken.hierarchyObjectId);

    return hierarchyObjectToken;
  }
}
