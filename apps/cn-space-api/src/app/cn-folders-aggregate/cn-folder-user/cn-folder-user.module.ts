import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CnCoreModule } from '../../cn-core/cn-core.module';
import { CnGroupsModule } from '../../cn-groups/cn-groups.module';
import { CnFolderUserEntity } from './cn-folder-user.entity';
import { CnFolderUserService } from './cn-folder-user.service';

@Module({
  imports: [TypeOrmModule.forFeature([CnFolderUserEntity]), CnCoreModule, CnGroupsModule],
  providers: [CnFolderUserService],
  exports: [CnFolderUserService],
})
export class CnFolderUserModule {}
