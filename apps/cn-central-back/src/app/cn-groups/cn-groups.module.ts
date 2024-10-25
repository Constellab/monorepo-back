import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CnGroup, CnGroupSingleUser, CnGroupTeam, CnUserGroup } from './cn-group.entity';
import { CnGroupsService } from './cn-groups.service';
import { CnGroupsController } from './cn-groups.controller';
import { CnUserTeamService } from './cn-user-team.service';
import { CnSpacesModule } from '../cn-spaces/cn-spaces.module';
import { CnGroupsSecurity } from './cn-groups.security';
import { CnGroupsAggregateService } from './cn-groups-aggregate.service';
import { CnGroupListener } from './cn-group.listener';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CnGroup,
      CnGroupSingleUser,
      CnGroupTeam,
      CnUserGroup,
    ]),

    CnSpacesModule,
  ],
  providers: [
    CnGroupsService,
    CnUserTeamService,
    CnGroupsSecurity,
    CnGroupsAggregateService,
    CnGroupListener,
  ],
  controllers: [CnGroupsController],
  exports: [
    CnGroupsService,
    CnGroupsAggregateService,

  ]
})
export class CnGroupsModule {
}
