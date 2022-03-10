import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnGroup, CnGroupOrganization, CnGroupSingleUser, CnGroupUsers, CnUserGroup} from './cn-group.entity';
import {CnGroupsService} from './cn-groups.service';
import {CnGroupsController} from './cn-groups.controller';
import {CnUsersModule} from '../cn-users/cn-users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CnGroup,
      CnGroupSingleUser,
      CnGroupOrganization,
      CnGroupUsers,
      CnUserGroup,
    ]),

    CnUsersModule,
  ],
  providers: [CnGroupsService],
  controllers: [CnGroupsController],
  exports: [CnGroupsService]
})
export class CnGroupsModule {
}
