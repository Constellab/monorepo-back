import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnLab} from './cn-lab.entity';
import {CnLabsService} from './cn-labs.service';
import {CnLabsController} from './cn-labs.controller';
import {CnLabsSecurityLayer} from './cn-labs-security.layer';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnLab])
  ],
  providers: [CnLabsService, CnLabsSecurityLayer],
  controllers: [CnLabsController]
})
export class CnLabsModule {
}
