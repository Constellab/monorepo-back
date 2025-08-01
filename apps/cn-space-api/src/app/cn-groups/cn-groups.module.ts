import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CnSpacesModule } from '../cn-spaces/cn-spaces.module';
import { CnGroup, CnGroupSingleUser, CnGroupTeam, CnUserGroup } from './cn-group.entity';
import { CnGroupListener } from './cn-group.listener';
import { CnGroupsController } from './cn-groups.controller';
import { CnGroupsSecurity } from './cn-groups.security';
import { CnGroupsService } from './cn-groups.service';
import { CnGroupsAggregateService } from './cn-groups-aggregate.service';
import { CnUserTeamService } from './cn-user-team.service';

@Module({
  imports: [TypeOrmModule.forFeature([CnGroup, CnGroupSingleUser, CnGroupTeam, CnUserGroup]), CnSpacesModule],
  providers: [
    CnGroupsService,
    CnUserTeamService,
    CnGroupsSecurity,
    CnGroupsAggregateService,
    CnGroupListener,
  ],
  controllers: [CnGroupsController],
  exports: [CnGroupsService, CnGroupsAggregateService],
})
export class CnGroupsModule {}
