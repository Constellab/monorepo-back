import { blTransportCommunityBrickQueue } from '@monorepo/back-core-lib';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnBrickVersionReferenceModule } from '../../brick-version-reference/hn-brick-version-reference.module';
import { HnBrickVersionReferenceService } from '../../brick-version-reference/hn-brick-version-reference.service';
import { HnCoreModule } from '../../core/hn-core.module';
import { HnUserModule } from '../../users/hn-user.module';
import { HnUserService } from '../../users/hn-user.service';
import { HnBrickVersion } from './hn-brick-version.entity';
import { HnBrickVersionService } from './hn-brick-version.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([HnBrickVersion]),

    HnCoreModule,
    HnBrickVersionReferenceModule,
    HnUserModule,
    BullModule.registerQueue({
      name: blTransportCommunityBrickQueue,
    }),
  ],
  exports: [TypeOrmModule, HnBrickVersionService],
  providers: [HnBrickVersionService, HnBrickVersionReferenceService, HnUserService],
})
export class HnBrickVersionModule {}
