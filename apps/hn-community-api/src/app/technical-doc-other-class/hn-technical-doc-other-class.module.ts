import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnTechnicalDocOtherClassController } from './hn-technical-doc-other-class.controller';
import { HnTechnicalDocOtherClass } from './hn-technical-doc-other-class.entity';
import { HnTechnicalDocOtherClassService } from './hn-technical-doc-other-class.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnTechnicalDocOtherClass])],
  controllers: [HnTechnicalDocOtherClassController],
  exports: [TypeOrmModule, HnTechnicalDocOtherClassService],
  providers: [HnTechnicalDocOtherClassService],
})
export class HnTechnicalDocOtherClassModule {}
