import { Module } from '@nestjs/common';
import { HnTechnicalDocOtherClassService } from './hn-technical-doc-other-class.service';
import { HnTechnicalDocOtherClassController } from './hn-technical-doc-other-class.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HnTechnicalDocOtherClass } from './hn-technical-doc-other-class.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HnTechnicalDocOtherClass])],
  controllers: [HnTechnicalDocOtherClassController],
  exports: [TypeOrmModule, HnTechnicalDocOtherClassService],
  providers: [HnTechnicalDocOtherClassService],
})
export class HnTechnicalDocOtherClassModule {}
