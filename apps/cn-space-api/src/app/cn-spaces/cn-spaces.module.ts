import { blTransportSpaceSpaceUserQueue } from '@monorepo/back-core-lib';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CnCoreModule } from '../cn-core/cn-core.module';
import { CnDocumentModule } from '../cn-folders-aggregate/cn-documents/cn-document.module';
import { CnObjectStoragesModule } from '../cn-object-storages/cn-object-storages.module';
import { CnUsersModule } from '../cn-users/cn-users.module';
import { CnSpaceEntity } from './cn-space.entity';
import { CnSpaceListener } from './cn-space.listener';
import { CnSpaceService } from './cn-space.service';
import { CnSpaceAggregateService } from './cn-space-aggregate.service';
import { CnSpaceAggregateSecurity } from './cn-space-aggregate-security.service';
import { CnSpaceInvitController } from './cn-space-invit.controller';
import { CnSpaceInvit } from './cn-space-invit.entity';
import { CnSpaceInvitService } from './cn-space-invit.service';
import { CnSpaceUserEntity } from './cn-space-user.entity';
import { CnSpaceUserService } from './cn-space-user.service';
import { CnSpacesController } from './cn-spaces.controller';
import { CnSpacesMailService } from './cn-spaces-mail.service';

/**
 * Module to manage spaces
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([CnSpaceEntity, CnSpaceUserEntity, CnSpaceInvit]),

    CnUsersModule,
    CnCoreModule,
    CnObjectStoragesModule,
    CnDocumentModule,

    EventEmitterModule,
    BullModule.registerQueue({
      name: blTransportSpaceSpaceUserQueue,
    }),
  ],
  controllers: [CnSpacesController, CnSpaceInvitController],
  providers: [
    CnSpaceService,
    CnSpaceAggregateService,
    CnSpaceAggregateSecurity,
    CnSpaceUserService,
    CnSpaceInvitService,
    CnSpacesMailService,
    CnSpaceListener,
  ],
  exports: [CnSpaceAggregateService, CnSpaceService, CnSpaceUserService],
})
export class CnSpacesModule {}
