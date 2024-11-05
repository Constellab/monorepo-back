import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CnCoreModule } from '../../cn-core/cn-core.module';
import { CnServerCloud } from './cn-server-cloud.entity';
import { CnServerCloudService } from './cn-server-cloud.service';

@Module({
  imports: [TypeOrmModule.forFeature([CnServerCloud]), CnCoreModule],
  providers: [CnServerCloudService],
  exports: [CnServerCloudService],
})
export class CnServerCloudModule {}
