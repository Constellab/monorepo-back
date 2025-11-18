import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnPartnerModule } from '../../partner/hn-partner.module';
import { HnCommentPartner } from './hn-comment-partner.entity';
import { HnCommentPartnerService } from './hn-comment-partner.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnCommentPartner]), HnPartnerModule],
  providers: [HnCommentPartnerService],
  exports: [TypeOrmModule, HnCommentPartnerService],
})
export class HnCommentPartnerModule {}
