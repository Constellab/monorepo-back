import {Module} from '@nestjs/common';
import {ProtocolsController} from './protocols.controller';
import {ProtocolsService} from './protocols.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Protocol} from './protocol.entity';
import {CoreModule} from '../core/core.module';
import {ProtocolsSecurityLayer} from './protocols-security-layer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Protocol]),

    CoreModule,
  ],
  controllers: [ProtocolsController],
  providers: [ProtocolsService, ProtocolsSecurityLayer],
  exports: [ProtocolsSecurityLayer, ProtocolsService]
})
export class ProtocolsModule {
}
