import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnBrickVersionReferenceController } from './hn-brick-version-reference.controller';
import { HnBrickVersionReference } from './hn-brick-version-reference.entity';
import { HnBrickVersionReferenceService } from './hn-brick-version-reference.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnBrickVersionReference])],
  exports: [TypeOrmModule],
  controllers: [HnBrickVersionReferenceController],
  providers: [HnBrickVersionReferenceService],
})
export class HnBrickVersionReferenceModule {}
