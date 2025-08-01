import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CnCoreModule } from '../../cn-core/cn-core.module';
import { CnObjectStoragesModule } from '../../cn-object-storages/cn-object-storages.module';
import { CnFolderEntity } from './cn-folder.entity';
import { CnFolderBucketService } from './cn-folder-bucket.service';
import { CnFoldersService } from './cn-folders.service';

@Module({
  imports: [TypeOrmModule.forFeature([CnFolderEntity]), CnCoreModule, CnObjectStoragesModule],
  providers: [CnFoldersService, CnFolderBucketService],
  exports: [CnFoldersService, CnFolderBucketService],
})
export class CnFoldersModule {}
