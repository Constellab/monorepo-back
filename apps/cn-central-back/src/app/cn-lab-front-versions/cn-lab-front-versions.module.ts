import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnLabFrontVersion} from './cn-lab-front-version.entity';
import {CnLabFrontVersionsService} from './cn-lab-front-versions.service';
import {CnLabFrontVersionsSecurityLayer} from './cn-lab-front-versions-security.layer';
import {CnLabFrontVersionsController} from './cn-lab-front-versions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CnLabFrontVersion,
    ])
  ],
  providers: [CnLabFrontVersionsService, CnLabFrontVersionsSecurityLayer],
  controllers: [CnLabFrontVersionsController],
  exports: [CnLabFrontVersionsService]
})
export class CnLabFrontVersionsModule {
}
