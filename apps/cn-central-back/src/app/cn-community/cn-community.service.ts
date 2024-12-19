import { Injectable } from '@nestjs/common';
import { CnCommunityBrickDto } from './dto/cn-community-brick.dto';
import { CnCoreConfigService } from '../cn-core/modules/cn-core-config/cn-core-config.service';
import { lastValueFrom } from 'rxjs';
import { ClPage } from '@monorepo/core-lib';
import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';
import { BlExternalApiService } from '@monorepo/back-core-lib';

@Injectable()
export class CnCommunityService {
  constructor(
    private readonly externalApiService: BlExternalApiService,
    private readonly configService: CnCoreConfigService
  ) {}

  async getCommunityBrickByName(name: string): Promise<CnCommunityBrickDto> {
    const url = this.configService.getCommunityApiUrl() + '/brick/central-name/' + name;
    return await lastValueFrom(
      this.externalApiService.post(
        url,
        { userId: CnCurrentUserHelper.getAndCheckCurrentUser().id },
        CnCommunityBrickDto,
        {
          headers: this.getHeaders(),
        }
      )
    );
  }

  async getCommunityBricksByFilters(
    spacesFilter: string[],
    titleFilter: string,
    page: number,
    size: number
  ): Promise<ClPage<CnCommunityBrickDto>> {
    const url = this.configService.getCommunityApiUrl() + '/brick/central-filters';
    return await lastValueFrom(
      this.externalApiService.post(
        url,
        {
          spacesFilter: spacesFilter,
          titleFilter: titleFilter,
          userId: CnCurrentUserHelper.getAndCheckCurrentUser().id,
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

  async getCommunityBrickVersionsList(brickId: string): Promise<string[]> {
    const url = this.configService.getCommunityApiUrl() + '/brick/central-versions-list/' + brickId;
    return await lastValueFrom(
      this.externalApiService.post(url, { userId: CnCurrentUserHelper.getAndCheckCurrentUser().id }, null, {
        headers: this.getHeaders(),
      })
    );
  }

  private getHeaders(): Record<string, string> {
    return {
      'X-Api-Key': this.configService.getCommunityApiKey(),
    };
  }
}
