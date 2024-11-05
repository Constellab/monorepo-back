import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CnCoreModule } from '../../cn-core/cn-core.module';
import { CnStoragePrice } from './cn-storage-price.entity';
import { CnStoragePriceService } from './cn-storage-price.service';

@Module({
  imports: [TypeOrmModule.forFeature([CnStoragePrice]), CnCoreModule],
  providers: [CnStoragePriceService],
  exports: [CnStoragePriceService],
})
export class CnStoragePriceModule {}
