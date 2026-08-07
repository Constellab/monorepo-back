import { Controller, Get, NotFoundException, Req } from '@nestjs/common';
import { Request } from 'express';

import { BlPublic } from '../../decorators/bl-public.decorator';
import { BL_OAUTH_PATHS } from '../bl-oauth/bl-oauth.constants';
import {
  blBuildProtectedResourceMetadata,
  BlProtectedResourceMetadata,
} from '../bl-oauth/bl-oauth-metadata.builder';
import { blResourcePathFromMetadataUrl } from '../bl-oauth/bl-oauth-resource-url.util';
import { BlResourceRegistry } from './bl-resource.registry';

/**
 * The Protected Resource Metadata documents (RFC 9728) of every Resource this
 * application serves.
 *
 * Public (bypasses the mounting application's global guards) and at the host root with no
 * application prefix: a client resolves these from the URL it was refused at, before it
 * holds any credential.
 */
@Controller()
export class BlProtectedResourceMetadataController {
  constructor(private readonly registry: BlResourceRegistry) {}

  /**
   * The pathless document, which answers for two different reasons.
   *
   * It is where RFC 9728 puts the document of the Resource that is the application
   * itself — the empty path, which an application registering its whole API uses — so
   * when that Resource is registered this is its own document and names nothing else.
   *
   * Otherwise it stays a compatibility answer for the primary Resource: RFC 9728 only
   * defines the per-resource form below, but a client that predates the split asks for
   * this one, and a discovery document that 404s makes such a client give up on the
   * whole flow.
   */
  @BlPublic()
  @Get(BL_OAUTH_PATHS.protectedResourceMetadata)
  getProtectedResourceMetadata(): BlProtectedResourceMetadata {
    const applicationItself = this.registry.resourceUrl('');
    const resource = this.registry.isKnownResource(applicationItself)
      ? applicationItself
      : this.registry.primaryResource;

    if (resource == null) {
      throw new NotFoundException('unknown protected resource');
    }
    return blBuildProtectedResourceMetadata(resource, this.registry.authorizationServerUrl);
  }

  /**
   * The document for one Resource (RFC 9728 §3.1), e.g.
   * `/.well-known/oauth-protected-resource/mcp/community-doc`.
   *
   * One document per Resource is what makes several protected surfaces on this host
   * distinguishable to a client: each `WWW-Authenticate` points at its own document, and
   * each document names exactly one `resource`. Serving the same document for every path
   * would tell a client calling one surface to request an audience for another.
   *
   * The Resource comes from the request path, matched against the registry — an unknown
   * path is a 404 rather than a document for a Resource we do not serve.
   */
  @BlPublic()
  @Get(`${BL_OAUTH_PATHS.protectedResourceMetadata}/*splat`)
  getProtectedResourceMetadataForPath(@Req() request: Request): BlProtectedResourceMetadata {
    const resourcePath = blResourcePathFromMetadataUrl(request.path);
    const resource = this.registry.resourceUrl(resourcePath ?? '');

    if (!resourcePath || !this.registry.isKnownResource(resource)) {
      throw new NotFoundException('unknown protected resource');
    }
    return blBuildProtectedResourceMetadata(resource, this.registry.authorizationServerUrl);
  }
}
