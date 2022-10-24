import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnGroup, CnGroupSingleUser, CnGroupTeam, CnUserGroup} from './cn-group.entity';
import {CnGroupsService} from './cn-groups.service';
import {CnGroupsController} from './cn-groups.controller';
import {CnUsersModule} from '../cn-users/cn-users.module';
import {CnUserGroupService} from './cn-user-group.service';
import {CnOrganizationsModule} from '../cn-organizations/cn-organizations.module';

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
  providers: [CnGroupsService, CnUserGroupService],
  controllers: [CnGroupsController],
  exports: [CnGroupsService]
})
export class CnGroupsModule {
}
