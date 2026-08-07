/**
 * What mounting the Authorization Server requires, and nothing else.
 *
 * The endpoints, the stores, the DTO and the request validation are deliberately absent:
 * "the Community retains no OAuth endpoint logic of its own" is the point of the extraction,
 * and exporting a code store would hand back the affordance to write some. Nothing outside
 * this module resolves them either — the module declares its own controller.
 */
export * from './bl-oauth-server.class';
export * from './bl-oauth-server.exception';
export * from './bl-oauth-server.module';
