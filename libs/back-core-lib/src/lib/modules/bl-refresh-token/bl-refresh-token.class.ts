/**
 * The application's own refresh token service, as the shared purge job reaches it.
 *
 * An alias rather than the class itself: each application binds its own subclass of
 * `BlRefreshTokenService`, so there is no single class token the shared job could
 * depend on. The application provides
 * `{ provide: BL_REFRESH_TOKEN_SERVICE_PROVIDER, useExisting: XxRefreshTokenService }`
 * alongside `BlRefreshTokenCron`.
 */
export const BL_REFRESH_TOKEN_SERVICE_PROVIDER = Symbol();
