import { Module } from '@nestjs/common';
import { CnFoldersService } from './cn-folders.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CnCoreModule } from '../../cn-core/cn-core.module';
import { CnFolderEntity } from './cn-folder.entity';
import { CnFolderBucketService } from './cn-folder-bucket.service';
import { CnObjectStoragesModule } from '../../cn-object-storages/cn-object-storages.module';

@Module({
  imports: [TypeOrmModule.forFeature([CnFolderEntity]), CnCoreModule, CnObjectStoragesModule],
  providers: [CnFoldersService, CnFolderBucketService],
  exports: [CnFoldersService, CnFolderBucketService],
})
export class CnFoldersModule {}
