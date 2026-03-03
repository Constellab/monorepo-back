import { Module } from '@nestjs/common';

import { HnCoreModule } from '../core/hn-core.module';
import { HnCliAuthController } from './hn-cli-auth.controller';
import { HnCliAuthService } from './hn-cli-auth.service';

@Module({
  imports: [HnCoreModule],
  controllers: [HnCliAuthController],
  providers: [HnCliAuthService],
  exports: [HnCliAuthService],
})
export class HnCliAuthModule {}
