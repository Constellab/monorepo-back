import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * Query parameters of `GET /oauth/authorize`.
 *
 * Validated by a `ValidationPipe` so the declared types are a runtime guarantee,
 * not just a compile-time claim: the app runs the `extended` (qs) query parser, so
 * `?client_id[]=a` would otherwise arrive as an array.
 *
 * `client_id` / `redirect_uri` are required here because a request missing them can
 * only be answered with a direct 400 (redirecting would be an open redirect). Every
 * other parameter is optional at the type level so the *semantic* checks stay in
 * {@link hnValidateAuthorizeParams}, which can report them by redirecting back to
 * the client with `error` + `state`.
 */
export class HnAuthorizeQueryDto {
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

  @IsString()
  @IsOptional()
  resource?: string;

  @IsString()
  @IsOptional()
  state?: string;
}
