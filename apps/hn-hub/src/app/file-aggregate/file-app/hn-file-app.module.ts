import { Module } from '@nestjs/common';
import { HnFileAppService } from './hn-file-app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HnCoreModule } from '../../core/hn-core.module';
import { HnFileApp } from './hn-file-app.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HnFileApp]), HnCoreModule],
  exports: [TypeOrmModule, HnFileAppService],
  providers: [HnFileAppService],
})
export class HnFileAppModule {}
