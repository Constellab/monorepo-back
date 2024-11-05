import { Module } from '@nestjs/common';
import { BlRequestContextMiddleware } from './bl-request-context-middleware.service';

@Module({
  providers: [BlRequestContextMiddleware],
  exports: [BlRequestContextMiddleware],
})
export class BlRequestContextModule {}
