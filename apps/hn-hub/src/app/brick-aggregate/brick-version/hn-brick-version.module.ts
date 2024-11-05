import { Module } from '@nestjs/common';
import { HnBrickVersionService } from './hn-brick-version.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HnBrickVersion } from './hn-brick-version.entity';
import { HnBrickVersionReferenceModule } from '../../brick-version-reference/hn-brick-version-reference.module';
import { HnBrickVersionReferenceService } from '../../brick-version-reference/hn-brick-version-reference.service';
import { HnUserService } from '../../users/hn-user.service';
import { HnUserModule } from '../../users/hn-user.module';
import { HnCoreModule } from '../../core/hn-core.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HnBrickVersion]),

    HnCoreModule,
    HnBrickVersionReferenceModule,
    HnUserModule,
  ],
  exports: [TypeOrmModule, HnBrickVersionService],
  providers: [HnBrickVersionService, HnBrickVersionReferenceService, HnUserService],
})
export class HnBrickVersionModule {}
