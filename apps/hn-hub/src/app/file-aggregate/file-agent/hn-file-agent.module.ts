import { Module } from '@nestjs/common';
import { HnFileAgentService } from './hn-file-agent.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HnCoreModule } from '../../core/hn-core.module';
import { HnFileAgent } from './hn-file-agent.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HnFileAgent]), HnCoreModule],
  exports: [TypeOrmModule, HnFileAgentService],
  providers: [HnFileAgentService],
})
export class HnFileAgentModule {}
