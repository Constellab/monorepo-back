import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnGroup, CnGroupOrganization, CnGroupSingleUser, CnGroupTeam, CnUserGroup} from './cn-group.entity';
import {CnGroupsService} from './cn-groups.service';
import {CnGroupsController} from './cn-groups.controller';
import {CnUsersModule} from '../cn-users/cn-users.module';
import {CnUserGroupService} from './cn-user-group.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CnGroup,
      CnGroupSingleUser,
      CnGroupOrganization,
      CnGroupTeam,
      CnUserGroup,
    ]),

    CnUsersModule,
  ],
  providers: [CnGroupsService, CnUserGroupService],
  controllers: [CnGroupsController],
  exports: [CnGroupsService]
})
export class CnGroupsModule {
}
