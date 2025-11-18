import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnCoreModule } from '../../core/hn-core.module';
import { HnFilePartner } from './hn-file-partner.entity';
import { HnFilePartnerService } from './hn-file-partner.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnFilePartner]), HnCoreModule],
  exports: [TypeOrmModule, HnFilePartnerService],
  providers: [HnFilePartnerService],
})
export class HnFilePartnerModule {}
