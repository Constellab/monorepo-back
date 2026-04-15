import { BlExternalApiService } from '@monorepo/back-core-lib';
import { ClPage } from '@monorepo/core-lib';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

import { CnCoreConfigService } from '../cn-core/modules/cn-core-config/cn-core-config.service';
import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';
import { CnCommunityBrickDto, CnCommunityBrickVersionDTO } from './dto/cn-community-brick.dto';

@Injectable()
export class CnCommunityService {
  constructor(
    private readonly externalApiService: BlExternalApiService,
    private readonly configService: CnCoreConfigService
  ) {}

  public async getBrickLatestVersion(brickName: string): Promise<CnCommunityBrickVersionDTO> {
    return this.getBrickVersion(brickName, 'latest');
  }

  public async getBrickVersion(brickName: string, brickVersion: string): Promise<CnCommunityBrickVersionDTO> {
    const url =
      `${this.configService.getCommunityApiUrl()}/space/brick/version-info` + `/${brickName}/${brickVersion}`;
    return await lastValueFrom(
      this.externalApiService.get(url, CnCommunityBrickVersionDTO, {
        headers: this.getHeaders(),
      })
    );
  }

  async getBrickByName(name: string): Promise<CnCommunityBrickDto> {
    const url = `${this.configService.getCommunityApiUrl()}/space/brick/name/${name}`;
    return await lastValueFrom(
      this.externalApiService.get(url, CnCommunityBrickDto, {
        headers: this.getHeaders(),
      })
    );
  }

  async getBricksByFilters(
    spacesFilter: string[],
    titleFilter: string,
    page: number,
    size: number
  ): Promise<ClPage<CnCommunityBrickDto>> {
    const url = `${this.configService.getCommunityApiUrl()}/space/brick/filters`;
    return await lastValueFrom(
      this.externalApiService.post(
        url,
        {
          spacesFilter: spacesFilter,
          titleFilter: titleFilter,
        },
        CnCommunityBrickDto,
        {
          headers: this.getHeaders(),
          params: {
            page: page,
            size: size,
          },
        }
      )
    );
  }

  private getHeaders(): Record<string, string> {
    return {
      'X-Api-Key': this.configService.getCommunityApiKey(),
      user: CnCurrentUserHelper.getAndCheckCurrentUser().id,
    };
  }
}
