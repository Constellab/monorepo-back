import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Lab} from './lab.entity';
import {LabsService} from './labs.service';
import {LabsController} from './labs.controller';
import {LabsSecurityLayer} from './labs-security-layer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lab])
  ],
  providers: [LabsService, LabsSecurityLayer],
  controllers: [LabsController]
})
export class LabsModule {
}
