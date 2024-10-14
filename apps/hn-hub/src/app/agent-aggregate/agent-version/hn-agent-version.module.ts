import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {HnAgentVersion} from './hn-agent-version.entity';
import {HnAgentVersionService} from './hn-agent-version.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([HnAgentVersion])
  ],
  exports: [TypeOrmModule, HnAgentVersionService],
  providers: [HnAgentVersionService]
})
export class HnAgentVersionModule {

}
