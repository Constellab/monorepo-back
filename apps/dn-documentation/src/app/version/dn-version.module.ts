import { Module } from '@nestjs/common';
import { DnVersionService } from './dn-version.service';
import { DnVersionController } from './dn-version.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DnVersion } from './dn-version.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DnVersion])],
  exports: [TypeOrmModule],
  controllers: [DnVersionController],
  providers: [DnVersionService]
})
export class DnVersionModule {}
