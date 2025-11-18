import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnPartnerModule } from '../../partner/hn-partner.module';
import { HnLikePartner } from './hn-like-partner.entity';
import { HnLikePartnerService } from './hn-like-partner.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnLikePartner]), HnPartnerModule],
  providers: [HnLikePartnerService],
  exports: [TypeOrmModule, HnLikePartnerService],
})
export class HnLikePartnerModule {}
