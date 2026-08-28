import { Controller, Get } from '@nestjs/common';

import { BlPublic } from '../../decorators/bl-public.decorator';
import { BL_OAUTH_PATHS } from '../bl-oauth/bl-oauth.constants';
import { BlJwtAsymmetricService } from './bl-jwt-asymmetric.service';
import { BlJwks } from './bl-jwt-key.class';

/**
 * Publishes the public half of the signing keys (RFC 7517), at the `jwks_uri` the
 * Authorization Server metadata document advertises.
 *
 * Public and unauthenticated, because that is what it is for: a Resource Server in
 * another application must be able to fetch it before it holds any credential, and there
 * is nothing secret in it — a public key is not a capability.
 *
 * At the host root, no application prefix, for the same reason the two discovery
 * documents are: a client resolves it from the issuer.
 */
@Controller()
export class BlJwksController {
  constructor(private readonly jwtService: BlJwtAsymmetricService) {}

  @BlPublic()
  @Get(BL_OAUTH_PATHS.jwks)
  getJwks(): BlJwks {
    return this.jwtService.getJwks();
  }
}
