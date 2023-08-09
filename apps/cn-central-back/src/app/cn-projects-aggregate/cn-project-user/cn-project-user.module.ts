import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnCoreModule} from '../../cn-core/cn-core.module';
import {CnProjectUser} from './cn-project-user.entity';
import {CnProjectUserService} from './cn-project-user.service';
import {CnGroupsModule} from '../../cn-groups/cn-groups.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnProjectUser]),

    CnCoreModule,
    CnGroupsModule,
  ],
  providers: [CnProjectUserService],
  exports: [CnProjectUserService]
})
export class CnProjectUserModule {

}
