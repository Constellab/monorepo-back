import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CnCommunityBrickDto } from './dto/cn-community-brick.dto';
import { CnCoreConfigService } from '../cn-core/modules/cn-core-config/cn-core-config.service';
import { lastValueFrom } from 'rxjs';
import { ClPage } from '@monorepo/core-lib';

@Injectable()
export class CnCommunityService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: CnCoreConfigService
  ) {}

  async getCommunityBrickByName(name: string, userId: string): Promise<CnCommunityBrickDto> {
    const url = this.configService.getCommunityApiUrl() + '/brick/central-name/' + name;
    const response = await lastValueFrom(
      this.httpService.post(
        url,
        { userId: userId },
        {
          headers: {
            'X-Api-Key': this.configService.getCommunityApiKey(),
          },
          responseType: 'json',
        }
      )
    );
    return response.data;
  }

  async getCommunityBricksByFilters(
    spacesFilter: string[],
    titleFilter: string,
    userId: string,
    page: number,
    size: number
  ): Promise<ClPage<CnCommunityBrickDto>> {
    const url = this.configService.getCommunityApiUrl() + '/brick/central-filters';
    const response = await lastValueFrom(
      this.httpService.post(
        url,
        { spacesFilter: spacesFilter, titleFilter: titleFilter, userId: userId },
        {
          headers: {
            'X-Api-Key': this.configService.getCommunityApiKey(),
          },
          params: {
            page: page,
            size: size,
          },
          responseType: 'json',
        }
      )
    );
    return response.data;
  }

  async getCommunityBrickVersionsList(brickId: string, userId: string): Promise<string[]> {
    const url = this.configService.getCommunityApiUrl() + '/brick/central-versions-list/' + brickId;
    const response = await lastValueFrom(
      this.httpService.post(
        url,
        { userId: userId },
        {
          headers: {
            'X-Api-Key': this.configService.getCommunityApiKey(),
          },
          responseType: 'json',
        }
      )
    );
    return response.data;
  }
}
