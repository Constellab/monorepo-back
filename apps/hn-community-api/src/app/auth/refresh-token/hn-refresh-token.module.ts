import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnCoreModule } from '../../core/hn-core.module';
import { HnRefreshTokenCron } from './hn-refresh-token.cron';
import { HnRefreshToken } from './hn-refresh-token.entity';
import { HnRefreshTokenService } from './hn-refresh-token.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnRefreshToken]), HnCoreModule],
  providers: [HnRefreshTokenService, HnRefreshTokenCron],
  exports: [TypeOrmModule, HnRefreshTokenService],
})
export class HnRefreshTokenModule {}
