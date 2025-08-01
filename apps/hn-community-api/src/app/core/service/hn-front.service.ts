import { Injectable } from '@nestjs/common';

import { HnCoreConfigService } from '../modules/core-config/hn-core-config.service';

/**
 * Core service to manager front URLs
 */
@Injectable()
export class HnFrontService {
  constructor(private configService: HnCoreConfigService) {}

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
  public getBrickVersionListUrl(brickName: string, majorStrVersion: string): string {
    return `${this.getBrickVersionUrl(brickName, majorStrVersion)}/version`;
  }

  public getBrickDocUrl(
    brickName: string,
    majorStrVersion: string,
    docId: string,
    docCompletePath: string
  ): string {
    // if complete path ends with /, remove it
    if (docCompletePath.endsWith('/')) {
      docCompletePath += docId;
    } else {
      docCompletePath += `/${docId}`;
    }
    return `${this.getBrickVersionUrl(brickName, majorStrVersion)}/doc/${docCompletePath}`;
  }

  public getBrickTechnicalDocUrl(
    brickName: string,
    majorStrVersion: string,
    docCompletePath: string
  ): string {
    // if complete path ends with /, remove it
    if (docCompletePath.endsWith('/')) {
      docCompletePath = docCompletePath.slice(0, -1);
    }
    return `${this.getBrickVersionUrl(brickName, majorStrVersion)}/doc/technical-folder/${docCompletePath}`;
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

  ///////////////////////////// AGENTS ///////////////////////////////////////////

  public getAgentInviteUrl(token: string): string {
    return `${this.getAgentsUrl()}/invite/${token}`;
  }

  public getAgentsUrl(): string {
    return `${this.getBaseWebsiteURL()}/agents`;
  }

  public getAgentUrl(agentId: string, agentTitlePath: string): string {
    return `${this.getAgentsUrl()}/${agentId}/${agentTitlePath}`;
  }

  public getAgentVersionUrl(agentId: string, agentTitlePath: string, version: number): string {
    return `${this.getAgentsUrl()}/${agentId}/${agentTitlePath}/version/${version}`;
  }

  ///////////////////////////// APPS ///////////////////////////////////////////
  public getAppsUrl(): string {
    return `${this.getBaseWebsiteURL()}/apps`;
  }

  public getAppUrl(appId: string, appTitlePath: string): string {
    return `${this.getAppsUrl()}/${appId}/${appTitlePath}`;
  }

  public getAppDetailUrl(appId: string, appTitlePath: string): string {
    return `${this.getAppUrl(appId, appTitlePath)}/detail`;
  }

  ////////////////////////////// TAGS ///////////////////////////////////////////
  public getTagsUrl(): string {
    return `${this.getBaseWebsiteURL()}/tags`;
  }

  public getTagUrl(tagTechnicalName: string): string {
    return `${this.getTagsUrl()}/${tagTechnicalName}`;
  }

  public getTagInviteUrl(token: string): string {
    return `${this.getTagsUrl()}/invite/${token}`;
  }

  ///////////////////////////// USERS ///////////////////////////////////////////
  public getUserProfileUrl(userId: string): string {
    return `${this.getBaseWebsiteURL()}/profile/${userId}`;
  }

  //////////////////////////////// CONSTELLAB URLS ///////////////////////////////////////
  public getConstellabBaseWebsiteUrl(): string {
    return this.configService.getConstellabFrontBaseUrl();
  }

  public getConstellabLoginUrl(): string {
    return `${this.getConstellabBaseWebsiteUrl()}/login`;
  }
}
