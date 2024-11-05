import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HnAgentVersionBrickDependencies } from './hn-agent-version-brick-dependencies.entity';
import { HnAgentVersionBrickDependenciesService } from './hn-agent-version-brick-dependencies.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnAgentVersionBrickDependencies])],
  exports: [TypeOrmModule, HnAgentVersionBrickDependenciesService],
  providers: [HnAgentVersionBrickDependenciesService],
})
export class HnAgentVersionBrickDependenciesModule {}
