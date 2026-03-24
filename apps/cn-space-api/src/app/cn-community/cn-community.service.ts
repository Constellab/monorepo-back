import { BlExternalApiService } from '@monorepo/back-core-lib';
import { ClPage } from '@monorepo/core-lib';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

import { CnCoreConfigService } from '../cn-core/modules/cn-core-config/cn-core-config.service';
import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';
import { CnLabsService } from '../cn-labs/cn-labs.service';
import { CnCommunityBrickDto, CnCommunityBrickVersionDTO } from './dto/cn-community-brick.dto';

@Injectable()
export class CnCommunityService {
  constructor(
    private readonly externalApiService: BlExternalApiService,
    private readonly configService: CnCoreConfigService,
    private readonly labsService: CnLabsService
  ) {}

  public async getBrickLatestVersion(labId: string, brickName: string): Promise<CnCommunityBrickVersionDTO> {
    return this.getBrickVersion(labId, brickName, 'latest');
  }

  public async getBrickVersion(
    labId: string,
    brickName: string,
    brickVersion: string
  ): Promise<CnCommunityBrickVersionDTO> {
    const baseUrl = this.configService.getCommunityApiUrl();
    const url = `${baseUrl}/brick/for-space/version-info/${brickName}/${brickVersion}`;
    return await lastValueFrom(
      this.externalApiService.get(url, CnCommunityBrickVersionDTO, {
        headers: await this.getHeaders(labId),
      })
    );
  }

  async getBrickByName(labId: string, name: string): Promise<CnCommunityBrickDto> {
    const url = `${this.configService.getCommunityApiUrl()}/brick/for-space/name/${name}`;
    return await lastValueFrom(
      this.externalApiService.get(url, CnCommunityBrickDto, {
        headers: await this.getHeaders(labId),
      })
    );
  }

  async getBricksByFilters(
    labId: string,
    spacesFilter: string[],
    titleFilter: string,
    page: number,
    size: number
  ): Promise<ClPage<CnCommunityBrickDto>> {
    const url = `${this.configService.getCommunityApiUrl()}/brick/for-space/filters`;
    return await lastValueFrom(
      this.externalApiService.post(
        url,
        {
          spacesFilter: spacesFilter,
          titleFilter: titleFilter,
        },
        CnCommunityBrickDto,
        {
          headers: await this.getHeaders(labId),
          params: {
            page: page,
            size: size,
          },
        }
      )
    );
  }

  async getBrickVersionsList(labId: string, brickId: string): Promise<string[]> {
    const url = `${this.configService.getCommunityApiUrl()}/brick/for-space/versions-list/${brickId}`;
    return await lastValueFrom(
      this.externalApiService.get(url, null, {
        headers: await this.getHeaders(labId),
      })
    );
  }

  private async getHeaders(labId: string): Promise<Record<string, string>> {
    const lab = await this.labsService.findByIdAndCheckWithSpace(labId);
    return {
      Authorization: `api-key ${lab.glabProdApiKey}`,
      user: CnCurrentUserHelper.getAndCheckCurrentUser().id,
    };
  }
}
