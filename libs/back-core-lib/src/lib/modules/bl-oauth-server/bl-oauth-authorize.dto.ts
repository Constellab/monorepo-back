import { Transform } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * Query parameters of `GET /oauth/authorize`.
 *
 * Validated by a `ValidationPipe` so the declared types are a runtime guarantee,
 * not just a compile-time claim: both applications run the `extended` (qs) query parser,
 * so `?client_id[]=a` would otherwise arrive as an array.
 *
 * `client_id` / `redirect_uri` are required here because a request missing them can
 * only be answered with a direct 400 (redirecting would be an open redirect). Every
 * other parameter is optional at the type level so the *semantic* checks stay in
 * {@link blValidateAuthorizeParams}, which can report them by redirecting back to
 * the client with `error` + `state`.
 */
export class BlOAuthAuthorizeQueryDto {
  @IsString()
  @IsNotEmpty()
  client_id!: string;

  @IsString()
  @IsNotEmpty()
  redirect_uri!: string;

  @IsString()
  @IsOptional()
  response_type?: string;

  @IsString()
  @IsOptional()
  code_challenge?: string;

  @IsString()
  @IsOptional()
  code_challenge_method?: string;

  /**
   * The Resources a token is being asked for (RFC 8707 §2). Repeatable: `?resource=a&resource=b`
   * is one pass through consent asking for both, which is what spares the user a second
   * prompt for a single connection.
   *
   * Normalized to an array here so nothing downstream has to handle both shapes — a
   * `resource` that is sometimes a string and sometimes an array is how a check ends up
   * running on the first entry only.
   */
  @IsOptional()
  @Transform(({ value }) => {
    if (value == null) {
      return undefined;
    }
    return Array.isArray(value) ? value : [value];
  })
  @IsArray()
  @IsString({ each: true })
  resource?: string[];

  @IsString()
  @IsOptional()
  state?: string;
}
