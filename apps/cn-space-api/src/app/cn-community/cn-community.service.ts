import { Injectable } from '@nestjs/common';
import { CnCommunityBrickDto, CnCommunityBrickVersionDTO } from './dto/cn-community-brick.dto';
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

  public async getBrickLatestVersion(brickName: string): Promise<CnCommunityBrickVersionDTO> {
    // TODO TO IMPROVE WHEN ROUTE TO GET LATEST VERSION WILL BE IMPLEMENTED
    const brick = await this.getBrickByName(brickName);
    const brickVersions = await this.getBrickVersionsList(brick.id);
    const latestVersion = brickVersions[0];
    return this.getBrickVersion(brickName, latestVersion);
  }

  public async getBrickVersion(brickName: string, brickVersion: string): Promise<CnCommunityBrickVersionDTO> {
    const url = `${this.configService.getCommunityApiUrl()}/brick/space/name/${brickName}/${brickVersion}`;
    const brickVersionDTO: CnCommunityBrickVersionDTO = await lastValueFrom(
      this.externalApiService.get(url, CnCommunityBrickVersionDTO, {
        headers: this.getHeaders(),
      })
    );

    // delete repositoryAccessUrl to avoid security issue
    delete brickVersionDTO.repositoryAccessUrl;
    return brickVersionDTO;
  }

  async getBrickByName(name: string): Promise<CnCommunityBrickDto> {
    const url = this.configService.getCommunityApiUrl() + '/brick/space-name/' + name;
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

  async getBricksByFilters(
    spacesFilter: string[],
    titleFilter: string,
    page: number,
    size: number
  ): Promise<ClPage<CnCommunityBrickDto>> {
    const url = this.configService.getCommunityApiUrl() + '/brick/space-filters';
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

  async getBrickVersionsList(brickId: string): Promise<string[]> {
    const url = this.configService.getCommunityApiUrl() + '/brick/space-versions-list/' + brickId;
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
