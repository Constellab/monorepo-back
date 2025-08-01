import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnCoreModule } from '../../core/hn-core.module';
import { HnFileApp } from './hn-file-app.entity';
import { HnFileAppService } from './hn-file-app.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnFileApp]), HnCoreModule],
  exports: [TypeOrmModule, HnFileAppService],
  providers: [HnFileAppService],
})
export class HnFileAppModule {}
