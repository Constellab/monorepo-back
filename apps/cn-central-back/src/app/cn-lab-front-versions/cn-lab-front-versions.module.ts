import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnLabFrontVersion} from './cn-lab-front-version.entity';
import {CnLabFrontVersionsService} from './cn-lab-front-versions.service';
import {CnLabFrontVersionsSecurityLayer} from './cn-lab-front-versions-security.layer';
import {CnLabFrontVersionsController} from './cn-lab-front-versions.controller';
import {CnBricksModule} from '../cn-bricks/cn-bricks.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CnLabFrontVersion,
    ]),

    CnBricksModule,
  ],
  providers: [CnLabFrontVersionsService, CnLabFrontVersionsSecurityLayer],
  controllers: [CnLabFrontVersionsController],
  exports: [CnLabFrontVersionsService]
})
export class CnLabFrontVersionsModule {
}
