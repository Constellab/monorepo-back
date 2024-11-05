import { Module } from '@nestjs/common';
import { HnBrickVersionReferenceService } from './hn-brick-version-reference.service';
import { HnBrickVersionReferenceController } from './hn-brick-version-reference.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HnBrickVersionReference } from './hn-brick-version-reference.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HnBrickVersionReference])],
  exports: [TypeOrmModule],
  controllers: [HnBrickVersionReferenceController],
  providers: [HnBrickVersionReferenceService],
})
export class HnBrickVersionReferenceModule {}
