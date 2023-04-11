import {Module} from '@nestjs/common';
import {HnBrickVersionService} from './hn-brick-version.service';
import {HnBrickVersionController} from './hn-brick-version.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {HnBrickVersion} from './hn-brick-version.entity';
import {HnBrickVersionReferenceModule} from '../brick-version-reference/hn-brick-version-reference.module';
import {HnBrickVersionReferenceService} from '../brick-version-reference/hn-brick-version-reference.service';
import {HnUserService} from '../users/hn-user.service';
import {HnUserModule} from '../users/hn-user.module';
import {HnCoreConfigService} from '../core/modules/core-config/hn-core-config.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnBrickVersion]), HnBrickVersionReferenceModule, HnUserModule],
  exports: [TypeOrmModule],
  controllers: [HnBrickVersionController],
  providers: [HnBrickVersionService, HnBrickVersionReferenceService, HnUserService, HnCoreConfigService]
})
export class HnBrickVersionModule {
}
