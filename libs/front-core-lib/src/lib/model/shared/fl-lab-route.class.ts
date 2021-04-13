class FlLabRouteAutoLogin {
  public route = 'auto-login';

  public tokenQueryParam = 'token';

  public getRoute(token: string): string {
    return `${this.route}?${this.tokenQueryParam}=${token}`;
  }
}

/**
 * Class to store lab route used by different app
 */
export class FlLabRoute {

  public static autoLogin: FlLabRouteAutoLogin = new FlLabRouteAutoLogin();

}
