import {Injectable} from '@angular/core';
import {environment} from '../../../environments/ha-environment';

@Injectable({
  providedIn: 'root'
})
export class HaRouterService {

  constructor() {
  }

  public static getAppUrl(): string {
    return environment.hubUrl;
  }

  public static getHomeRoute(): string {
    return '/';
  }

  public static getStoryListRoute(): string {
    return '/stories/';
  }

  public static getBrickListRoute(): string {
    return '/bricks/';
  }

  public static getLoginRoute(): string {
    return '/login';
  }

  public static getBrickPageRoute(brickName: string, brickMajor?: string): string {
    const brickMajorUrl = brickMajor == null || brickMajor === 'latest' ? 'latest' : `v${brickMajor}`;
    return `${this.getBrickListRoute()}${brickName}/${brickMajorUrl}/`;
  }

  public static getBrickDocsPageRoute(brickName: string, brickMajor: string): string {
    return `${this.getBrickPageRoute(brickName, brickMajor)}doc/`;
  }

  public static getDocumentationRoute(brickName: string, brickMajor: string, completePath: string): string {
    return `${this.getBrickDocsPageRoute(brickName, brickMajor)}${completePath}`;
  }

  public static getTechDocRoute(parentBrickName: string, parentVersion: string, objectType: string, docParentUniqueName: string): string {
    return `${this.getBrickDocsPageRoute(parentBrickName, parentVersion)}technical-folder/${objectType}/${docParentUniqueName}`;
  }

  public static getBrickListVersionPageRoute(brickName: string, brickMajor: string): string {
    return `${this.getBrickPageRoute(brickName, brickMajor)}version/`;
  }


  // --------------------------------------------------------------------------------------------

  //Check if the url is valid for the hub
  public static isAValidDocUrl(link: string): [boolean, boolean] {
    if (link.startsWith(this.getAppUrl())) {
      link = link.slice(this.getAppUrl().length);
      const url: string[] = link.split('/');
      return [url.length >= 5 && url[0] === 'bricks' && url[3] == 'doc' && url[4].length > 0, url[4] != 'technical-folder'];
    }
    return [false, null];
  }

}
