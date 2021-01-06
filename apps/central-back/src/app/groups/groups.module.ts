import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Group, GroupOrganization, GroupSingleUser, GroupUsers} from './group.entity';
import {GroupsService} from './groups.service';
import {GroupsController} from './groups.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Group, GroupSingleUser, GroupOrganization, GroupUsers])
  ],
  providers: [GroupsService],
  controllers: [GroupsController]
})
export class GroupsModule {
}
