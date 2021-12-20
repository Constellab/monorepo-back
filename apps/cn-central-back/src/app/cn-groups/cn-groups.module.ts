import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnGroup, CnGroupOrganization, CnGroupSingleUser, CnGroupUsers} from './cn-group.entity';
import {CnGroupsService} from './cn-groups.service';
import {CnGroupsController} from './cn-groups.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnGroup, CnGroupSingleUser, CnGroupOrganization, CnGroupUsers])
  ],
  providers: [CnGroupsService],
  controllers: [CnGroupsController]
})
export class CnGroupsModule {
}
