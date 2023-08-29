import {Injectable} from '@nestjs/common';
import {HnCoreConfigService} from '../modules/core-config/hn-core-config.service';

/**
 * Core service to manager front URLs
 */
@Injectable()
export class HnFrontService {

  constructor(private configService: HnCoreConfigService) {
  }

  /**
   * Get the base url of the website (without the url of the space)
   */
  public getBaseWebsiteURL(): string {
    return this.configService.getFrontBaseUrl();
  }

  ///////////////////////////// STORIES ///////////////////////////////////////////

  public getStoryInviteUrl(token: string): string {
    return `${this.getStoriesUrl()}/invite/${token}`;
  }

  public getStoriesUrl(): string {
    return `${this.getBaseWebsiteURL()}/stories`;
  }

  public getStoryUrl(storyId: string, storyTitlePath: string): string {
    return `${this.getStoriesUrl()}/${storyId}/${storyTitlePath}`;
  }

  /////////////////////////////// BRICKS/ //////////////////////////////////////////
  public getBrickDocUrl(brickName: string, majorStrVersion: string, docCompletePath: string): string {
    // if complete path ends with /, remove it
    if (docCompletePath.endsWith('/')) {
      docCompletePath = docCompletePath.slice(0, -1);
    }
    return `${this.getBrickVersionUrl(brickName,majorStrVersion)}/doc/${docCompletePath}`;
  }

  public getBrickTechnicalDocUrl(brickName: string, majorStrVersion: string, docCompletePath: string): string {
    // if complete path ends with /, remove it
    if (docCompletePath.endsWith('/')) {
      docCompletePath = docCompletePath.slice(0, -1);
    }
    return `${this.getBrickVersionUrl(brickName,majorStrVersion)}/doc/technical-folder/${docCompletePath}`;
  }

  public getBrickInviteUrl(token: string): string {
    return `${this.getBricksUrl()}/invite/${token}`;
  }

  public getBricksUrl(): string {
    return `${this.getBaseWebsiteURL()}/bricks`;
  }

  public getBrickVersionUrl(brickName: string, majorStrVersion: string): string {
    return `${this.getBricksUrl()}/${brickName}/${majorStrVersion}`;
  }

  //////////////////////////////// CONSTELLAB URLS ///////////////////////////////////////
  public getConstellabBaseWebsiteUrl(): string {
    return this.configService.getConstellabFrontBaseUrl();
  }

  public getConstellabLoginUrl(): string {
    return `${this.getConstellabBaseWebsiteUrl()}/login`;
  }

}
