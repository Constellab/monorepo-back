import {Module} from '@nestjs/common';
import {CnSpacesController} from './cn-spaces.controller';
import {CnSpaceService} from './cn-space.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnSpace} from './cn-space.entity';
import {CnUsersModule} from '../cn-users/cn-users.module';
import {CnSpaceAggregateService} from './cn-space-aggregate.service';
import {CnSpaceAggregateSecurity} from './cn-space-aggregate-security.service';
import {CnSpaceUserService} from './cn-space-user.service';
import {CnSpaceUser} from './cn-space-user.entity';
import {CnSpaceInvit} from './cn-space-invit.entity';
import {CnSpaceInvitController} from './cn-space-invit.controller';
import {CnSpaceInvitService} from './cn-space-invit.service';
import {CnCoreModule} from '../cn-core/cn-core.module';
import {CnSpacesMailService} from './cn-spaces-mail.service';
import {CnObjectStoragesModule} from '../cn-object-storages/cn-object-storages.module';

/**
 * Module to manage spaces
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([CnSpace, CnSpaceUser, CnSpaceInvit]),

    CnUsersModule,
    CnCoreModule,
    CnObjectStoragesModule,
  ],
  controllers: [
    CnSpacesController,
    CnSpaceInvitController
  ],
  providers: [
    CnSpaceService,
    CnSpaceAggregateService,
    CnSpaceAggregateSecurity,
    CnSpaceUserService,
    CnSpaceInvitService,
    CnSpacesMailService,
  ],
  exports: [
    CnSpaceAggregateService,
    CnSpaceService,
    CnSpaceUserService,
  ]
})
export class CnSpacesModule {
}
