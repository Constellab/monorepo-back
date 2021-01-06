interface Cookie {
  key: string;
  value: string;
}

export class CookieHelper {

  /**
   * Get the cookie value from a cookie header like
   * Auth_Expiration=86400000; Authorization=Bearer%20eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
   */
  public static getCookieFromHeader(header: string, cookieName: string): string | undefined {
    if (!header) {
      return null;
    }
    // separate cookies
    const cookies = header.split('; ');

    if (cookies?.length) {
      for (const stringCookie of cookies) {
        const cookie = CookieHelper.parseCookieFromString(stringCookie);

        // if we found the correct cookie
        if (cookie?.key === cookieName) {
          return cookie.value;
        }
      }
    }
  }

  /**
   * return a cookie object form a string like Auth_Expiration=86400000
   */
  public static parseCookieFromString(cookieString: string): Cookie | undefined {
    // separate key and value from cookie
    const cookies: string[] = cookieString.split('=');

    if (cookies?.length >= 2) {
      return {
        key: cookies[0],
        value: cookies.slice(1).join('=')
      };
    }
  }
}
