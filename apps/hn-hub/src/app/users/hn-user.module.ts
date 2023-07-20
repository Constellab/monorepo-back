import {Module} from '@nestjs/common';
import {HnUserService} from './hn-user.service';
import {HnUserController} from './hn-user.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {HnUser} from './hn-user.entity';
import {BlObjectStorageService} from '@monorepo/back-core-lib';
import {HnCoreModule} from '../core/hn-core.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HnUser]),
    HnCoreModule,
  ],
  exports: [
    TypeOrmModule,
    HnUserService
  ],
  controllers: [
    HnUserController
  ],
  providers: [
    HnUserService,
    BlObjectStorageService,
  ]
})
export class HnUserModule {
}
