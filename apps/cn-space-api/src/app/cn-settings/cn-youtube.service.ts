import { BlBadRequestException, BlExternalApiService } from '@monorepo/back-core-lib';
import { Injectable, Logger } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

import { CnCoreConfigService } from '../cn-core/modules/cn-core-config/cn-core-config.service';
import { CnYoutubeVideo } from './cn-settings.dto';

@Injectable()
export class CnYoutubeService {
  private readonly API_URL = 'https://www.googleapis.com/youtube/v3';
  private readonly PLAYLIST_ROUTE = 'playlistItems';

  private readonly logger = new Logger(CnYoutubeService.name);

  constructor(
    private coreConfigService: CnCoreConfigService,
    private externalApiService: BlExternalApiService
  ) {}

  public async getTutorialPlaylistVideos(): Promise<CnYoutubeVideo[]> {
    const videos: CnYoutubeVideo[] = [];

    const playlistId = this.coreConfigService.getYoutubeTutorialPlaylistId();
    const apiUrl =
      `${this.API_URL}/${this.PLAYLIST_ROUTE}?part=snippet&` +
      `playlistId=${playlistId}&` +
      `maxResults=50&key=${this.coreConfigService.getYoutubeApiKey()}`;

    const result = await lastValueFrom(this.externalApiService.get(apiUrl)).catch((error) => {
      this.logger.error('Error while getting youtube playlist items:', error);
      throw new BlBadRequestException('Error while getting tutorial videos');
    });

    for (const item of result.items) {
      const embedUrl = `https://www.youtube.com/embed/${item.snippet.resourceId.videoId}?list=${playlistId}`;
      const youtubeUrl =
        `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}&` + `list=${playlistId}`;
      videos.push({
        title: item.snippet.title,
        videoId: item.snippet.resourceId.videoId,
        embedLink: embedUrl,
        youtubeLink: youtubeUrl,
        thumbnailUrl: item.snippet.thumbnails.medium.url,
        thumbnailWidth: item.snippet.thumbnails.medium.width,
        thumbnailHeight: item.snippet.thumbnails.medium.height,
      });
    }

    return videos;
  }
}
