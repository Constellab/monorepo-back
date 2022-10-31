import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnGroup, CnGroupSingleUser, CnGroupTeam, CnUserGroup} from './cn-group.entity';
import {CnGroupsService} from './cn-groups.service';
import {CnGroupsController} from './cn-groups.controller';
import {CnUsersModule} from '../cn-users/cn-users.module';
import {CnUserTeamService} from './cn-user-team.service';
import {CnOrganizationsModule} from '../cn-organizations/cn-organizations.module';
import {CnGroupsSecurity} from './cn-groups.security';
import {CnGroupsAggregateService} from './cn-groups-aggregate.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CnGroup,
      CnGroupSingleUser,
      CnGroupTeam,
      CnUserGroup,
    ]),

    CnUsersModule,
    CnOrganizationsModule,
  ],
  providers: [
    CnGroupsService,
    CnUserTeamService,
    CnGroupsSecurity,
    CnGroupsAggregateService,
  ],
  controllers: [CnGroupsController],
  exports: [
    CnGroupsService,
    CnGroupsAggregateService,

  ]
})
export class CnGroupsModule {
}
