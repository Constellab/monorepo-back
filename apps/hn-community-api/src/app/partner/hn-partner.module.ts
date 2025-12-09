import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnCoreModule } from '../core/hn-core.module';
import { HnFilePartnerModule } from '../file-aggregate/file-partner/hn-file-partner.module';
import { HnUserModule } from '../users/hn-user.module';
import { HnPartnerController } from './hn-partner.controller';
import { HnPartner } from './hn-partner.entity';
import { HnPartnerListener } from './hn-partner.listener';
import { HnPartnerService } from './hn-partner.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnPartner]), HnUserModule, HnFilePartnerModule, HnCoreModule],
  exports: [TypeOrmModule, HnPartnerService],
  controllers: [HnPartnerController],
  providers: [HnPartnerService, HnPartnerListener],
})
export class HnPartnerModule {}
