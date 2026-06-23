import { BlPublic } from '@monorepo/back-core-lib';
import { Controller, Get } from '@nestjs/common';

/**
 * Lightweight health check endpoint used by Docker HEALTHCHECK / CapRover
 * to know when the app is ready to receive traffic.
 *
 * Kept intentionally cheap (no DB / Redis check) so a slow dependency
 * does not flap the container health status.
 */
@Controller('health')
export class CnHealthController {
  @BlPublic()
  @Get()
  check(): { status: string } {
    return { status: 'ok' };
  }
}
