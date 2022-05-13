import {Module} from '@nestjs/common';
import {HnProtocolService} from './hn-protocol.service';
import {HnProtocolController} from './hn-protocol.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {HnProtocol} from './hn-protocol.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HnProtocol])],
  controllers: [HnProtocolController],
  exports: [TypeOrmModule],
  providers: [HnProtocolService],
})
export class HnProtocolModule {
}
