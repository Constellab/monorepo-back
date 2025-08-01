import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnProtocolController } from './hn-protocol.controller';
import { HnProtocol } from './hn-protocol.entity';
import { HnProtocolService } from './hn-protocol.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnProtocol])],
  controllers: [HnProtocolController],
  exports: [TypeOrmModule],
  providers: [HnProtocolService],
})
export class HnProtocolModule {}
