import { IsIn, IsNotEmpty, IsString } from 'class-validator';

/**
 * What the user answered. Sent by the consent page as-is, so these two words are part of
 * the contract with the front-end.
 */
export type BlOAuthConsentDecision = 'allow' | 'deny';

/**
 * The pending authorization a consent call is about.
 *
 * `consent_id` and not `state`: the client owns a parameter called `state` in the very same
 * flow, and confusing the two is how one ends up echoed in place of the other.
 */
export class BlOAuthConsentIdQueryDto {
  @IsString()
  @IsNotEmpty()
  consent_id!: string;
}

/** Query parameters of the decision endpoint, which the browser navigates to. */
export class BlOAuthConsentDecisionQueryDto extends BlOAuthConsentIdQueryDto {
  /**
   * Refused at the type level rather than defaulted, in both directions: an unreadable
   * decision must not silently approve, and must not silently refuse either — the user
   * pressed one of two buttons and is entitled to have that answer acted on or rejected.
   */
  @IsIn(['allow', 'deny'])
  decision!: BlOAuthConsentDecision;

  /** The single-use token minted by `POST /oauth/authorize/consent/token`. */
  @IsString()
  @IsNotEmpty()
  consent_token!: string;
}

/** Body of the token-minting call, the one consent call that is an XHR rather than a navigation. */
export interface BlOAuthConsentTokenBody {
  consent_id?: unknown;
}

/** Answer to the token-minting call. Single use, short lived, and never carried in a URL twice. */
export interface BlOAuthConsentTokenResponse {
  consent_token: string;
}

/** One Resource, as the consent page renders it. */
export interface BlOAuthConsentResourceResponse {
  name: string;
  url: string;
  description?: string;
}

/**
 * What the consent page shows.
 *
 * Snake-cased like the rest of the OAuth surface, and every field is rendered as given:
 * nothing about the client or its access is hardcoded in the front, so a Resource added
 * here reaches users without a front-end deployment.
 */
export interface BlOAuthConsentDetailsResponse {
  /**
   * The name the client registered itself under.
   *
   * UNTRUSTED. Registration is dynamic, so anyone may register a client calling itself
   * "Constellab Official". It is sent because a user cannot decide about a client they
   * cannot name, and it is sent alongside {@link client_name_is_verified} so the page can
   * frame it as a claim rather than an identity.
   */
  client_name: string;

  /** The only client identifier that cannot be forged. */
  client_id: string;

  /**
   * Whether {@link client_name} was verified by anyone. Always false today — there is no
   * client vetting — and stated explicitly rather than omitted, so the page has no reason
   * to assume the answer.
   */
  client_name_is_verified: boolean;

  /** The signed-in user the client would act as. */
  user_email: string;

  /** Every Resource asked for in this pass, approved together. Never empty. */
  resources: BlOAuthConsentResourceResponse[];

  /** The one thing the user most needs to know about what they are about to hand over. */
  warning?: string;
}
